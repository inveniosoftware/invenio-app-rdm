# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2021 CERN.
# Copyright (C) 2019-2021 Northwestern University.
# Copyright (C)      2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Routes for record-related pages provided by Invenio-App-RDM."""

from flask import current_app, render_template
from flask_login import login_required
from invenio_access.permissions import system_identity
from invenio_i18n.ext import current_i18n
from invenio_rdm_records.proxies import current_rdm_records
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_rdm_records.services.schemas import RDMRecordSchema
from invenio_rdm_records.services.schemas.utils import dump_empty
from invenio_vocabularies.proxies import current_service as vocabulary_service
from invenio_vocabularies.records.models import VocabularyScheme
from marshmallow_utils.fields.babel import gettext_from_dict
from sqlalchemy.orm import load_only

from ..utils import set_default_value
from .decorators import pass_draft, pass_draft_files


#
# Helpers
#
def get_form_pids_config():
    """Prepare configuration for the pids field."""
    service = current_rdm_records.records_service
    pids_providers = []
    for scheme, providers in service.config.pids_providers.items():
        can_be_managed = False
        can_be_unmanaged = False
        provider_enabled = False
        for name, provider_attrs in providers.items():
            is_enabled = provider_attrs.get("enabled", True)
            if not provider_enabled and is_enabled:
                provider_enabled = True

            if provider_attrs["system_managed"]:
                can_be_managed = True
            else:
                can_be_unmanaged = True

        # all providers disabled for this scheme
        if not provider_enabled:
            continue

        u_scheme = scheme.upper()

        pids_provider = {
            "scheme": scheme,
            "pid_label": u_scheme,
            "pid_placeholder": "10.1234/datacite.123456",
            "can_be_managed": can_be_managed,
            "can_be_unmanaged": can_be_unmanaged,
            "btn_label_get_pid": f"Get a {u_scheme} now!",
            "managed_help_text": f"Reserve a {u_scheme} or leave this "
                                 "field blank to have one automatically "
                                 "assigned when publishing.",
            "unmanaged_help_text": f"Copy and paste here your {u_scheme}",
        }
        pids_providers.append(pids_provider)
    return pids_providers


def _dump_resource_type_vocabulary():
    """Dump resource type vocabulary."""
    results = vocabulary_service.read_all(
        system_identity, fields=["id", "props"], type='resourcetypes')
    return [
        {
            "icon": r["props"].get("type_icon", ""),
            "id": r["id"],
            "subtype_name": r["props"].get("subtype_name", ""),
            "type_name": r["props"]["type_name"],
        } for r in results.to_dict()["hits"]["hits"]
    ]


def _dump_subjects_vocabulary():
    """Dump subjects vocabulary (limitTo really)."""
    subjects = (
        VocabularyScheme.query
        .filter_by(parent_id="subjects")
        .options(load_only("id"))
        .all()
    )
    limit_to = [{"text": "All", "value": "all"}]
    # id is human readable and shorter, so we use it
    limit_to += [{"text": s.id, "value": s.id} for s in subjects]
    return {
        "limit_to": limit_to
    }


def _dump_vocabulary_w_basic_fields(vocabulary_type):
    """Dump vocabulary with id and title field."""
    results = vocabulary_service.read_all(
        system_identity, fields=["id", "title"], type=vocabulary_type)
    return [
        {
            "text": gettext_from_dict(
                r["title"], current_i18n.locale,
                current_app.config.get('BABEL_DEFAULT_LOCALE', 'en')
            ),
            "value": r["id"],
        } for r in results.to_dict()["hits"]["hits"]
    ]


def _dump_title_types_vocabulary():
    """Dump title type vocabulary."""
    return _dump_vocabulary_w_basic_fields('titletypes')


def _dump_creators_role_vocabulary():
    """Dump creators role vocabulary."""
    return _dump_vocabulary_w_basic_fields('creatorsroles')


