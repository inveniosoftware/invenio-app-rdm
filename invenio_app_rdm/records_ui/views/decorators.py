# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2025 CERN.
# Copyright (C) 2019-2025 Northwestern University.
# Copyright (C)      2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Routes for record-related pages provided by Invenio-App-RDM."""

from functools import wraps

from flask import current_app, g, make_response, redirect, request, session, url_for
from flask_login import login_required
from invenio_base import invenio_url_for
from invenio_communities.communities.resources.serializer import (
    UICommunityJSONSerializer,
)
from invenio_communities.proxies import current_communities
from invenio_pidstore.errors import PIDDoesNotExistError
from invenio_rdm_records.proxies import current_rdm_records
from invenio_rdm_records.resources.serializers.signposting import (
    FAIRSignpostingProfileLvl1Serializer,
)
from invenio_records_resources.services.errors import PermissionDeniedError
from sqlalchemy.orm.exc import NoResultFound


def service():
    """Get the record service."""
    return current_rdm_records.records_service


def files_service():
    """Get the record files service."""
    return current_rdm_records.records_service.files


def media_files_service():
    """Get the record files service."""
    return current_rdm_records.records_media_files_service.files


def draft_files_service():
    """Get the record files service."""
    return current_rdm_records.records_service.draft_files


def draft_media_files_service():
    """Get the record files service."""
    return current_rdm_records.records_media_files_service.draft_files


def pass_record_latest(f):
    """Decorate a view to pass the latest version of a record."""

    @wraps(f)
    def view(**kwargs):
        pid_value = kwargs.get("pid_value")
        record_latest = service().read_latest(id_=pid_value, identity=g.identity)
        kwargs["record"] = record_latest
        return f(**kwargs)

    return view


def pass_draft(expand=False):
    """Decorator to retrieve the draft using the record service."""

    def decorator(f):
        @wraps(f)
        def view(**kwargs):
            pid_value = kwargs.get("pid_value")
            try:
                record_service = service()
                draft = record_service.read_draft(
                    id_=pid_value,
                    identity=g.identity,
                    expand=expand,
                )
                kwargs["draft"] = draft
                kwargs["files_locked"] = (
                    record_service.config.lock_edit_published_files(
                        record_service, g.identity, draft=draft, record=draft._record
                    )
                )
                return f(**kwargs)
            except PIDDoesNotExistError:
                # Redirect to /records/:id because users are interchangeably
                # using /records/:id and /uploads/:id when sharing links, so in
                # case a draft doesn't exists, when check if the record exists
                # always.
                return redirect(
                    url_for(
                        "invenio_app_rdm_records.record_detail",
                        pid_value=pid_value,
                    )
                )

        return view

    return decorator


def pass_is_preview(f):
    """Decorate a view to check if it's a preview."""

    @wraps(f)
    def view(**kwargs):
        kwargs["is_preview"] = request.args.get("preview") == "1"
        return f(**kwargs)

    return view


# TODO to be improved as a request arg schema (following the REST views)
def pass_include_deleted(f):
    """Decorate a view to check if it's a include deleted."""

    @wraps(f)
    def view(**kwargs):
        deleted_arg = request.args.get("include_deleted")
        include_deleted = False
        if deleted_arg == "1":
            include_deleted = True
        kwargs["include_deleted"] = include_deleted
        return f(**kwargs)

    return view


def pass_record_from_pid(f):
    """Decorate a view to pass the record from a pid."""

    @wraps(f)
    def view(*args, **kwargs):
        scheme = kwargs.get("pid_scheme")
        pid_value = kwargs.get("pid_value")

        record = service().pids.resolve(
            g.identity,
            pid_value,
            scheme,
        )

        kwargs["record"] = record
        return f(**kwargs)

    return view


