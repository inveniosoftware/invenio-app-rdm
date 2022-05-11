# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2022 CERN.
# Copyright (C) 2019-2022 Northwestern University.
# Copyright (C)      2022 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Request views module."""

from flask import g, render_template, url_for
from flask_login import current_user, login_required
from invenio_communities.members.services.request import CommunityInvitation
from invenio_communities.views.decorators import pass_community
from invenio_rdm_records.proxies import current_rdm_records_service
from invenio_rdm_records.requests import CommunitySubmission
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_records_resources.services.errors import PermissionDeniedError
from invenio_requests.customizations import AcceptAction
from invenio_requests.resolvers.registry import ResolverRegistry
from invenio_requests.views.decorators import pass_request
from invenio_users_resources.proxies import current_user_resources
from sqlalchemy.orm.exc import NoResultFound


def _resolve_topic_draft(request):
    """Resolve the record in the topic when it is a draft."""
    if request["is_closed"]:
        return dict(permissions={}, record_ui=None)

    recid = ResolverRegistry.resolve_entity_proxy(
        request["topic"]
    )._parse_ref_dict_id()
    try:
        record = current_rdm_records_service.read_draft(
            g.identity, recid, expand=True
        )
        record_ui = UIJSONSerializer().serialize_object_to_dict(
            record.to_dict()
        )
        permissions = record.has_permissions_to(
            [
                "edit",
                "new_version",
                "manage",
                "update_draft",
                "read_files",
                "review",
            ]
        )
        return dict(permissions=permissions, record_ui=record_ui)
    except NoResultFound:
        # record tab not displayed when the record is not found
        # the request is probably not open anymore
        pass

    return dict(permissions={}, record_ui=None)


@login_required
@pass_request(expand=True)
def user_dashboard_request_view(request, **kwargs):
    """User dashboard request details view."""
    avatar = current_user_resources.users_service.links_item_tpl.expand(
        current_user
    )["avatar"]

    request_type = request["type"]

    is_draft_submission = request_type == CommunitySubmission.type_id
    is_invitation = request_type == CommunityInvitation.type_id
    request_is_accepted = request["status"] == AcceptAction.status_to

    if is_draft_submission:
        topic = _resolve_topic_draft(request)
        return render_template(
            "invenio_requests/community-submission/index.html",
            base_template="invenio_app_rdm/users/base.html",
            user_avatar=avatar,
            request=request.to_dict(),
            record=topic["record_ui"],
            permissions=topic["permissions"],
            is_preview=True,
            draft_is_accepted=request_is_accepted,
            files=[],
        )

    elif is_invitation:
        return render_template(
            "invenio_requests/community-invitation/user_dashboard.html",
            base_template="invenio_app_rdm/users/base.html",
            user_avatar=avatar,
            request=request.to_dict(),
            invitation_accepted=request_is_accepted,
        )


@login_required
@pass_request(expand=True)
@pass_community
def community_dashboard_request_view(request, community, **kwargs):
    """Community dashboard requests details view."""
    request_type = request["type"]

    is_draft_submission = request_type == CommunitySubmission.type_id
    is_invitation = request_type == CommunityInvitation.type_id
    request_is_accepted = request["status"] == AcceptAction.status_to
    if is_draft_submission:
        permissions = community.has_permissions_to(
            ["update", "read", "search_requests", "search_invites"]
        )

        topic = _resolve_topic_draft(request)
        permissions.update(topic["permissions"])

        return render_template(
            "invenio_requests/community-submission/index.html",
            base_template="invenio_communities/details/base.html",
            request=request.to_dict(),
            record=topic["record_ui"],
            community=community.to_dict(),
            permissions=permissions,
            is_preview=True,
            draft_is_accepted=request_is_accepted,
            files=[],
        )

    elif is_invitation:
        permissions = community.has_permissions_to(
            ["update", "read", "search_requests", "search_invites"]
        )
        if not permissions["can_search_invites"]:
            raise PermissionDeniedError()

        return render_template(
            "invenio_requests/community-invitation/community_dashboard.html",
            base_template="invenio_communities/details/members/base.html",
            request=request.to_dict(),
            community=community.to_dict(),
            permissions=permissions,
            invitation_accepted=request_is_accepted,
        )
