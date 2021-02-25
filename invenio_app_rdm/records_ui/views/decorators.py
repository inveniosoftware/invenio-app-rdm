# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2021 CERN.
# Copyright (C) 2019-2021 Northwestern University.
# Copyright (C)      2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Routes for record-related pages provided by Invenio-App-RDM."""

from functools import wraps

from flask import g
from invenio_rdm_records.proxies import current_rdm_records
from invenio_records_resources.services.errors import PermissionDeniedError


def links_config():
    """Get the record links config."""
    return current_rdm_records.records_resource.config.links_config


def draft_links_config():
    """Get the drafts links config."""
    return current_rdm_records.records_resource.config.draft_links_config


def service():
    """Get the record service."""
    return current_rdm_records.records_service


def files_service():
    """Get the record files service."""
    return current_rdm_records.record_files_service


def pass_record(f):
    """Decorate a view to pass a record using the record service."""
    @wraps(f)
    def view(**kwargs):
        pid_value = kwargs.get('pid_value')
        record = service().read(
            id_=pid_value, identity=g.identity, links_config=links_config()
        )
        kwargs['record'] = record
        # TODO: Remove - all this should happen in service
        # Dereference relations (languages, licenses, etc.)
        record._record.relations.dereference()
        return f(**kwargs)
    return view


def pass_draft(f):
    """Decorator to retrieve the draft using the record service."""
    @wraps(f)
    def view(**kwargs):
        pid_value = kwargs.get('pid_value')
        draft = service().read_draft(
            id_=pid_value,
            identity=g.identity,
            links_config=draft_links_config()
        )
        # TODO: Remove - all this should happen in service
        # Dereference relations (languages, licenses, etc.)
        draft._record.relations.dereference()
        kwargs['draft'] = draft
        return f(**kwargs)
    return view


def pass_file_item(f):
    """Decorate a view to pass a file item using the files service."""
    @wraps(f)
    def view(**kwargs):
        pid_value = kwargs.get('pid_value')
        file_key = kwargs.get('filename')

        item = files_service().get_file_content(
            id_=pid_value,
            file_key=file_key,
            identity=g.identity,
            links_config=links_config(),
        )
        kwargs['file_item'] = item
        return f(**kwargs)
    return view


def pass_file_metadata(f):
    """Decorate a view to pass a file's metadata using the files service."""
    @wraps(f)
    def view(**kwargs):
        pid_value = kwargs.get('pid_value')
        file_key = kwargs.get('filename')
        files = files_service().read_file_metadata(
            id_=pid_value,
            file_key=file_key,
            identity=g.identity,
            links_config=links_config(),
        )
        kwargs['file_metadata'] = files
        return f(**kwargs)
    return view


def pass_record_files(f):
    """Decorate a view to pass a record's files using the files service."""
    @wraps(f)
    def view(**kwargs):
        try:
            pid_value = kwargs.get('pid_value')
            files = files_service().list_files(
                id_=pid_value, identity=g.identity, links_config=links_config()
            )
            kwargs['files'] = files

        except PermissionDeniedError:
            # this is handled here because we don't want a 404 on the landing
            # page when a user is allowed to read the metadata but not the
            # files
            kwargs['files'] = None

        return f(**kwargs)
    return view


def user_permissions(actions=[]):
    """Decorate a view to pass user's permissions for the provided actions.

    :param actions: The action list to check permissions against.
    """
    def _wrapper_func(f):
        @wraps(f)
        def view(**kwargs):
            permissions = {}
            for action in actions:
                action_can = service().permission_policy(action).allows(
                    g.identity
                )
                permissions[f"can_{action}"] = action_can
            kwargs['permissions'] = permissions
            return f(**kwargs)
        return view
    return _wrapper_func
