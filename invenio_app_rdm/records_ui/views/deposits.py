# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2024 CERN.
# Copyright (C) 2019-2021 Northwestern University.
# Copyright (C)      2021 TU Wien.
# Copyright (C) 2022 KTH Royal Institute of Technology
# Copyright (C) 2023 Graz University of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Routes for record-related pages provided by Invenio-App-RDM."""

from copy import deepcopy

from flask import current_app, g, redirect
from flask_login import login_required
from invenio_communities.errors import CommunityDeletedError
from invenio_communities.proxies import current_communities
from invenio_communities.views.communities import render_community_theme_template
from invenio_i18n import lazy_gettext as _
from invenio_i18n.ext import current_i18n
from invenio_rdm_records.proxies import current_rdm_records
from invenio_rdm_records.records.api import get_files_quota
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_rdm_records.services.schemas import RDMRecordSchema
from invenio_rdm_records.services.schemas.utils import dump_empty
from invenio_records_resources.services.errors import PermissionDeniedError
from invenio_search.engine import dsl
from invenio_vocabularies.proxies import current_service as vocabulary_service
from invenio_vocabularies.records.models import VocabularyScheme
from marshmallow_utils.fields.babel import gettext_from_dict
from sqlalchemy.orm import load_only

from ..utils import set_default_value
from .decorators import (
    pass_draft,
    pass_draft_community,
    pass_draft_files,
    secret_link_or_login_required,
)
from .filters import get_scheme_label


#
# Helpers
#
def get_form_pids_config():
    """Prepare configuration for the pids field.

    Currently supporting only doi.
    """
    service = current_rdm_records.records_service
    pids_providers = []
    # FIXME: User provider.is_managed() requires tiny fix in config
    can_be_managed = True
    can_be_unmanaged = True
    for scheme in service.config.pids_providers.keys():
        if not scheme == "doi":
            continue
        record_pid_config = current_app.config["RDM_PERSISTENT_IDENTIFIERS"]
        scheme_label = record_pid_config.get(scheme, {}).get("label", scheme)
        pids_provider = {
            "scheme": scheme,
            "field_label": "Digital Object Identifier",
            "pid_label": "DOI",
            "pid_placeholder": "Copy/paste your existing DOI here...",
            "can_be_managed": can_be_managed,
            "can_be_unmanaged": can_be_unmanaged,
            "btn_label_discard_pid": _("Discard the reserved {scheme_label}.").format(
                scheme_label=scheme_label
            ),
            "btn_label_get_pid": _("Get a {scheme_label} now!").format(
                scheme_label=scheme_label
            ),
            "managed_help_text": _(
                "Reserve a {scheme_label} by pressing the button "
                "(so it can be included in files prior to upload). "
                "The {scheme_label} is registered when your upload is published."
            ).format(scheme_label=scheme_label),
            "unmanaged_help_text": _(
                "A {scheme_label} allows your upload to be easily and "
                "unambiguously cited. Example: 10.1234/foo.bar"
            ).format(scheme_label=scheme_label),
        }
        pids_providers.append(pids_provider)

    return pids_providers


def get_record_permissions(actions, record=None):
    """Helper for generating (default) record action permissions."""
    service = current_rdm_records.records_service
    return {
        f"can_{action}": service.check_permission(g.identity, action, record=record)
        for action in actions
    }


