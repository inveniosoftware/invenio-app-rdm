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
from flask_login import login_required
from invenio_i18n.ext import current_i18n
from invenio_rdm_records.resources.config import RDMDraftFilesResourceConfig
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_rdm_records.services import RDMDraftFilesService
from invenio_rdm_records.services.schemas import RDMRecordSchema
from invenio_rdm_records.services.schemas.utils import dump_empty
from invenio_rdm_records.vocabularies import Vocabularies

from ..utils import set_default_value
from .decorators import pass_draft, service


#
# Helpers
#
def get_form_config(**kwargs):
    """Get the react form configration."""
    return dict(
        vocabularies=Vocabularies.dump(),
        current_locale=str(current_i18n.locale),
        **kwargs
    )


def get_search_url():
    """Get the search URL."""
    # TODO: this should not be used
    return current_app.config["APP_RDM_ROUTES"]["record_search"]


def new_record():
    """Create an empty record with default values."""
    record = dump_empty(RDMRecordSchema)
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
            default_preview=None, enabled=True, entries=[], links={}
        ),
    )


@login_required
@pass_draft
def deposit_edit(draft=None, pid_value=None):
    """Edit an existing deposit."""
    # TODO: should be embedded in record service
    files_service = RDMDraftFilesService()
    files_list = files_service.list_files(
        id_=pid_value,
        identity=g.identity,
        links_config=RDMDraftFilesResourceConfig.links_config,
    )

    # TODO: Remove - all this should happen in service
    # Dereference relations (languages, licenses, etc.)
    draft._record.relations.dereference()
    serializer = UIJSONSerializer()
    record = serializer.serialize_object_to_dict(draft.to_dict())

    # TODO: get the `is_published` field when reading the draft
    from invenio_pidstore.errors import PIDUnregistered
    try:
        service().draft_cls.pid.resolve(pid_value, registered_only=True)
        record["is_published"] = True
    except PIDUnregistered:
        record["is_published"] = False

    return render_template(
        "invenio_app_rdm/records/deposit.html",
        forms_config=get_form_config(apiUrl=f"/api/records/{pid_value}/draft"),
        record=record,
        files=files_list.to_dict(),
        searchbar_config=dict(searchUrl=get_search_url()),
    )
