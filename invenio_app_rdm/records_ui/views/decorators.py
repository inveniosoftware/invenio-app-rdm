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


def links_config():
    """Get the record links config."""
    return current_rdm_records.records_resource.config.links_config


def draft_links_config():
    """Get the drafts links config."""
    return current_rdm_records.records_resource.config.draft_links_config


def service():
    """Get the record service."""
    return current_rdm_records.records_service


def pass_record(f):
    """Decorate a view to pass a record using the record service."""
    @wraps(f)
    def view(**kwargs):
        pid_value = kwargs.get('pid_value')
        record = service().read(
            id_=pid_value, identity=g.identity, links_config=links_config()
        )
        kwargs['record'] = record
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
        kwargs['draft'] = draft
        return f(**kwargs)
    return view
