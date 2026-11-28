"""Personal data export."""

import json
import os
import time
from collections import defaultdict
from contextlib import ExitStack
from datetime import date, datetime
from pathlib import Path

import yaml
from flask import current_app
from invenio_access.permissions import authenticated_user, system_identity
from invenio_access.utils import get_identity
from invenio_accounts.proxies import current_datastore
from invenio_communities.proxies import current_communities as communities_service
from invenio_rdm_records.proxies import current_rdm_records_service as records_service
from invenio_rdm_records.records.models import RDMRecordQuota
from invenio_rdm_records.services.components import DefaultRecordsComponents
from invenio_requests import current_requests_service as requests_service
from invenio_requests.proxies import current_events_service as events_service
from invenio_search.engine import dsl
from opensearchpy import OpenSearch
from zipstream import ZIP_STORED, ZipStream

OUTPUT = "yaml"  # "json" or "yaml"
INCLUDE_REVISIONS = False  # revisions are the edits of versions
INCLUDE_DELETED = True

# Utils


def _create_dir(directory):
    """Creates the directory if it doesn't exist."""
    if not os.path.exists(directory):
        os.makedirs(directory)


def _get_user_identity(user):
    """Get user identity."""
    identity = get_identity(current_datastore.get_user(user))
    identity.provides.add(authenticated_user)
    return identity


def _output(output, wrapper):
    """Dump the data in the relevant format."""
    if OUTPUT == "json":
        json.dump(output, wrapper, ensure_ascii=False, indent=2)
    elif OUTPUT == "yaml":
        yaml.dump(output, wrapper)
    else:
        raise RuntimeError("Output format not configured")


# Account data


def _export_external_identifiers(user):
    """Export user external identifiers."""
    external_identifiers = []
    for identifier in user.external_identifiers:
        external_identifiers.append(
            {
                "identifier": identifier.id,
                "method": identifier.method,
                "created": (
                    identifier.created.isoformat() if identifier.created else None
                ),
                "updated": (
                    identifier.updated.isoformat() if identifier.updated else None
                ),
            }
        )
    return external_identifiers


def _export_user_account_data(user):
    """Export user account data."""
    return {
        "id": str(user.id),
        "email": user.email,
        "username": user.username,
        "domain": user.domain,
        "external_identifiers": _export_external_identifiers(user),
        "active": user.active,  # is_active/active?
        "is_anonymous": user.is_anonymous,
        "is_authenticated": user.is_authenticated,
        "confirmed_at": user.confirmed_at.isoformat() if user.confirmed_at else None,
        "verified_at": user.verified_at.isoformat() if user.verified_at else None,
        "created": user.created.isoformat() if user.created else None,
        "updated": user.updated.isoformat() if user.updated else None,
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        "current_login_at": (
            user.current_login_at.isoformat() if user.current_login_at else None
        ),
        "last_login_ip": user.last_login_ip,
        "current_login_ip": user.current_login_ip,
        "login_count": user.login_count,
        "preferences": user._preferences,
    }


def _export_oauth_data(user):
    """Export OAuth account and token data."""
    remote_accounts = []
    remote_tokens = []

    for account in user.remote_accounts:
        remote_accounts.append(
            {
                "id": account.id,
                "user_id": str(account.user_id),
                "client_id": account.client_id,
                "extra_data": dict(account.extra_data) if account.extra_data else {},
                "created": account.created.isoformat() if account.created else None,
                "updated": account.updated.isoformat() if account.updated else None,
            }
        )
    for token in user.oauth2tokens:
        remote_tokens.append(
            {
                "id": token.id,
                "name": token.client.name,
                "scopes": token.scopes,
                "is_internal": token.is_internal,
                "is_personal": token.is_personal,
                "token_type": token.token_type,
                "access_token": (
                    token.access_token[:5] + "..." if token.access_token else None
                ),
            }
        )
    oauth_data = {
        "linked_accounts": remote_accounts,
        "remote_tokens": remote_tokens,
    }

    return oauth_data


