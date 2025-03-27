# -*- coding: utf-8 -*-
#
# Copyright (C) 2022-2024 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Test invenio-app-rdm celery tasks."""

from invenio_app_rdm.tasks import file_integrity_report


def test_task_file_integrity_report(app, invalid_file_instance):
    """Test celery task for file integrity reports."""
    assert invalid_file_instance.last_check is False

    # A report must be generated for the file
    mail = app.extensions.get("mail")
    assert mail

    recipients = "test@invenio.org"
    sender = "test@invenio.org"

    file_name = invalid_file_instance.objects[0].key
    uri = invalid_file_instance.uri
    file_id = invalid_file_instance.id
    file_name = invalid_file_instance.objects[0].key
    checksum = invalid_file_instance.checksum

    with mail.record_messages() as outbox:
        # Configure email and validate that email was sent
        app.config["APP_RDM_FILES_INTEGRITY_REPORT_TEMPLATE"] = "mock_mail.html"
        app.config["APP_RDM_ADMIN_EMAIL_RECIPIENT"] = recipients
        app.config["MAIL_DEFAULT_SENDER"] = sender

        file_integrity_report()
        assert len(outbox) == 1
        mail_sent = outbox[0]
        assert mail_sent.recipients == [recipients]
        assert mail_sent.sender == sender
        assert "Checksum: {}".format(checksum) in mail_sent.body
        assert "URI: {}".format(uri) in mail_sent.body
        assert "ID: {}".format(str(file_id)) in mail_sent.body
        assert "Name: {}".format(file_name) in mail_sent.body


def test_integrity_report_invalid_template(app, invalid_file_instance):
    """Test non-existant e-mail template."""
    assert invalid_file_instance.last_check is False

    mail = app.extensions.get("mail")
    assert mail

    with mail.record_messages() as outbox:
        # Remove the template, no e-mail is sent
        app.config["APP_RDM_FILES_INTEGRITY_REPORT_TEMPLATE"] = None
        file_integrity_report()
        assert len(outbox) == 0


def test_integrity_report_invalid_addresses(app, invalid_file_instance):
    """Test invalid recipient address."""
    assert invalid_file_instance.last_check is False

    mail = app.extensions.get("mail")
    assert mail

    with mail.record_messages() as outbox:
        # Use mock template
        app.config["APP_RDM_FILES_INTEGRITY_REPORT_TEMPLATE"] = "mock_mail.html"

        # Recipient is not set, mail is not sent.
        app.config["APP_RDM_ADMIN_EMAIL_RECIPIENT"] = None
        file_integrity_report()
        assert len(outbox) == 0


def test_integrity_report_default_template(app, invalid_file_instance):
    """Test invalid recipient address."""
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
        app.config["APP_RDM_ADMIN_EMAIL_RECIPIENT"] = recipients
        app.config["MAIL_DEFAULT_SENDER"] = sender
        file_integrity_report()
        assert len(outbox) == 1
        mail_sent = outbox[0]
        assert mail_sent.recipients == [recipients]
        assert mail_sent.sender == sender
        assert "Checksum: {}".format(checksum) in mail_sent.body
        assert "URI: {}".format(uri) in mail_sent.body
        assert "ID: {}".format(str(file_id)) in mail_sent.body
        assert "Name: {}".format(file_name) in mail_sent.body
