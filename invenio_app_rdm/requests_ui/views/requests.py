# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2025 CERN.
# Copyright (C) 2019-2022 Northwestern University.
# Copyright (C)      2022 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Request views module."""

from flask import current_app, g, render_template
from flask_login import current_user, login_required
from invenio_communities.config import COMMUNITIES_ROLES
from invenio_communities.members.services.request import CommunityInvitation
from invenio_communities.proxies import current_communities, current_identities_cache
from invenio_communities.subcommunities.services.request import (
    SubCommunityInvitationRequest,
    SubCommunityRequest,
)
from invenio_communities.utils import identity_cache_key
from invenio_communities.views.communities import render_community_theme_template
from invenio_communities.views.decorators import pass_community
from invenio_pidstore.errors import PIDDoesNotExistError
from invenio_rdm_records.proxies import current_rdm_records_service
from invenio_rdm_records.requests import CommunityInclusion, CommunitySubmission
from invenio_rdm_records.resources.serializers import UIJSONSerializer
from invenio_rdm_records.services.generators import CommunityInclusionNeed
from invenio_records_resources.services.errors import PermissionDeniedError
from invenio_requests.customizations import AcceptAction
from invenio_requests.resolvers.registry import ResolverRegistry
from invenio_requests.views.decorators import pass_request
from invenio_users_resources.proxies import current_user_resources
from sqlalchemy import case
from sqlalchemy.orm.exc import NoResultFound

from ...records_ui.utils import get_external_resources
from ...records_ui.views.decorators import (
    draft_files_service,
    draft_media_files_service,
    files_service,
    media_files_service,
)
from ...records_ui.views.deposits import (
    get_user_communities_memberships,
    load_custom_fields,
)


def _resolve_topic_record(request):
    """Resolve the record in the topic, when it is a draft or a published record."""
    creator_id = request["expanded"].get("created_by", {}).get("id", None)
    user_owns_request = str(creator_id) == str(current_user.id)

    if request["is_closed"] and not user_owns_request:
        return dict(permissions={}, record_ui=None, record=None, record_uuid=None)

    record = None
    record_uuid = None
    # parse the topic field to get the draft/record pid `record:abcd-efgh`
    entity = ResolverRegistry.resolve_entity_proxy(request["topic"])
    pid = entity._parse_ref_dict_id()

    request_type = request["type"]
    is_record_inclusion = request_type == CommunityInclusion.type_id

    try:
        if is_record_inclusion:
            community = request["receiver"]["community"]
            # Get the roles that can curate and in consequence should be able to see the record of the inclusion request
            can_curate_roles = {
                role["name"]
                for role in COMMUNITIES_ROLES
                if role.get("can_curate", False)
            }
            cache_key = identity_cache_key(g.identity)
            user_community_roles = current_identities_cache.get(cache_key)
            for community_id, role in user_community_roles:
                if community_id == community and role in can_curate_roles:
                    # This need should not be reused, see CommunityInclusionReviewers generator docstring for more info
                    community_inclusion_need = CommunityInclusionNeed(
                        pid
                    )  # pid is the record pid
                    g.identity.provides.add(community_inclusion_need)
                    break
            # read published record
            record = current_rdm_records_service.read(g.identity, pid, expand=True)
            record_uuid = current_rdm_records_service.record_cls.pid.resolve(pid).id
        else:
            # read draft
            record = current_rdm_records_service.read_draft(
                g.identity, pid, expand=True
            )
            record_uuid = current_rdm_records_service.draft_cls.pid.resolve(
                pid, registered_only=False
            ).id
    except (NoResultFound, PIDDoesNotExistError):
        # We catch PIDDoesNotExistError because a published record with
        # a soft-deleted draft will raise this error. The lines below
        # will catch the case that a id does not exists and raise a
        # PIDDoesNotExistError that can be handled as 404 in the resource
        # layer.
        try:
            # read published record
            record = current_rdm_records_service.read(g.identity, pid, expand=True)
            record_uuid = current_rdm_records_service.record_cls.pid.resolve(pid).id
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
        return dict(
            permissions=permissions,
            record_ui=record_ui,
            record=record,
            record_uuid=record_uuid,
        )

    return dict(permissions={}, record_ui=None, record=None, record_uuid=None)


