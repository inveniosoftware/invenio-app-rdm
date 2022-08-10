# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2021 CERN.
# Copyright (C) 2019-2021 Northwestern University.
# Copyright (C)      2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Routes for record-related pages provided by Invenio-App-RDM."""

from flask import current_app, g, render_template
from flask_babelex import lazy_gettext as _
from flask_login import login_required
from invenio_i18n.ext import current_i18n
from invenio_rdm_records.proxies import current_rdm_records
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_rdm_records.services.schemas import RDMRecordSchema
from invenio_rdm_records.services.schemas.utils import dump_empty
from invenio_search.engine import dsl
from invenio_vocabularies.proxies import current_service as vocabulary_service
from invenio_vocabularies.records.models import VocabularyScheme
from invenio_vocabularies.services.custom_fields import VocabularyCF
from marshmallow_utils.fields.babel import gettext_from_dict
from sqlalchemy.orm import load_only

from ..utils import set_default_value
from .decorators import pass_draft, pass_draft_community, pass_draft_files
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
                "subtype_name": self._get_type_subtype_label(hit, type_labels)[
                    1
                ],  # noqa
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


def get_form_config(**kwargs):
    """Get the react form configuration."""
    conf = current_app.config
    return dict(
        vocabularies=VocabulariesOptions().dump(),
        autocomplete_names=conf.get(
            "APP_RDM_DEPOSIT_FORM_AUTOCOMPLETE_NAMES", "search"
        ),
        current_locale=str(current_i18n.locale),
        default_locale=conf.get("BABEL_DEFAULT_LOCALE", "en"),
        pids=get_form_pids_config(),
        quota=conf.get("APP_RDM_DEPOSIT_FORM_QUOTA"),
        decimal_size_display=conf.get("APP_RDM_DISPLAY_DECIMAL_FILE_SIZES", True),
        links=dict(
            user_dashboard_request=conf["RDM_REQUESTS_ROUTES"][
                "user-dashboard-request-details"
            ]
        ),
        custom_fields=load_custom_fields(),
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
    record["files"] = {"enabled": True}
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
    return render_template(
        "invenio_app_rdm/records/deposit.html",
        forms_config=get_form_config(createUrl="/api/records"),
        searchbar_config=dict(searchUrl=get_search_url()),
        record=new_record(),
        files=dict(default_preview=None, entries=[], links={}),
        preselectedCommunity=community,
    )


@login_required
@pass_draft(expand=True)
@pass_draft_files
def deposit_edit(pid_value, draft=None, draft_files=None):
    """Edit an existing deposit."""
    files_dict = None if draft_files is None else draft_files.to_dict()
    ui_serializer = UIJSONSerializer()
    record = ui_serializer.dump_obj(draft.to_dict())

    return render_template(
        "invenio_app_rdm/records/deposit.html",
        forms_config=get_form_config(apiUrl=f"/api/records/{pid_value}/draft"),
        record=record,
        files=files_dict,
        searchbar_config=dict(searchUrl=get_search_url()),
        permissions=draft.has_permissions_to(["new_version", "delete_draft"]),
    )