def _export_user_sessions(user):
    """Export user activesessions."""
    sessions = []
    for session in user.active_sessions:
        sessions.append(
            {
                "sid": session.sid_s,
                "browser": session.browser,
                "browser_version": session.browser_version,
                "country": session.country,
                "device": session.device,
                "ip": session.ip,
                "os": session.os,
                "user_id": str(session.user_id),
                "created": session.created.isoformat() if session.created else None,
                "updated": session.updated.isoformat() if session.updated else None,
            }
        )

    return sessions


# Records and drafts


def _export_record(rec, user_id, path):
    """Export record data with user's identity after running all components."""
    rev_record_api = records_service.record_cls(rec, model=rec.model)
    recid = rev_record_api["id"]
    user_identity = _get_user_identity(user_id)

    for component in DefaultRecordsComponents:
        if hasattr(component, "read"):
            component(records_service).read(user_identity, record=rev_record_api)

    filename = f"{recid}-{rec.updated.isoformat()}" if INCLUDE_REVISIONS else str(recid)
    file_path = Path(path, f"{filename}.{OUTPUT}")
    result_data = records_service.result_item(
        records_service,
        user_identity,
        rev_record_api,
        links_tpl=records_service.links_item_tpl,
        expandable_fields=records_service.expandable_fields,
        nested_links_item=getattr(records_service.config, "nested_links_item", None),
        expand=False,
    )
    output = result_data.to_dict()

    record_quota = RDMRecordQuota.query.filter(
        RDMRecordQuota.parent_id == rec.parent.id
    ).one_or_none()
    quota = (
        record_quota.quota_size
        if record_quota is not None
        else current_app.config.get("RDM_FILES_DEFAULT_QUOTA_SIZE", 10**6)
    )
    output["quota"] = quota

    with open(file_path, "w", encoding="utf-8") as w:
        _output(output, w)


def _check_total_file_size(rec_or_draft_ids, is_record, identity):
    """Quick check to make sure it's safe to dump the files."""
    total_size = 0
    print("Checking file size...")
    for rec_id in rec_or_draft_ids:
        if is_record:
            files = records_service.files.list_files(identity, rec_id)
        else:
            files = records_service.draft_files.list_files(identity, rec_id)
        total_size += sum(
            [file.file.size for file in files._results if file.file]
        )  # if file.file is to account for Pending files

    print(f"{total_size*1e-9:0.2f} GB, {total_size} bytes")
    if total_size > 10 * 1000000000:  # 10 GB
        input(
            f"Ensure there is more than {total_size*1e-9:0.2f} GB available. Press Enter to continue or Ctrl+C to cancel"
        )


def _dump_files(rec_id, identity, directory, is_record):
    """Create a zipped version of all files."""
    if is_record:
        files = records_service.files.list_files(identity, rec_id)
    else:
        files = records_service.draft_files.list_files(identity, rec_id)

    zip_path = os.path.join(directory, f"{rec_id}.zip")

    # Create and save the zip file
    zs = ZipStream(compress_type=ZIP_STORED)
    with ExitStack() as stack:
        for file_obj in files._results:
            if file_obj.file is not None:
                fp = stack.enter_context(file_obj.open_stream("rb"))
                zs.add(fp, file_obj.key)

        # Write the entire zip to disk
        with open(zip_path, "wb") as f:
            for chunk in zs.all_files():
                f.write(chunk)
            for chunk in zs.finalize():
                f.write(chunk)


def export_account_data(user_id, directory):
    """Export all personal data for a user.

    This command exports all personal data associated with a user including:
    - Account information
    - Profile data
    - OAuth connections (linked accounts)
    - Sessions (login history/devices)
    - Preferences (visibility, locale, timezone, notifications)
    """
    try:
        user = User.query.filter_by(id=user_id).first()
        if not user:
            return

        export_data = {
            "export_date": datetime.utcnow().isoformat(),
            "user_id": str(user_id),
            "account": _export_user_account_data(user),
            "profile": user._user_profile,
            "oauth": _export_oauth_data(user),
            "sessions": _export_user_sessions(user),
        }

        with open(
            Path(directory, f"personal_data.{OUTPUT}"), "w", encoding="utf-8"
        ) as w:
            _output(export_data, w)
    except Exception:
        raise