def _dump_contributors_role_vocabulary():
    """Dump contributors role vocabulary."""
    return _dump_vocabulary_w_basic_fields('contributorsroles')


def _dump_description_types_vocabulary():
    """Dump description type vocabulary."""
    return _dump_vocabulary_w_basic_fields('descriptiontypes')


def _dump_date_types_vocabulary():
    """Dump date type vocabulary."""
    return _dump_vocabulary_w_basic_fields('datetypes')


def _dump_relation_types_vocabulary():
    """Dump relation type vocabulary."""
    return _dump_vocabulary_w_basic_fields('relationtypes')

def _dump_identifier_schemes_label():
    """Dump identifiers schemes labels."""
    ids = current_app.config["RDM_RECORDS_IDENTIFIERS_SCHEMES"]
    labelled_ids = []

    for scheme, values in ids.items():
        labelled_ids.append({"text": values["label"], "value": scheme})

    return labelled_ids


def get_form_config(**kwargs):
    """Get the react form configuration."""
    vocabularies = {}
    # TODO: Nest vocabularies inside "metadata" key so that frontend dumber
    vocabularies["resource_type"] = _dump_resource_type_vocabulary()

    vocabularies["subjects"] = _dump_subjects_vocabulary()
    vocabularies["titles"] = dict(
        type=_dump_title_types_vocabulary()
    )
    vocabularies["creators"] = dict(role=_dump_creators_role_vocabulary())
    vocabularies["contributors"] = dict(
        role=_dump_contributors_role_vocabulary()
    )
    vocabularies["descriptions"] = dict(
        type=_dump_description_types_vocabulary()
    )
    vocabularies["dates"] = dict(
        type=_dump_date_types_vocabulary()
    )
    vocabularies["relation_type"] = _dump_relation_types_vocabulary()

    vocabularies["identifiers"] = {
        "relations": vocabularies["relation_type"],
        "resource_type": vocabularies["resource_type"],
        "scheme": _dump_identifier_schemes_label()
    }

    return dict(
        vocabularies=vocabularies,
        current_locale=str(current_i18n.locale),
        default_locale=current_app.config.get('BABEL_DEFAULT_LOCALE', 'en'),
        pids=get_form_pids_config(),
        **kwargs
    )


def get_search_url():
    """Get the search URL."""
    # TODO: this should not be used
    return current_app.config["APP_RDM_ROUTES"]["record_search"]


def new_record():
    """Create an empty record with default values."""
    record = dump_empty(RDMRecordSchema)
    record["files"] = {"enabled": True}
    defaults = current_app.config.get("APP_RDM_DEPOSIT_FORM_DEFAULTS") or {}
    for key, value in defaults.items():
        set_default_value(record, value, key)
    return record


#
# Views
#
@login_required
def deposit_search():
    """List of user deposits page."""
    return render_template(
        "invenio_app_rdm/records/search_deposit.html",
        searchbar_config=dict(searchUrl=get_search_url()),
    )


@login_required
def deposit_create():
    """Create a new deposit."""
    return render_template(
        "invenio_app_rdm/records/deposit.html",
        forms_config=get_form_config(createUrl=("/api/records")),
        searchbar_config=dict(searchUrl=get_search_url()),
        record=new_record(),
        files=dict(
            default_preview=None, entries=[], links={}
        ),
    )


@login_required
@pass_draft
@pass_draft_files
def deposit_edit(draft=None, draft_files=None, pid_value=None):
    """Edit an existing deposit."""
    serializer = UIJSONSerializer()
    record = serializer.serialize_object_to_dict(draft.to_dict())

    return render_template(
        "invenio_app_rdm/records/deposit.html",
        forms_config=get_form_config(apiUrl=f"/api/records/{pid_value}/draft"),
        record=record,
        files=draft_files.to_dict(),
        searchbar_config=dict(searchUrl=get_search_url()),
        permissions=draft.has_permissions_to(['new_version'])
    )
