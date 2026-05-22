# SPDX-FileCopyrightText: 2022 CERN.
# SPDX-License-Identifier: MIT
"""Celery tasks for invenio-app-rdm."""

import sqlalchemy as sa
from celery import shared_task
from invenio_db import db
from invenio_files_rest.models import FileInstance

from .utils.files import send_integrity_report_email


@shared_task()
def file_integrity_report():
    """Send a report of uhealthy/missing files to system admins."""
    # First retry verifying files that errored during their last check
    files = FileInstance.query.filter(
        FileInstance.last_check.is_(None),
        FileInstance.uri.is_not(None),
    )
    for f in files:
        try:
            f.clear_last_check()
            db.session.commit()
            f.verify_checksum(throws=False)
            db.session.commit()
        except Exception:
            pass  # Don't fail sending the report in case of some file error

    unhealthy_files = (
        FileInstance.query.filter(
            sa.or_(
                FileInstance.last_check.is_(None), FileInstance.last_check.is_(False)
            ),
            FileInstance.uri.is_not(None),
        )
        .order_by(FileInstance.created.desc())
        .all()
    )

    send_integrity_report_email(unhealthy_files)