def _resolve_record_or_draft_files(record, request):
    """Resolve the record's or draft's files."""
    request_type = request["type"]
    is_record_inclusion = request_type == CommunityInclusion.type_id
    if record and record["files"]["enabled"]:
        record_pid = record["id"]
        try:
            if is_record_inclusion:
                files = files_service().list_files(id_=record_pid, identity=g.identity)
            else:
                files = draft_files_service().list_files(
                    id_=record_pid, identity=g.identity
                )
        except NoResultFound:
            files = files_service().list_files(id_=record_pid, identity=g.identity)
        return files.to_dict()
    return None


def _resolve_record_or_draft_media_files(record, request):
    """Resolve the record's or draft's media files."""
    request_type = request["type"]
    is_record_inclusion = request_type == CommunityInclusion.type_id
    if record and record["media_files"]["enabled"]:
        record_pid = record["id"]
        try:
            if is_record_inclusion:
                media_files = media_files_service().list_files(
                    id_=record_pid, identity=g.identity
                )
            else:
                media_files = draft_media_files_service().list_files(
                    id_=record_pid, identity=g.identity
                )
        except NoResultFound:
            media_files = media_files_service().list_files(
                id_=record_pid, identity=g.identity
            )
        return media_files.to_dict()
    return None


def _resolve_checks(record_uuid, request, community=None):
    """Resolve the checks for this draft/record related to the community and the request."""
    # FIXME: Move this logic to invenio-checks

    # Early exit if checks are not enabled.
    enabled = current_app.config.get("CHECKS_ENABLED", False)

    if not enabled:
        return None

    # Early exit if not draft submission nor record inclusion
    request_type = request["type"]
    is_draft_submission = request_type == CommunitySubmission.type_id
    is_record_inclusion = request_type == CommunityInclusion.type_id

    if not is_draft_submission and not is_record_inclusion:
        return None

    # Early exit if there is no record UUID (for instance for some closed requests)
    if not record_uuid:
        return None

    # Resolve the target community from the request if the community was not passed as an argument
    if not community:
        community_uuid = request["receiver"]["community"]
        community = current_communities.service.read(
            id_=community_uuid, identity=g.identity
        )

    # Collect the community UUID and the potential parent community UUID
    communities = []
    community_parent_id = community.to_dict().get("parent", {}).get("id")
    if community_parent_id:
        # Add the parent community first for later ordering of check configs
        communities.append(community_parent_id)
    communities.append(community.id)

    # Early exit if no check config found for the communities
    from invenio_checks.models import CheckConfig, CheckRun

    check_configs = (
        CheckConfig.query.filter(CheckConfig.community_id.in_(communities))
        .order_by(
            # Order by the communities (parent first if any) and then by check IDs for deterministic ordering
            case((CheckConfig.community_id == communities[0], 0), else_=1),
            CheckConfig.check_id,
        )
        .all()
    )

    if not check_configs:
        return None

    # Find check runs for the given check configs
    check_config_ids = [check_config.id for check_config in check_configs]
    checks = CheckRun.query.filter(
        CheckRun.config_id.in_(check_config_ids),
        CheckRun.record_id == record_uuid,
    ).all()
    # For a given record, there is one check run corresponding to one check config
    # Order the check runs by the same order as the check configs for deterministic ordering
    checks = sorted(checks, key=lambda check: check_config_ids.index(check.config_id))

    return checks


