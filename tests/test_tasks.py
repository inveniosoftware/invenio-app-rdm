# -*- coding: utf-8 -*-
#
# Copyright (C) 2022-2024 CERN.
# Copyright (C) 2025 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Test invenio-app-rdm celery tasks."""

from io import BytesIO

import pytest
from invenio_access.permissions import system_identity
from invenio_db import db
from invenio_files_rest.models import Bucket, FileInstance, Location, ObjectVersion
from invenio_rdm_records.proxies import current_rdm_records

from invenio_app_rdm.tasks import file_integrity_report

# Fixtures


@pytest.fixture
def draft_with_file_instance(running_app, minimal_record):
    """Create draft with file and return (Draft, FileInstance)."""
    minimal_record["files"] = {"enabled": True}

    record_service = current_rdm_records.records_service
    file_service = record_service.draft_files

    draft = record_service.create(system_identity, minimal_record)
    file_to_initialise = [
        {
            "key": "article.txt",
            "checksum": "md5:c785060c866796cc2a1708c997154c8e",
            "size": 17,  # 2kB
            "metadata": {
                "description": "Published article PDF.",
            },
        }
    ]
    file_service.init_files(system_identity, draft.id, file_to_initialise)
    content = BytesIO(b"test file content")
    file_service.set_file_content(
        system_identity,
        draft.id,
        file_to_initialise[0]["key"],
        content,
        content.getbuffer().nbytes,
    )
    file_item = file_service.commit_file(system_identity, draft.id, "article.txt")
    # fmt: off
    id_of_file_instance = (
        file_item
        ._record
        .files
        .entries["article.txt"]
        .object_version.file_id
    )
    # fmt: on
    f = FileInstance.query.get(id_of_file_instance)
    return draft, f


@pytest.fixture
def draft_with_invalid_file_instance(draft_with_file_instance):
    # Force an invalid checksum
    draft, f = draft_with_file_instance
    f.checksum = "invalid"
    f.verify_checksum()
    db.session.commit()

    # Retrieve the file instance (with updated last_check)
    f = FileInstance.query.get(f.id)

    return draft, f


@pytest.fixture
def record_with_invalid_file_instance(draft_with_invalid_file_instance):
    draft, f = draft_with_invalid_file_instance
    record_service = current_rdm_records.records_service
    return record_service.publish(system_identity, draft.id), f


@pytest.fixture
def invalid_file_instance(record_with_invalid_file_instance):
    draft, f = record_with_invalid_file_instance
    return f


# Tests


def test_task_file_integrity_report(
    app, record_with_invalid_file_instance, set_app_config_fn_scoped
):
    """Test celery task for file integrity reports."""
    record, invalid_file_instance = record_with_invalid_file_instance
    assert invalid_file_instance.last_check is False

    # A report must be generated for the file
    mail = app.extensions.get("mail")
    assert mail

    recipients = "test@invenio.org"
    sender = "test@invenio.org"

    uri = invalid_file_instance.uri
    file_id = invalid_file_instance.id
    file_name = invalid_file_instance.objects[0].key
    checksum = invalid_file_instance.checksum

    with mail.record_messages() as outbox:
        # Configure email and validate that email was sent
        set_app_config_fn_scoped(
            {
                "APP_RDM_FILES_INTEGRITY_REPORT_TEMPLATE": "mock_mail.html",
                "APP_RDM_ADMIN_EMAIL_RECIPIENT": recipients,
                "MAIL_DEFAULT_SENDER": sender,
            }
        )

        file_integrity_report()
        assert len(outbox) == 1
        mail_sent = outbox[0]
        assert mail_sent.recipients == [recipients]
        assert mail_sent.sender == sender
        assert "Checksum: {}".format(checksum) in mail_sent.body
        assert "URI: {}".format(uri) in mail_sent.body
        assert "ID: {}".format(str(file_id)) in mail_sent.body
        assert "Name: {}".format(file_name) in mail_sent.body
        assert f"Record: https://127.0.0.1:5000/records/{record.id}" in mail_sent.body


def test_integrity_report_invalid_template(
    app, invalid_file_instance, set_app_config_fn_scoped
):
    """Test non-existant e-mail template."""
    assert invalid_file_instance.last_check is False

    mail = app.extensions.get("mail")
    assert mail

    with mail.record_messages() as outbox:
        # Remove the template, no e-mail is sent
        set_app_config_fn_scoped({"APP_RDM_FILES_INTEGRITY_REPORT_TEMPLATE": None})

        file_integrity_report()
        assert len(outbox) == 0


def test_integrity_report_invalid_addresses(
    app, invalid_file_instance, set_app_config_fn_scoped
):
    """Test invalid recipient address."""
    assert invalid_file_instance.last_check is False

    mail = app.extensions.get("mail")
    assert mail

    with mail.record_messages() as outbox:
        set_app_config_fn_scoped(
            {
                # Use mock template
                "APP_RDM_FILES_INTEGRITY_REPORT_TEMPLATE": "mock_mail.html",
                # Recipient is not set, mail is not sent.
                "APP_RDM_ADMIN_EMAIL_RECIPIENT": None,
            }
        )

        file_integrity_report()
        assert len(outbox) == 0


def test_integrity_report_default_template(
    app, draft_with_invalid_file_instance, set_app_config_fn_scoped
):
    """Test invalid recipient address."""
    draft, invalid_file_instance = draft_with_invalid_file_instance
    assert invalid_file_instance.last_check is False

    mail = app.extensions.get("mail")
    assert mail

    recipients = "test@invenio.org"
    sender = "test@invenio.org"

    uri = invalid_file_instance.uri
    file_id = invalid_file_instance.id
    file_name = invalid_file_instance.objects[0].key
    checksum = invalid_file_instance.checksum

    with mail.record_messages() as outbox:
        # Use default template
        set_app_config_fn_scoped(
            {"APP_RDM_ADMIN_EMAIL_RECIPIENT": recipients, "MAIL_DEFAULT_SENDER": sender}
        )

        file_integrity_report()
        assert len(outbox) == 1
        mail_sent = outbox[0]
        assert mail_sent.recipients == [recipients]
        assert mail_sent.sender == sender
        assert "Checksum: {}".format(checksum) in mail_sent.body
        assert "URI: {}".format(uri) in mail_sent.body
        assert "ID: {}".format(str(file_id)) in mail_sent.body
        assert "Name: {}".format(file_name) in mail_sent.body
        assert f"Draft: https://127.0.0.1:5000/uploads/{draft.id}" in mail_sent.body