def pass_record_or_draft(expand=False):
    """Decorate to retrieve the record or draft using the record service."""

    def decorator(f):
        @wraps(f)
        def view(**kwargs):
            pid_value = kwargs.get("pid_value")
            is_preview = kwargs.get("is_preview")
            include_deleted = kwargs.get("include_deleted", False)
            read_kwargs = {
                "id_": pid_value,
                "identity": g.identity,
                "expand": expand,
            }

            if is_preview:
                try:
                    record = service().read_draft(**read_kwargs)
                except NoResultFound:
                    try:
                        record = service().read(
                            include_deleted=include_deleted, **read_kwargs
                        )
                    except NoResultFound:
                        # If the parent pid is being used we can get the id of the latest record and redirect
                        latest_version = service().read_latest(**read_kwargs)
                        return redirect(
                            url_for(
                                "invenio_app_rdm_records.record_detail",
                                pid_value=latest_version.id,
                                preview=1,
                            )
                        )
            else:
                try:
                    record = service().read(
                        include_deleted=include_deleted, **read_kwargs
                    )
                except NoResultFound:
                    # If the parent pid is being used we can get the id of the latest record and redirect
                    latest_version = service().read_latest(**read_kwargs)
                    return redirect(
                        url_for(
                            "invenio_app_rdm_records.record_detail",
                            pid_value=latest_version.id,
                        )
                    )
            kwargs["record"] = record
            return f(**kwargs)

        return view

    return decorator


def pass_file_item(is_media=False):
    """Decorator to pass a file or media file item using the corresponding service."""

    def decorator(f):
        @wraps(f)
        def view(**kwargs):
            pid_value = kwargs.get("pid_value")
            file_key = kwargs.get("filename")
            is_preview = kwargs.get("is_preview")
            read_kwargs = {
                "id_": pid_value,
                "file_key": file_key,
                "identity": g.identity,
            }
            draft_service = (
                draft_media_files_service if is_media else draft_files_service
            )
            record_service = media_files_service if is_media else files_service

            if is_preview:
                try:
                    item = draft_service().get_file_content(**read_kwargs)
                except NoResultFound:
                    item = record_service().get_file_content(**read_kwargs)
            else:
                item = record_service().get_file_content(**read_kwargs)

            kwargs["file_item"] = item
            return f(**kwargs)

        return view

    return decorator


def pass_file_metadata(f):
    """Decorate a view to pass a file's metadata using the files service."""

    @wraps(f)
    def view(**kwargs):
        pid_value = kwargs.get("pid_value")
        file_key = kwargs.get("filename")
        is_preview = kwargs.get("is_preview")
        read_kwargs = {"id_": pid_value, "file_key": file_key, "identity": g.identity}

        if is_preview:
            try:
                files = draft_files_service().read_file_metadata(**read_kwargs)
            except NoResultFound:
                files = files_service().read_file_metadata(**read_kwargs)
        else:
            files = files_service().read_file_metadata(**read_kwargs)

        kwargs["file_metadata"] = files
        return f(**kwargs)

    return view


def pass_record_files(f):
    """Decorate a view to pass a record's files using the files service."""

    @wraps(f)
    def view(**kwargs):
        is_preview = kwargs.get("is_preview")
        pid_value = kwargs.get("pid_value")
        read_kwargs = {"id_": pid_value, "identity": g.identity}

        try:
            if is_preview:
                try:
                    files = draft_files_service().list_files(**read_kwargs)
                except NoResultFound:
                    files = files_service().list_files(**read_kwargs)
            else:
                files = files_service().list_files(**read_kwargs)

            kwargs["files"] = files

        except PermissionDeniedError:
            # this is handled here because we don't want a 404 on the landing
            # page when a user is allowed to read the metadata but not the
            # files
            kwargs["files"] = None

        return f(**kwargs)

    return view


def pass_record_media_files(f):
    """Decorate a view to pass a record's media files using the files service."""

    @wraps(f)
    def view(**kwargs):
        is_preview = kwargs.get("is_preview")
        pid_value = kwargs.get("pid_value")
        read_kwargs = {"id_": pid_value, "identity": g.identity}

        try:
            if is_preview:
                try:
                    media_files = draft_media_files_service().list_files(**read_kwargs)
                except NoResultFound:
                    media_files = media_files_service().list_files(**read_kwargs)
            else:
                media_files = media_files_service().list_files(**read_kwargs)

            kwargs["media_files"] = media_files

        except PermissionDeniedError:
            # this is handled here because we don't want a 404 on the landing
            # page when a user is allowed to read the metadata but not the
            # files
            kwargs["media_files"] = None

        return f(**kwargs)

    return view


def pass_draft_files(f):
    """Decorate a view to pass a draft's files using the files service."""

    @wraps(f)
    def view(**kwargs):
        try:
            pid_value = kwargs.get("pid_value")
            files = draft_files_service().list_files(id_=pid_value, identity=g.identity)
            kwargs["draft_files"] = files
        except PermissionDeniedError:
            # this is handled here because we don't want a 404 on the landing
            # page when a user is allowed to read the metadata but not the
            # files
            kwargs["draft_files"] = None

        return f(**kwargs)

    return view