@login_required
@pass_request(expand=True)
def user_dashboard_request_view(request, **kwargs):
    """User dashboard request details view."""
    avatar = current_user_resources.users_service.links_item_tpl.expand(
        g.identity, current_user
    )["avatar"]

    request_type = request["type"]
    request_is_accepted = request["status"] == AcceptAction.status_to

    has_topic = request["topic"] is not None
    has_record_topic = has_topic and "record" in request["topic"]
    has_community_topic = has_topic and "community" in request["topic"]

    if has_record_topic:
        topic = _resolve_topic_record(request)
        record_ui = topic["record_ui"]
        record = topic["record"]
        record_uuid = topic["record_uuid"]
        is_draft = record_ui["is_draft"] if record_ui else False
        checks = _resolve_checks(record_uuid, request)

        files = _resolve_record_or_draft_files(record_ui, request)
        media_files = _resolve_record_or_draft_media_files(record_ui, request)
        return render_template(
            f"invenio_requests/{request_type}/index.html",
            base_template="invenio_app_rdm/users/base.html",
            user_avatar=avatar,
            invenio_request=request.to_dict(),
            record_ui=record_ui,
            record=record,
            checks=checks,
            permissions=topic["permissions"],
            is_preview=is_draft,  # preview only when draft
            is_draft=is_draft,
            request_is_accepted=request_is_accepted,
            files=files,
            media_files=media_files,
            is_user_dashboard=True,
            custom_fields_ui=load_custom_fields()["ui"],
            user_communities_memberships=get_user_communities_memberships(),
            external_resources=get_external_resources(record),
            include_deleted=False,
        )

    elif has_community_topic or not has_topic:
        return render_template(
            f"invenio_requests/{request_type}/user_dashboard.html",
            base_template="invenio_app_rdm/users/base.html",
            user_avatar=avatar,
            invenio_request=request.to_dict(),
            request_is_accepted=request_is_accepted,
            permissions={},
            include_deleted=False,
        )

    topic = _resolve_topic_record(request)
    record_ui = topic["record_ui"]

    return render_template(
        f"invenio_requests/{request_type}/index.html",
        base_template="invenio_app_rdm/users/base.html",
        user_avatar=avatar,
        record=record,
        record_ui=record_ui,
        permissions=topic["permissions"],
        invenio_request=request.to_dict(),
        request_is_accepted=request_is_accepted,
        include_deleted=False,
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
    is_subcommunity_request = request_type == SubCommunityRequest.type_id
    is_subcommunity_invitation_request = (
        request_type == SubCommunityInvitationRequest.type_id
    )
    request_is_accepted = request["status"] == AcceptAction.status_to

    permissions = community.has_permissions_to(
        ["update", "read", "search_requests", "search_invites", "submit_record"]
    )

    if is_draft_submission or is_record_inclusion:
        topic = _resolve_topic_record(request)
        record_ui = topic["record_ui"]
        record = topic["record"]
        record_uuid = topic["record_uuid"]
        is_draft = record_ui["is_draft"] if record_ui else False
        checks = _resolve_checks(record_uuid, request, community)

        permissions.update(topic["permissions"])
        files = _resolve_record_or_draft_files(record_ui, request)
        media_files = _resolve_record_or_draft_media_files(record_ui, request)
        return render_community_theme_template(
            f"invenio_requests/{request_type}/index.html",
            theme=community.to_dict().get("theme", {}),
            base_template="invenio_communities/details/base.html",
            invenio_request=request.to_dict(),
            record=record,
            record_ui=record_ui,
            community=community,
            community_ui=community_ui,
            checks=checks,
            permissions=permissions,
            is_preview=is_draft,  # preview only when draft
            is_draft=is_draft,
            request_is_accepted=request_is_accepted,
            files=files,
            media_files=media_files,
            user_avatar=avatar,
            custom_fields_ui=load_custom_fields()["ui"],
            user_communities_memberships=get_user_communities_memberships(),
            external_resources=get_external_resources(record),
            include_deleted=False,
        )

    elif is_member_invitation:
        if not permissions["can_search_invites"]:
            raise PermissionDeniedError()

        return render_community_theme_template(
            f"invenio_requests/{request_type}/community_dashboard.html",
            theme=community.to_dict().get("theme", {}),
            base_template="invenio_communities/details/members/base.html",
            invenio_request=request.to_dict(),
            community=community,
            community_ui=community_ui,
            permissions=permissions,
            request_is_accepted=request_is_accepted,
            user_avatar=avatar,
            include_deleted=False,
        )

    elif is_subcommunity_request or is_subcommunity_invitation_request:
        return render_community_theme_template(
            f"invenio_requests/{request_type}/index.html",
            theme=community.to_dict().get("theme", {}),
            base_template="invenio_communities/details/base.html",
            invenio_request=request.to_dict(),
            community=community,
            community_ui=community_ui,
            permissions=permissions,
            request_is_accepted=request_is_accepted,
            user_avatar=avatar,
            include_deleted=False,
        )
