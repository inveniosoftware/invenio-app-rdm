# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
# Copyright (C)      2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Routes for record-related pages provided by Invenio-App-RDM."""

from flask import current_app, g, render_template
from invenio_i18n.ext import current_i18n
from invenio_rdm_records.resources.config import RDMDraftFilesResourceConfig, \
    RDMDraftResourceConfig
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_rdm_records.services import RDMDraftFilesService
from invenio_rdm_records.services.schemas import RDMRecordSchema
from invenio_rdm_records.services.schemas.utils import dump_empty
from invenio_rdm_records.vocabularies import Vocabularies

from ..utils import set_default_value


def register_deposits_ui_routes(app, blueprint):
    """Dynamically registers routes (allows us to rely on config)."""
    service = app.extensions["invenio-rdm-records"].records_service
    search_url = app.config.get("RDM_RECORDS_UI_SEARCH_URL", "/search")

    @blueprint.route(
        app.config.get("RDM_RECORDS_UI_SEARCH_USER_URL", "/uploads")
    )
    def deposits_user():
        """List of user deposits page."""
        return render_template(
            current_app.config["DEPOSITS_UPLOADS_TEMPLATE"],
            searchbar_config=dict(searchUrl=search_url),
        )

    @blueprint.route(app.config.get("RDM_RECORDS_UI_NEW_URL", "/uploads/new"))
    def deposits_create():
        """Record creation page."""
        forms_config = dict(
            createUrl=("/api/records"),
            vocabularies=Vocabularies.dump(),
            current_locale=str(current_i18n.locale),
        )

        new_record = dump_empty(RDMRecordSchema)
        defaults = app.config.get("APP_RDM_DEPOSIT_FORM_DEFAULTS") or {}
        for key, value in defaults.items():
            set_default_value(new_record, value, key)

        return render_template(
            current_app.config["DEPOSITS_FORMS_BASE_TEMPLATE"],
            forms_config=forms_config,
            record=new_record,
            files=dict(
                default_preview=None, enabled=True, entries=[], links={}
            ),
            searchbar_config=dict(searchUrl=search_url),
        )

    @blueprint.route(
        app.config.get("RDM_RECORDS_UI_EDIT_URL", "/uploads/<pid_value>")
    )
    def deposits_edit(pid_value):
        """Deposit edit page."""
        links_config = RDMDraftResourceConfig.links_config
        draft = service.read_draft(
            id_=pid_value, identity=g.identity, links_config=links_config
        )

        files_service = RDMDraftFilesService()
        files_list = files_service.list_files(
            id_=pid_value,
            identity=g.identity,
            links_config=RDMDraftFilesResourceConfig.links_config,
        )

        forms_config = dict(
            apiUrl=f"/api/records/{pid_value}/draft",
            vocabularies=Vocabularies.dump(),
            current_locale=str(current_i18n.locale),
        )

        # Dereference relations (languages, licenses, etc.)
        draft._record.relations.dereference()
        serializer = UIJSONSerializer()
        record = serializer.serialize_object_to_dict(draft.to_dict())

        # TODO: get the `is_published` field when reading the draft
        from invenio_pidstore.errors import PIDUnregistered

        try:
            service.draft_cls.pid.resolve(pid_value, registered_only=True)
            record["is_published"] = True
        except PIDUnregistered:
            record["is_published"] = False

        return render_template(
            current_app.config["DEPOSITS_FORMS_BASE_TEMPLATE"],
            forms_config=forms_config,
            record=record,
            files=files_list.to_dict(),
            searchbar_config=dict(searchUrl=search_url),
        )

    return blueprint