class VocabulariesOptions:
    """Holds React form vocabularies options."""

    def __init__(self):
        """Constructor."""
        self._vocabularies = {}

    # Utilities
    def _get_label(self, hit):
        """Return label (translated title) of hit."""
        return gettext_from_dict(
            hit["title"],
            current_i18n.locale,
            current_app.config.get("BABEL_DEFAULT_LOCALE", "en"),
        )

    def _get_type_subtype_label(self, hit, type_labels):
        """Return (type, subtype) pair for this hit."""
        id_ = hit["id"]
        type_ = hit.get("props", {}).get("type")

        if id_ == type_:
            # dataset-like case
            return (self._get_label(hit), "")
        elif type_ not in type_labels:
            # safety net to generate a valid type, subtype and not break search
            return (self._get_label(hit), "")
        else:
            return (type_labels[type_], self._get_label(hit))

    def _resource_types(self, extra_filter):
        """Dump resource type vocabulary."""
        type_ = "resourcetypes"
        all_resource_types = vocabulary_service.read_all(
            g.identity,
            fields=["id", "props", "title", "icon"],
            type=type_,
            # Sorry, we have over 100+ resource types entry at NU actually
            max_records=150,
        )
        type_labels = {
            hit["id"]: self._get_label(hit)
            for hit in all_resource_types.to_dict()["hits"]["hits"]
        }
        subset_resource_types = vocabulary_service.read_all(
            g.identity,
            fields=["id", "props", "title", "icon"],
            type=type_,
            extra_filter=extra_filter,
            # Sorry, we have over 100+ resource types entry at NU actually
            max_records=150,
        )

        return [
            {
                "icon": hit.get("icon", ""),
                "id": hit["id"],
                "subtype_name": self._get_type_subtype_label(hit, type_labels)[1],
                "type_name": self._get_type_subtype_label(hit, type_labels)[0],
            }
            for hit in subset_resource_types.to_dict()["hits"]["hits"]
        ]

    def _dump_vocabulary_w_basic_fields(self, vocabulary_type):
        """Dump vocabulary with id and title field."""
        results = vocabulary_service.read_all(
            g.identity, fields=["id", "title"], type=vocabulary_type
        )
        return [
            {
                "text": self._get_label(hit),
                "value": hit["id"],
            }
            for hit in results.to_dict()["hits"]["hits"]
        ]

    # Vocabularies
    def depositable_resource_types(self):
        """Return depositable resource type options (value, label) pairs."""
        self._vocabularies["resource_type"] = self._resource_types(
            dsl.Q("term", tags="depositable")
        )
        return self._vocabularies["resource_type"]

    def subjects(self):
        """Dump subjects vocabulary (limitTo really)."""
        subjects = (
            VocabularyScheme.query.filter_by(parent_id="subjects")
            .options(load_only("id"))
            .all()
        )
        limit_to = [{"text": "All", "value": "all"}]
        # id is human readable and shorter, so we use it
        limit_to += [{"text": s.id, "value": s.id} for s in subjects]

        self._vocabularies["subjects"] = {"limit_to": limit_to}
        return self._vocabularies["subjects"]

    def title_types(self):
        """Dump title type vocabulary."""
        self._vocabularies["titles"] = dict(
            type=self._dump_vocabulary_w_basic_fields("titletypes")
        )
        return self._vocabularies["titles"]

    def creator_roles(self):
        """Dump creators role vocabulary."""
        self._vocabularies["creators"] = dict(
            role=self._dump_vocabulary_w_basic_fields("creatorsroles")
        )
        return self._vocabularies["creators"]

    def contributor_roles(self):
        """Dump contributors role vocabulary."""
        self._vocabularies["contributors"] = dict(
            role=self._dump_vocabulary_w_basic_fields("contributorsroles")
        )
        return self._vocabularies["contributors"]

    def description_types(self):
        """Dump description type vocabulary."""
        self._vocabularies["descriptions"] = dict(
            type=self._dump_vocabulary_w_basic_fields("descriptiontypes")
        )
        return self._vocabularies["descriptions"]

    def date_types(self):
        """Dump date type vocabulary."""
        self._vocabularies["dates"] = dict(
            type=self._dump_vocabulary_w_basic_fields("datetypes")
        )
        return self._vocabularies["dates"]

    def relation_types(self):
        """Dump relation type vocabulary."""
        return self._dump_vocabulary_w_basic_fields("relationtypes")

    def linkable_resource_types(self):
        """Dump linkable resource type vocabulary."""
        return self._resource_types(dsl.Q("term", tags="linkable"))

    def identifier_schemes(self):
        """Dump identifiers scheme (fake) vocabulary.

        "Fake" because identifiers scheme is not a vocabulary.
        """
        return [
            {"text": get_scheme_label(scheme), "value": scheme}
            for scheme in current_app.config.get("RDM_RECORDS_IDENTIFIERS_SCHEMES", {})
        ]

    def identifiers(self):
        """Dump related identifiers vocabulary."""
        self._vocabularies["identifiers"] = {
            "relations": self.relation_types(),
            "resource_type": self.linkable_resource_types(),
            "scheme": self.identifier_schemes(),
        }

    def dump(self):
        """Dump into dict."""
        # TODO: Nest vocabularies inside "metadata" key so that frontend dumber
        self.depositable_resource_types()
        self.title_types()
        self.creator_roles()
        self.description_types()
        self.date_types()
        self.contributor_roles()
        self.subjects()
        self.identifiers()
        # We removed
        # vocabularies["relation_type"] = _dump_relation_types_vocabulary()
        return self._vocabularies


