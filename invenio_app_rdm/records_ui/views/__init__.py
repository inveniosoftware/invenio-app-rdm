# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2021 CERN.
# Copyright (C) 2019-2022 Northwestern University.
# Copyright (C)      2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Views related to records and deposits."""

from flask import Blueprint
from invenio_pidstore.errors import PIDDeletedError, PIDDoesNotExistError, \
    PIDUnregistered
from invenio_records_resources.services.errors import PermissionDeniedError

from ..searchapp import search_app_context
from .deposits import deposit_create, deposit_edit
from .filters import can_list_files, get_scheme_label, has_previewable_files, \
    make_files_preview_compatible, order_entries, pid_url, \
    select_preview_file, to_previewer_files
from .records import not_found_error, record_detail, record_export, \
    record_file_download, record_file_preview, record_from_pid, \
    record_latest, record_permission_denied_error, record_tombstone_error


#
# Registration
#
def create_blueprint(app):
    """Register blueprint routes on app."""
    routes = app.config.get("APP_RDM_ROUTES")

    blueprint = Blueprint(
        "invenio_app_rdm_records",
        __name__,
        template_folder="../templates",
    )

    # Record URL rules
    blueprint.add_url_rule(
        routes["record_detail"],
        view_func=record_detail,
    )

    blueprint.add_url_rule(
        routes["record_latest"],
        view_func=record_latest,
    )

    rdm_records_ext = app.extensions['invenio-rdm-records']
    schemes = rdm_records_ext.records_service.config.pids_providers.keys()
    schemes = ','.join(schemes)
    if schemes:
        blueprint.add_url_rule(
            routes["record_from_pid"].format(schemes=schemes),
            view_func=record_from_pid,
        )

    blueprint.add_url_rule(
        routes["record_export"],
        view_func=record_export,
    )

    blueprint.add_url_rule(
        routes["record_file_preview"],
        view_func=record_file_preview,
    )

    blueprint.add_url_rule(
        routes["record_file_download"],
        view_func=record_file_download,
    )

    blueprint.add_url_rule(
        routes["deposit_create"],
        view_func=deposit_create,
    )

    blueprint.add_url_rule(
        routes["deposit_edit"],
        view_func=deposit_edit,
    )

    # Register error handlers
    blueprint.register_error_handler(PIDDeletedError, record_tombstone_error)
    blueprint.register_error_handler(PIDDoesNotExistError, not_found_error)
    blueprint.register_error_handler(PIDUnregistered, not_found_error)
    blueprint.register_error_handler(KeyError, not_found_error)
    blueprint.register_error_handler(
        PermissionDeniedError, record_permission_denied_error)

    # Register template filters
    blueprint.add_app_template_filter(can_list_files)
    blueprint.add_app_template_filter(make_files_preview_compatible)
    blueprint.add_app_template_filter(pid_url)
    blueprint.add_app_template_filter(select_preview_file)
    blueprint.add_app_template_filter(to_previewer_files)
    blueprint.add_app_template_filter(has_previewable_files)
    blueprint.add_app_template_filter(order_entries)
    blueprint.add_app_template_filter(get_scheme_label)

    # Register context processor
    blueprint.app_context_processor(search_app_context)

    return blueprint