def pass_draft_community(f):
    """Decorate to retrieve the community record using the community service.

    Pass the community record or None when creating a new draft and having
    selected a community via the url.
    """

    @wraps(f)
    def view(**kwargs):
        comid = request.args.get("community")
        if comid:
            community = current_communities.service.read(id_=comid, identity=g.identity)
            kwargs["community"] = UICommunityJSONSerializer().dump_obj(
                community.to_dict()
            )

        return f(**kwargs)

    return view


def _get_header(rel, value, link_type=None):
    header = f'<{value}> ; rel="{rel}"'
    if link_type:
        header += f' ; type="{link_type}"'
    return header


def _get_signposting_collection(pid_value):
    ui_url = invenio_url_for(
        "invenio_app_rdm_records.record_detail", pid_value=pid_value
    )
    return _get_header("collection", ui_url, "text/html")


def _get_signposting_describes(pid_value):
    ui_url = invenio_url_for(
        "invenio_app_rdm_records.record_detail", pid_value=pid_value
    )
    return _get_header("describes", ui_url, "text/html")


def _get_signposting_linkset(pid_value):
    api_url = invenio_url_for("records.read", pid_value=pid_value)
    return _get_header("linkset", api_url, "application/linkset+json")


def add_signposting_landing_page(f):
    """Add signposting links to the landing page view's response headers."""

    @wraps(f)
    def view(*args, **kwargs):
        response = make_response(f(*args, **kwargs))

        # Relies on other decorators having operated before it
        if current_app.config[
            "APP_RDM_RECORD_LANDING_PAGE_FAIR_SIGNPOSTING_LEVEL_1_ENABLED"
        ]:
            record = kwargs["record"]

            signposting_headers = (
                FAIRSignpostingProfileLvl1Serializer().serialize_object(
                    record.to_dict()
                )
            )

            response.headers["Link"] = signposting_headers
        else:
            pid_value = kwargs["pid_value"]
            signposting_link = invenio_url_for("records.read", pid_value=pid_value)

            response.headers["Link"] = (
                f'<{signposting_link}> ; rel="linkset" ; type="application/linkset+json"'  # fmt: skip
            )

        return response

    return view


def add_signposting_content_resources(f):
    """Add signposting links to the content resources view's response headers."""

    @wraps(f)
    def view(*args, **kwargs):
        response = make_response(f(*args, **kwargs))

        # Relies on other decorators having operated before it
        pid_value = kwargs["pid_value"]

        signposting_headers = [
            _get_signposting_collection(pid_value),
            _get_signposting_linkset(pid_value),
        ]

        response.headers["Link"] = " , ".join(signposting_headers)

        return response

    return view


def add_signposting_metadata_resources(f):
    """Add signposting links to the metadata resources view's response headers."""

    @wraps(f)
    def view(*args, **kwargs):
        response = make_response(f(*args, **kwargs))

        # Relies on other decorators having operated before it
        pid_value = kwargs["pid_value"]

        signposting_headers = [
            _get_signposting_describes(pid_value),
            _get_signposting_linkset(pid_value),
        ]

        response.headers["Link"] = " , ".join(signposting_headers)

        return response

    return view


def secret_link_or_login_required():
    """Skip login redirection check for requests with secret links.

    If access has been granted via a secret link, then permissions are checked
    in the dedicated view.
    """

    def decorator(f):
        @wraps(f)
        def view(**kwargs):
            secret_link_token_arg = "token"
            session_token = session.get(secret_link_token_arg, None)
            if session_token is None:
                login_required(f)
            return f(**kwargs)

        return view

    return decorator


def no_cache_response(f):
    """Add appropriate response headers to force no caching.

    This decorator is used to prevent caching of the response in the browser. This is needed
    in the deposit form as we initialize the form with the record metadata included in the html page
    and we don't want the browser to cache this page so that the user always gets the latest version of the record.
    """

    @wraps(f)
    def view(*args, **kwargs):
        response = make_response(f(*args, **kwargs))

        response.cache_control.no_cache = True
        response.cache_control.no_store = True
        response.cache_control.must_revalidate = True

        return response

    return view