def load_custom_fields():
    """Load custom fields configuration."""
    conf = current_app.config
    conf_ui = conf.get("RDM_CUSTOM_FIELDS_UI", [])
    conf_backend = {cf.name: cf for cf in conf.get("RDM_CUSTOM_FIELDS", [])}
    _vocabulary_fields = []
    error_labels = {}

    for section_cfg in conf_ui:
        fields = section_cfg["fields"]
        for field in fields:
            field_instance = conf_backend.get(field["field"])
            # Compute the dictionary to map field path to error labels
            # for each custom field. This is the label shown at the top of the upload
            # form
            field_error_label = field.get("props", {}).get("label")
            if field_error_label:
                error_labels[f"custom_fields.{field['field']}"] = field_error_label
            if getattr(field_instance, "relation_cls", None):
                # add vocabulary options to field's properties
                field["props"]["options"] = field_instance.options(g.identity)
                # mark field as vocabulary
                field["is_vocabulary"] = True
                _vocabulary_fields.append(field["field"])
    return {
        "ui": conf_ui,
        "vocabularies": _vocabulary_fields,
        "error_labels": error_labels,
    }


def get_user_communities_memberships():
    """Return current identity communities memberships."""
    memberships = current_communities.service.members.read_memberships(g.identity)
    return {id: role for (id, role) in memberships["memberships"]}


def get_form_config(**kwargs):
    """Get the react form configuration."""
    conf = current_app.config
    custom_fields = load_custom_fields()
    # keep only upload form configurable custom fields
    custom_fields["ui"] = [
        cf for cf in custom_fields["ui"] if not cf.get("hide_from_upload_form", False)
    ]
    quota = deepcopy(conf.get("APP_RDM_DEPOSIT_FORM_QUOTA", {}))
    record_quota = kwargs.pop("quota", None)
    if record_quota:
        quota["maxStorage"] = record_quota["quota_size"]

    return dict(
        vocabularies=VocabulariesOptions().dump(),
        autocomplete_names=conf.get(
            "APP_RDM_DEPOSIT_FORM_AUTOCOMPLETE_NAMES", "search"
        ),
        current_locale=str(current_i18n.locale),
        default_locale=conf.get("BABEL_DEFAULT_LOCALE", "en"),
        pids=get_form_pids_config(),
        quota=quota,
        decimal_size_display=conf.get("APP_RDM_DISPLAY_DECIMAL_FILE_SIZES", True),
        links=dict(
            user_dashboard_request=conf["RDM_REQUESTS_ROUTES"][
                "user-dashboard-request-details"
            ]
        ),
        user_communities_memberships=get_user_communities_memberships(),
        custom_fields=custom_fields,
        publish_modal_extra=current_app.config.get(
            "APP_RDM_DEPOSIT_FORM_PUBLISH_MODAL_EXTRA"
        ),
        **kwargs,
    )


def get_search_url():
    """Get the search URL."""
    # TODO: this should not be used
    return current_app.config["APP_RDM_ROUTES"]["record_search"]


