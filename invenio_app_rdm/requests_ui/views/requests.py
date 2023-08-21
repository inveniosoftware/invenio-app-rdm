# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2022 CERN.
# Copyright (C) 2019-2022 Northwestern University.
# Copyright (C)      2022 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Request views module."""

from flask import abort, current_app, g, redirect, render_template, request
from flask_login import current_user, login_required
from invenio_communities.members.services.request import CommunityInvitation
from invenio_communities.views.decorators import pass_community
from invenio_rdm_records.proxies import current_rdm_records_service
from invenio_rdm_records.requests import CommunityInclusion, CommunitySubmission
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_records_resources.services.errors import PermissionDeniedError
from invenio_requests.customizations import AcceptAction
from invenio_requests.resolvers.registry import ResolverRegistry
from invenio_requests.views.decorators import pass_request
from invenio_users_resources.proxies import current_user_resources
from sqlalchemy.orm.exc import NoResultFound

from invenio_app_rdm.records_ui.views.decorators import (
    draft_files_service,
    files_service,
)
from invenio_app_rdm.records_ui.views.deposits import (
    get_user_communities_memberships,
    load_custom_fields,
)

from ...records_ui.utils import get_external_resources


def _resolve_topic_record(request):
    """Resolve the record in the topic, when it is a draft or a published record."""
    creator_id = request["expanded"].get("created_by", {}).get("id", None)
    user_owns_request = str(creator_id) == str(current_user.id)

    if request["is_closed"] and not user_owns_request:
        return dict(permissions={}, record_ui=None)

    record = None
    # parse the topic field to get the draft/record pid `record:abcd-efgh`
    entity = ResolverRegistry.resolve_entity_proxy(request["topic"])
    pid = entity._parse_ref_dict_id()
    try:
        # read draft
        record = current_rdm_records_service.read_draft(g.identity, pid, expand=True)
    except NoResultFound:
        try:
            # read published record
            record = current_rdm_records_service.read(g.identity, pid, expand=True)
        except NoResultFound:
            # record tab not displayed when the record is not found
            # the request is probably not open anymore
            pass

    if record:
        record_ui = UIJSONSerializer().dump_obj(record.to_dict())
        permissions = record.has_permissions_to(
            [
                "edit",
                "new_version",
                "manage",
                "update_draft",
                "read_files",
                "review",
                "read",
            ]
        )
        return dict(permissions=permissions, record_ui=record_ui)

    return dict(permissions={}, record_ui=None)


def _resolve_record_or_draft_files(record):
    """Resolve the record's or draft's files."""
    if record and record["files"]["enabled"]:
        record_pid = record["id"]
        try:
            files = draft_files_service().list_files(
                id_=record_pid, identity=g.identity
            )
        except NoResultFound:
            files = files_service().list_files(id_=record_pid, identity=g.identity)
        return files.to_dict()
    return None


@login_required
@pass_request(expand=True)
def user_dashboard_request_view(request, **kwargs):
    """User dashboard request details view."""
    avatar = current_user_resources.users_service.links_item_tpl.expand(
        g.identity, current_user
    )["avatar"]

    request_type = request["type"]
    request_is_accepted = request["status"] == AcceptAction.status_to

    has_record_topic = "record" in request["topic"]
    has_community_topic = "community" in request["topic"]

    if has_record_topic:
        topic = _resolve_topic_record(request)
        record = topic["record_ui"]  # None when draft
        is_draft = record["is_draft"] if record else False

        files = _resolve_record_or_draft_files(record)
        return render_template(
            f"invenio_requests/{request_type}/index.html",
            base_template="invenio_app_rdm/users/base.html",
            user_avatar=avatar,
            invenio_request=request.to_dict(),
            record=record,
            permissions=topic["permissions"],
            is_preview=is_draft,  # preview only when draft
            is_draft=is_draft,
            request_is_accepted=request_is_accepted,
            files=files,
            is_user_dashboard=True,
            custom_fields_ui=load_custom_fields()["ui"],
            user_communities_memberships=get_user_communities_memberships(),
            external_resources=get_external_resources(record),
        )

    elif has_community_topic:
        return render_template(
            f"invenio_requests/{request_type}/user_dashboard.html",
            base_template="invenio_app_rdm/users/base.html",
            user_avatar=avatar,
            invenio_request=request.to_dict(),
            request_is_accepted=request_is_accepted,
            permissions={},
        )

    topic = _resolve_topic_record(request)
    record = topic["record_ui"]

    return render_template(
        f"invenio_requests/{request_type}/index.html",
        base_template="invenio_app_rdm/users/base.html",
        user_avatar=avatar,
        record=record,
        permissions=topic["permissions"],
        invenio_request=request.to_dict(),
        request_is_accepted=request_is_accepted,
    )


@login_required
@pass_request(expand=True)
@pass_community(serialize=True)
def community_dashboard_request_view(request, community, community_ui, **kwargs):
    """Community dashboard requests details view."""
    avatar = current_user_resources.users_service.links_item_tpl.expand(
        g.identity, current_user
    )["avatar"]

    request_type = request["type"]

    is_draft_submission = request_type == CommunitySubmission.type_id
    is_record_inclusion = request_type == CommunityInclusion.type_id
    is_member_invitation = request_type == CommunityInvitation.type_id
    request_is_accepted = request["status"] == AcceptAction.status_to

    if is_draft_submission or is_record_inclusion:
        permissions = community.has_permissions_to(
            ["update", "read", "search_requests", "search_invites"]
        )

        topic = _resolve_topic_record(request)
        record = topic["record_ui"]  # None when draft
        is_draft = record["is_draft"] if record else False

        permissions.update(topic["permissions"])
        files = _resolve_record_or_draft_files(record)
        return render_template(
            f"invenio_requests/{request_type}/index.html",
            base_template="invenio_communities/details/base.html",
            invenio_request=request.to_dict(),
            record=record,
            community=community_ui,
            permissions=permissions,
            is_preview=is_draft,  # preview only when draft
            is_draft=is_draft,
            request_is_accepted=request_is_accepted,
            files=files,
            user_avatar=avatar,
            custom_fields_ui=load_custom_fields()["ui"],
            user_communities_memberships=get_user_communities_memberships(),
            external_resources=get_external_resources(record),
        )

    elif is_member_invitation:
        permissions = community.has_permissions_to(
            ["update", "read", "search_requests", "search_invites"]
        )
        if not permissions["can_search_invites"]:
            raise PermissionDeniedError()

        return render_template(
            f"invenio_requests/{request_type}/community_dashboard.html",
            base_template="invenio_communities/details/members/base.html",
            invenio_request=request.to_dict(),
            community=community.to_dict(),
            permissions=permissions,
            request_is_accepted=request_is_accepted,
            user_avatar=avatar,
        )
