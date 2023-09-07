# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Files utilities."""

from __future__ import absolute_import, print_function

from datetime import datetime

import sqlalchemy as sa
from flask import current_app
from flask_mail import Message
from invenio_files_rest.models import FileInstance
from invenio_rdm_records.records.models import RDMDraftMetadata, RDMRecordMetadata
from pytz import utc


def checksum_verification_files_query():
    """Return a FileInstance query taking into account file URI prefixes."""
    files = FileInstance.query
    uri_prefixes = current_app.config.get(
        "FILES_REST_CHECKSUM_VERIFICATION_URI_PREFIXES"
    )
    if uri_prefixes:
        files = files.filter(
            sa.or_(*[FileInstance.uri.startswith(p) for p in uri_prefixes])
        )
    return files


def render_email_from_context(template, context):
    """Renders a template using a provided context."""
    template = current_app.jinja_env.get_or_select_template(template)
    return template.render(context)


def generate_integrity_report_entries(files):
    """Generates the report entries."""
    entries = []
    for file in files:
        entry = _generate_report_entry(file)
        entries.append(entry)
    return entries


def _generate_report_entry(file):
    """Generates a single report for a file."""
    entry = {"file": file}
    for o in file.objects:
        entry["filename"] = o.key

        # Find records/drafts for the files
        draft = get_draft_from_bucket(o.bucket_id)
        if draft and draft.json:
            entry["draft"] = draft.json
        else:
            record = get_record_from_bucket(o.bucket_id)
            if record and record.json:
                entry["record"] = record.json
    return entry


def get_record_from_bucket(bucket_id):
    """Retrieve a record from a bucket id."""
    return RDMRecordMetadata.query.filter_by(bucket_id=bucket_id).one_or_none()


def get_draft_from_bucket(bucket_id):
    """Retrieve a draft from a bucket id."""
    return RDMDraftMetadata.query.filter_by(bucket_id=bucket_id).one_or_none()


def get_report_subject():
    """Retrieves the integrity report e-mail's subject."""
    subject = current_app.config.get(
        "APP_RDM_FILES_INTEGRITY_REPORT_SUBJECT", "Files integrity report"
    )
    now = datetime.now(tz=utc).strftime("%Y-%m-%d %H:%M:%S")
    subject += f" [{now}]"
    return subject


def get_report_template():
    """Retrieves the template name to be used in the files integrity report."""
    tpl = current_app.config["APP_RDM_FILES_INTEGRITY_REPORT_TEMPLATE"]
    return tpl


def render_report_email(files):
    """Renders the report e-mail from a list of files."""
    entries = generate_integrity_report_entries(files)
    tpl = get_report_template()
    context = {"entries": entries}
    return render_email_from_context(tpl, context)


def send_integrity_report_email(files):
    """Sends an e-mail with a report on the provided files.

    APP configs ('MAIL_DEFAULT_SENDER', 'APP_RDM_ADMIN_EMAIL_RECIPIENT') must be set.
    Oherwise a warning is logged.
    """
    try:
        if files:
            subject = get_report_subject()
            body = render_report_email(files)
            sender = current_app.config["MAIL_DEFAULT_SENDER"]
            admin_email = current_app.config["APP_RDM_ADMIN_EMAIL_RECIPIENT"]
            recipients = admin_email
            if not isinstance(admin_email, list):
                recipients = [admin_email]
            mail_ext = current_app.extensions["mail"]
            msg = Message(subject, sender=sender, recipients=recipients, body=body)
            mail_ext.send(msg)
    except Exception as e:
        current_app.logger.error("Integrity report not sent. Error: {}".format(str(e)))