def new_record():
    """Create an empty record with default values."""
    record = dump_empty(RDMRecordSchema)
    record["files"] = {"enabled": current_app.config.get("RDM_DEFAULT_FILES_ENABLED")}
    if "doi" in current_rdm_records.records_service.config.pids_providers:
        record["pids"] = {"doi": {"provider": "external", "identifier": ""}}
    else:
        record["pids"] = {}
    record["status"] = "draft"
    defaults = current_app.config.get("APP_RDM_DEPOSIT_FORM_DEFAULTS") or {}
    for key, value in defaults.items():
        set_default_value(record, value, key)
    return record


#
# Views
#
@login_required
@pass_draft_community
def deposit_create(community=None):
    """Create a new deposit."""
    can_create = current_rdm_records.records_service.check_permission(
        g.identity, "create"
    )
    if not can_create:
        raise PermissionDeniedError()

    community_theme = None
    if community is not None:
        community_theme = community.get("theme", {})

    community_use_jinja_header = bool(community_theme)

    return render_community_theme_template(
        current_app.config["APP_RDM_DEPOSIT_FORM_TEMPLATE"],
        theme=community_theme,
        forms_config=get_form_config(
            createUrl="/api/records",
            quota=get_files_quota(),
            hide_community_selection=community_use_jinja_header,
        ),
        searchbar_config=dict(searchUrl=get_search_url()),
        record=new_record(),
        community=community,
        community_use_jinja_header=community_use_jinja_header,
        files=dict(default_preview=None, entries=[], links={}),
        preselectedCommunity=community,
        files_locked=False,
        permissions=get_record_permissions(
            [
                "manage",
                "manage_files",
                "delete_draft",
                "manage_record_access",
            ]
        ),
    )


@secret_link_or_login_required()
@pass_draft(expand=True)
@pass_draft_files
def deposit_edit(pid_value, draft=None, draft_files=None, files_locked=True):
    """Edit an existing deposit."""
    # don't show draft's deposit form if the user can't edit it
    service = current_rdm_records.records_service
    can_edit_draft = service.check_permission(
        g.identity, "update_draft", record=draft._record
    )
    if not can_edit_draft:
        raise PermissionDeniedError()

    files_dict = None if draft_files is None else draft_files.to_dict()
    ui_serializer = UIJSONSerializer()
    record = ui_serializer.dump_obj(draft.to_dict())

    community_theme = None
    community = record.get("expanded", {}).get("parent", {}).get("review", {}).get(
        "receiver"
    ) or record.get("expanded", {}).get("parent", {}).get("communities", {}).get(
        "default"
    )

    if community:
        # TODO: handle deleted community
        try:
            community = current_communities.service.read(
                id_=community["id"], identity=g.identity
            )
            community_theme = community.to_dict().get("theme", {})
        except CommunityDeletedError:
            pass

    # show the community branded header when there is a theme and record is published
    # for unpublished records we fallback to the react component so users can change
    # communities
    community_use_jinja_header = bool(community_theme)

    return render_community_theme_template(
        current_app.config["APP_RDM_DEPOSIT_FORM_TEMPLATE"],
        theme=community_theme,
        forms_config=get_form_config(
            apiUrl=f"/api/records/{pid_value}/draft",
            # maybe quota should be serialized into the record e.g for admins
            quota=get_files_quota(draft._record),
            # hide react community component
            hide_community_selection=community_use_jinja_header,
        ),
        record=record,
        community=community,
        community_use_jinja_header=community_use_jinja_header,
        files=files_dict,
        searchbar_config=dict(searchUrl=get_search_url()),
        files_locked=files_locked,
        permissions=draft.has_permissions_to(
            [
                "manage",
                "new_version",
                "delete_draft",
                "manage_files",
                "manage_record_access",
            ]
        ),
    )


def community_upload(pid_value):
    """Redirection for upload to community."""
    routes = current_app.config.get("APP_RDM_ROUTES")
    return redirect(f"{routes['deposit_create']}?community={pid_value}")
