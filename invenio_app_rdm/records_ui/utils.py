# -*- coding: utf-8 -*-
#
# Copyright (C) 2020-2025 CERN.
# Copyright (C) 2020 Northwestern University.
# Copyright (C) 2021 TU Wien.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Utility functions."""

from datetime import datetime, timezone
from itertools import chain

from flask import current_app
from invenio_access.permissions import system_identity
from invenio_rdm_records.records.api import RDMRecord
from invenio_rdm_records.requests.record_deletion import RecordDeletion
from invenio_rdm_records.services.config import (
    FileModificationPolicyEvaluator,
    RDMRecordDeletionPolicy,
)
from invenio_records.dictutils import dict_set
from invenio_records.errors import MissingModelError
from invenio_records_files.api import FileObject
from invenio_requests.proxies import current_requests_service
from invenio_search.api import dsl


def previewer_record_file_factory(pid, record, filename):
    """Get file from a record.

    :param pid: Not used. It keeps the function signature.
    :param record: Record which contains the files.
    :param filename: Name of the file to be returned.
    :returns: Previewer compatible File object or ``None`` if not found.
    """
    try:
        if not (hasattr(record, "files") and record.files):
            return None
    except MissingModelError:
        return None

    try:
        rf = record.files.get(filename)
        if rf is not None:
            return FileObject(obj=rf.file, data=rf.metadata or {})
    except KeyError:
        return None


def set_default_value(record_dict, value, path, default_prefix="metadata"):
    """Set the value with the specified dot-separated path in the record.

    :param record_dict: The dict in which to set the value.
    :param value: The value to set (can be callable).
    :param path: The dot-separated path to the value.
    :param default_prefix: The default path prefix to assume.
    """
    if callable(value):
        value = value()

    # if the path explicitly starts with a dot, we know that we shouldn't
    # prepend the default_prefix to the path
    if path.startswith("."):
        path = path[1:]
    else:
        path = "{}.{}".format(default_prefix, path)

    dict_set(record_dict, path, value)


def get_external_resources(record):
    """Generate external resources from the record."""
    result = []
    resources_cfg = current_app.config["APP_RDM_RECORD_LANDING_PAGE_EXTERNAL_LINKS"]
    for cfg in resources_cfg:
        try:
            res = cfg["render"](record)
            if res:
                result.append(res)
        except Exception:
            pass
    return list(chain.from_iterable(result))


def dump_external_resource(
    url, title, section, icon=None, subtitle=None, template=None
):
    """Dumps a external resource dictionary."""
    return {
        "content": {
            "url": url,
            "title": title,
            "subtitle": subtitle,
            "icon": icon,
            "section": section,
        },
        "template": template,
    }


def get_existing_deletion_request(record_id):
    """Return the self HTML link of the existing open deletion request for the record."""
    existing_requests = current_requests_service.search(
        system_identity,
        extra_filter=dsl.Q(
            "bool",
            must=[
                dsl.Q("term", **{"topic.record": record_id}),
                dsl.Q("term", **{"type": RecordDeletion.type_id}),
                dsl.Q("term", **{"is_open": True}),
            ],
        ),
    )
    if existing_requests.total > 0:
        return list(existing_requests)[0]["links"]["self_html"]


def evaluate_record_deletion(record: RDMRecord, identity):
    """Evaluate whether a given record can be deleted by an identity."""
    rec_del = RDMRecordDeletionPolicy().evaluate(identity, record)

    immediate, request = rec_del["immediate_deletion"], rec_del["request_deletion"]
    rd_enabled = immediate.enabled or request.enabled
    rd_valid_user = immediate.valid_user or request.valid_user
    rd_allowed = immediate.allowed or request.allowed

    if rd_allowed:
        record_deletion = {
            "enabled": rd_enabled,
            "valid_user": rd_valid_user,
            "allowed": rd_allowed,
            "recordDeletion": rec_del,
            "checklist": (
                current_app.config["RDM_IMMEDIATE_RECORD_DELETION_CHECKLIST"]
                if immediate.allowed
                else current_app.config["RDM_REQUEST_RECORD_DELETION_CHECKLIST"]
            ),
            "context": {
                "files": record.files.count,
                "internalDoi": record.pids.get("doi", {}).get("provider") != "external",
            },
        }
    else:
        record_deletion = {
            "enabled": rd_enabled,
            "valid_user": rd_valid_user,
            "allowed": rd_allowed,
        }
    record_deletion["existing_request"] = (
        # We show existing requests to valid users (even if they are not allowed to delete a record anymore).
        get_existing_deletion_request(record.pid.pid_value)
        if rd_valid_user
        else None
    )

    return record_deletion


def evaluate_file_modification(record, identity):
    """Evaluate whether a given record file's can be edited by an identity."""
    file_mod = FileModificationPolicyEvaluator().evaluate(identity, record)

    file_mod = file_mod["immediate_file_modification"]

    file_modification = {
        "enabled": file_mod.enabled,
        "valid_user": file_mod.valid_user,
        "allowed": file_mod.allowed,
    }

    if file_mod.allowed:
        file_modification["fileModification"] = file_mod
        created = record.created.replace(tzinfo=timezone.utc)
        modification_until = created + current_app.config.get(
            "RDM_FILE_MODIFICATION_PERIOD"
        )
        days_until = (modification_until - datetime.now(timezone.utc)).days
        file_modification["context"] = {"days_until": days_until}

    return file_modification