def get_records(user_id, directory):
    """Export all records and their revisions."""
    user_records_q = dsl.Q("term", **{"parent.access.owned_by.user": user_id})
    records = records_service.scan(
        identity=system_identity,  # get records as system but we serialize as user
        extra_filter=user_records_q,
        allversions=True,
        include_deleted=INCLUDE_DELETED,
    )
    record_ids = [int(record["id"]) for record in records]
    _check_total_file_size(record_ids, True, system_identity)

    # get records again as consumed above
    records = records_service.scan(
        identity=system_identity,
        extra_filter=user_records_q,
        allversions=True,
        include_deleted=INCLUDE_DELETED,
    )

    exporter = current_app.config.get("APP_RDM_RECORD_EXPORTERS", {}).get("json")
    if not exporter:
        raise RuntimeError("Exporter not configured.")

    # Group records by parent ID
    records_by_parent = defaultdict(list)
    for record in records:
        parent_id = record.get("parent", {}).get("id", "no-parent")
        records_by_parent[parent_id].append(record["id"])

    records_by_parent = dict(records_by_parent)

    user_identity = _get_user_identity(user_id)
    top_path = Path(directory, "records")
    _create_dir(top_path)
    for parent, version_ids in records_by_parent.items():
        parent_path = Path(top_path, f"{parent}")
        _create_dir(parent_path)

        for version_id in version_ids:
            version_path = Path(parent_path, f"{version_id}")
            _create_dir(version_path)

            version = records_service.record_cls.pid.resolve(version_id)
            if INCLUDE_REVISIONS:
                revisions = version.revisions
                if len(revisions) == 0:
                    revisions = [
                        version
                    ]  # records imported into RDM don't have revisions

                for revision in revisions:
                    _export_record(revision, user_id, version_path)
                    # user can't dump from deleted records
                    identity = system_identity if INCLUDE_DELETED else user_identity
                    _dump_files(revision.revision_id, identity, version_path, True)
            else:
                _export_record(version, user_id, version_path)
                # user can't dump from deleted records
                identity = system_identity if INCLUDE_DELETED else user_identity
                _dump_files(version_id, identity, version_path, True)


def get_drafts(user_id, directory):
    """Export all drafts."""
    user_records_q = dsl.Q("term", **{"parent.access.owned_by.user": user_id})
    user_drafts_is_pub_q = dsl.Q("term", **{"is_published": False})
    user_identity = _get_user_identity(user_id)
    records = records_service.search_drafts(
        identity=user_identity,
        extra_filter=user_records_q & user_drafts_is_pub_q,
        allversions=True,
        size=10000,  # TODO only first 10k
    )
    record_ids = [int(record["id"]) for record in records]
    _check_total_file_size(record_ids, False, user_identity)

    exporter = current_app.config.get("APP_RDM_RECORD_EXPORTERS", {}).get("json")
    if not exporter:
        raise RuntimeError("Exporter not configured.")

    # Group records by parent ID
    records_by_parent = defaultdict(list)
    for record in records:
        parent_id = record.get("parent", {}).get("id", "no-parent")
        records_by_parent[parent_id].append(record["id"])

    records_by_parent = dict(records_by_parent)

    top_path = Path(directory, "drafts")
    _create_dir(top_path)
    for parent, version_ids in records_by_parent.items():
        parent_path = Path(top_path, f"{parent}")
        _create_dir(parent_path)

        for version_id in version_ids:

            version = records_service.draft_cls.pid.resolve(
                version_id, registered_only=False
            )
            _export_record(version, user_id, parent_path)
            _dump_files(version_id, user_identity, parent_path, False)


def get_requests(user_id, directory):
    """Export all requests."""
    user_identity = _get_user_identity(user_id)
    requests = requests_service.search_user_requests(
        identity=user_identity,
        size=10000,  # TODO only first 10k
    )
    # print(f"{requests.total} requests")

    top_path = Path(directory, "requests")
    _create_dir(top_path)
    for request in requests:
        try:
            filename = Path(top_path, f"{request['id']}.{OUTPUT}")
            request["events"] = events_service.search(
                user_identity, request["id"], size=10000  # TODO only first 10k
            ).to_dict()["hits"]["hits"]
            with open(filename, "w", encoding="utf-8") as w:
                _output(request, w)
        except:
            print(f"ERROR: {request['id']} could not be exported")


