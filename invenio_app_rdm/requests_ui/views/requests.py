# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2022 CERN.
# Copyright (C) 2019-2022 Northwestern University.
# Copyright (C)      2022 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.
"""Request views module."""

from flask import current_app, g, render_template
from flask_babelex import lazy_gettext as _
from flask_login import current_user, login_required
from invenio_communities.members.services.request import CommunityInvitation
from invenio_communities.proxies import current_communities
from invenio_communities.views.decorators import pass_community
from invenio_rdm_records.proxies import current_rdm_records_service
from invenio_rdm_records.requests import CommunitySubmission
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_records_resources.services.errors import PermissionDeniedError
from invenio_requests.views.decorators import pass_request
from invenio_userprofiles import current_userprofile
from invenio_users_resources.proxies import current_user_resources
from jinja2 import TemplateNotFound
from sqlalchemy.orm.exc import NoResultFound


def requests_detail(request=None, default_query_config=None, community=None,
                    custom_base_template=None, avatar_url=None,
                    ):
    """Requests detail page."""
    # temporarily, until serializers and avatars implemented
    try:
        user_email = request["created_by"]["user"]
        request["created_by"].update({
            "avatar": "/static/images/placeholder.png",
            "full_name": user_email
        })
    except KeyError:
        request["created_by"].update({
            "avatar": "/static/images/placeholder.png",
            "full_name": request["created_by"]["community"]
        })

    topic_record = None
    is_draft = None
    permissions = {}

    if community:
        community_permissions = community.has_permissions_to(
            ['update', 'read', 'search_requests', 'search_invites']
        )
        permissions.update(community_permissions)
        community = community.to_dict()

    try:
        topic_record = current_rdm_records_service.read_draft(
            id_=request["topic"]["record"], identity=g.identity)

    except NoResultFound:
        topic_record = current_rdm_records_service.read(
            id_=request["topic"]["record"], identity=g.identity)

    permissions.update(topic_record.has_permissions_to(
        ['edit', 'new_version', 'manage',
         'update_draft', 'read_files'])
    )
    topic_record = UIJSONSerializer() \
        .serialize_object_to_dict(topic_record.data)
    is_draft = topic_record["is_draft"]
    request["topic"] = topic_record

    # end temporary block

    return render_template(
        f"invenio_requests/community-submission/index.html",
        # TODO: implement and use request UI serializer
        request=request,
        record=topic_record,
        is_preview=True,
        is_draft=is_draft,
        permissions=permissions,
        files=[],
        default_query_config=default_query_config,
        custom_base_template=custom_base_template,
        community=community,
        user_avatar_url=avatar_url,
        types={
            "organization": _("Organization"),
            "event": _("Event"),
            "topic": _("Topic"),
            "project": _("Project")
        },
        current_userprofile=current_userprofile,
    )


def invitation_details(request=None, default_query_config=None, community=None,
                       custom_base_template=None, avatar_url=None):
    """Invitation details page."""
    permissions = {}
    if community:
        permissions = community.has_permissions_to(
            ['update', 'read', 'search_requests', 'search_invites']
        )
        if not permissions['can_search_invites']:
            raise PermissionDeniedError()
        community = community.to_dict()
        template = "invenio_requests/community-invitation/community.html",
    else:
        template = "invenio_requests/community-invitation/index.html"

    return render_template(
        template,
        community=community,
        user_avatar_url=avatar_url,
        permissions=permissions,
        request=request,
        default_query_config=default_query_config,
        custom_base_template=custom_base_template,
        current_userprofile=current_userprofile,
    )


def _requests_view(request, community=None, custom_base_template=None,
                   avatar_url=None, **kwargs):
    """General view for requests."""
    request_dict = request.to_dict()
    request_type = request_dict.get('type')
    default_query_config = dict(
        size=current_app.config['REQUESTS_TIMELINE_PAGE_SIZE']
    )

    if request_type == CommunitySubmission.type_id:
        return requests_detail(
            request=request_dict,
            default_query_config=default_query_config,
            community=community,
            avatar_url=avatar_url,
            custom_base_template=custom_base_template,
        )

    elif request_type == CommunityInvitation.type_id:
        if community:
            base_template = "invenio_communities/details/members/base.html"
        else:
            base_template = custom_base_template

        return invitation_details(
            request=request_dict,
            community=community,
            avatar_url=avatar_url,
            default_query_config=default_query_config,
            custom_base_template=base_template,
        )
    else:
        return render_template(
            "invenio_requests/details/index.html",
            request=request_dict,
            community=community,
            user_avatar_url=avatar_url,
            default_query_config=default_query_config)


@login_required
@pass_request
def user_requests_view(request=None, **kwargs):
    """User requests view."""
    avatar_url = current_user_resources.users_service.links_item_tpl.expand(
        current_user
    )['avatar']
    return _requests_view(
        request=request,
        avatar_url=avatar_url,
        custom_base_template="invenio_app_rdm/users/base.html",
    )


@login_required
@pass_request
@pass_community
def community_requests_view(request=None, community=None, **kwargs):
    """Community requests view."""
    return _requests_view(
        request=request,
        community=community,
        custom_base_template="invenio_communities/details/base.html")
