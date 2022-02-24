# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2022 CERN.
# Copyright (C) 2019-2022 Northwestern University.
# Copyright (C)      2022 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Request views module."""

from flask import g, render_template
from flask_login import login_required
from invenio_rdm_records.proxies import current_rdm_records_service
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_requests.views.decorators import pass_request
from jinja2 import TemplateNotFound
from sqlalchemy.orm.exc import NoResultFound


@login_required
@pass_request
def requests_detail(request=None, pid_value=None):
    """Community detail page."""
    request_dict = request.to_dict()

    # temporarily, until serializers and avatars implemented
    try:
        user_email = request_dict["created_by"]["user"]
        request_dict["created_by"].update({
            "avatar": "/static/images/placeholder.png",
            "full_name": user_email
        })
    except KeyError:
        request_dict["created_by"].update({
            "avatar": "/static/images/placeholder.png",
            "full_name": request_dict["created_by"]["community"]
        })

    topic_record = None
    is_draft = None
    permissions = []

    is_topic_record_type = 'record' in request_dict["topic"]

    if is_topic_record_type:
        try:
            topic_record = current_rdm_records_service.read_draft(
                id_=request_dict["topic"]["record"], identity=g.identity)

        except NoResultFound:
            topic_record = current_rdm_records_service.read(
                id_=request_dict["topic"]["record"], identity=g.identity)

        permissions = topic_record.has_permissions_to(
            ['edit', 'new_version', 'manage',
             'update_draft', 'read_files'])
        topic_record = UIJSONSerializer().serialize_object_to_dict(
            topic_record.data)
        is_draft = topic_record["is_draft"]
        request_dict["topic"] = topic_record

    # end temporary block

    try:
        return render_template(
            f"invenio_requests/{request_dict['type']}/index.html",
            # TODO: implement and use request UI serializer
            request=request_dict,
            record=topic_record,
            is_preview=True,
            is_draft=is_draft,
            permissions=permissions,
            files=[]
        )

    except TemplateNotFound:
        return render_template(
            "invenio_requests/details/index.html",
            # TODO: implement and use request UI serializer
            request=request_dict,
            record=topic_record,
        )