def get_communities(user_id, directory):
    """Export all communities."""
    user_identity = _get_user_identity(user_id)
    communities = communities_service.service.members.read_memberships(user_identity)[
        "memberships"
    ]

    output = []
    for id, role in communities:
        try:
            community = communities_service.service.read(
                user_identity, id, include_deleted=INCLUDE_DELETED
            ).to_dict()
        except:
            # if user is blocked they won't be able to read community
            community = communities_service.service.read(
                system_identity, id, include_deleted=INCLUDE_DELETED
            ).to_dict()
        community["role"] = role
        output.append(community)

    with open(Path(directory, f"communities.{OUTPUT}"), "w", encoding="utf-8") as w:
        _output(output, w)


def get_access_logs(user_id, directory):
    """Export access logs from OpenSearch/ElasticSearch.

    Only tested with OpenSearch
    """
    opensearch_url = os.getenv("ELASTICSEARCH_URL")
    opensearch_username = os.getenv("ELASTICSEARCH_USERNAME")
    opensearch_password = os.getenv("ELASTICSEARCH_PASSWORD")
    opensearch_verify_certs = (
        os.getenv("ELASTICSEARCH_VERIFY_CERTS", "true").lower() == "true"
    )

    if not all([opensearch_url, opensearch_username, opensearch_password]):
        raise ValueError("Missing required OpenSearch environment variables")

    client = OpenSearch(
        hosts=[opensearch_url],
        http_auth=(opensearch_username, opensearch_password),
        verify_certs=opensearch_verify_certs,
        use_ssl=opensearch_url.startswith("https"),
    )

    selected_fields = [
        "data.http_x_forwarded_for",
        "data.url",
        "data.user_agent",
        "data.user_id",
        "data.request_timestamp",
        "data.referer",
        "data.http_code",
        "data.http_method",
        "data.country",
        "data.geo",
        "data.session_id",
    ]

    try:
        response = client.search(
            index="_all",
            body={
                "query": {"term": {"data.user_id": user_id}},
                "_source": selected_fields,
                "size": 10000,  # TODO only first 10k
                "sort": [{"data.request_timestamp": {"order": "asc"}}],
            },
        )

        hits = response.get("hits", {}).get("hits", [])

        output = [h["_source"]["data"] for h in hits]

        with open(Path(directory, f"access-logs.{OUTPUT}"), "w", encoding="utf-8") as w:
            if OUTPUT == "json":
                _output(json.dumps(output, indent=2, default=str), w)
            else:
                _output(output, w)

    except Exception as e:
        print(f"Error querying OpenSearch: {e}")
        return None


def export_user_data(user_id, output_dir=False):
    """Export all user data for a provided user ID.

    The structure of the resulting directory is:
        sitename-username-date:
            access-logs.yaml      # if relevant environment variables are set
            communities.yaml      # metadata for communities they are members of
            personal_data.yaml    # profile data, sessions, oauth, etc
            drafts/
                234567/
                    234568.yaml   # metadata
                    234568.zip    # files zipped
            records/
                123456/
                    123457.yaml   # metadata
                    123457.zip    # files zipped
            requests/
                # requests and all events that the user has access to
                2694d0a9-e656-4d40-aaf2-0c3519b27960.yaml

    You can also change the following variables at the top of the script
        OUTPUT = "yaml"           # "json" or "yaml"
        INCLUDE_REVISIONS = False # revisions are the edits of versions
        INCLUDE_DELETED = False   # whether to include their deleted records
    """
    user = User.query.filter_by(id=user_id).first()
    assert user

    today = date.today().isoformat()
    sitename = current_app.config.get("THEME_SITENAME", "inveniordm").lower()
    directory = (
        Path(output_dir, f"{sitename}-{user.username}-{today}")
        if output_dir
        else Path(f"{sitename}-{user.username}-{today}")
    )
    _create_dir(directory)

    tasks = [
        export_account_data,
        get_records,
        get_drafts,
        get_requests,
        get_communities,
    ]

    if os.getenv("ELASTICSEARCH_PASSWORD"):
        tasks.append(get_access_logs)  # TODO only returns first 10k logs

    for task in tasks:
        tick = time.time()
        print(f"=== {task.__name__}")
        task(user_id, directory)
        print(f"=== {task.__name__} took {time.time() - tick:.4f} seconds ")
