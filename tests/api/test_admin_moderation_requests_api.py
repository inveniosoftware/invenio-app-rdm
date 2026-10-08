# SPDX-FileCopyrightText: 2026 Northwestern University.
# SPDX-License-Identifier: MIT

"""Test administration moderation requests api."""

import copy

import pytest
from invenio_access.models import ActionUsers
from invenio_access.permissions import superuser_access
from invenio_rdm_records.requests import RecordDeletion, UserAccessRequest
from invenio_requests.proxies import current_requests_service
from invenio_users_resources.proxies import current_users_service


@pytest.fixture(scope="module")
def users(UserFixture, app, database):
    """Users for this module's test(s)."""
    users_dict_in = [
        {"email": "user1@inveniosoftware.org"},
        {"email": "user2@inveniosoftware.org"},
    ]

    users_dict_out = {}
    for user_dict_in in users_dict_in:
        u = UserFixture(
            email=user_dict_in["email"],
            password="testuser",
        )
        u.create(app, database)
        users_dict_out[user_dict_in["email"]] = u

    current_users_service.indexer.process_bulk_queue()
    current_users_service.record_cls.index.refresh()

    return users_dict_out


@pytest.fixture(scope="module")
def super_user(UserFixture, app, database):
    """Super user."""
    db = database
    u = UserFixture(
        email="superuser@inveniosoftware.org",
        password="testsuperuser",
    )
    u.create(app, db)
    # action = current_access.actions["superuser-access"]
    db.session.add(ActionUsers.allow(superuser_access, user_id=u.id))
    db.session.commit()

    current_users_service.indexer.process_bulk_queue()
    current_users_service.record_cls.index.refresh()

    return u


def test_endpoint_filters_and_aggregates(
    super_user,
    app,
    client,
    create_record,
    headers,
    minimal_record,
    records_service,
    search_clear,
    users,
):
    user_1 = users["user1@inveniosoftware.org"]
    record_dict_in = copy.deepcopy(minimal_record)
    # record_dict_in["access"]["files"] = "restricted"
    # Create record
    record_result = create_record(
        identity=user_1.identity,
        data=record_dict_in,
        # do we even need files for the purpose of this? Try without
    )
    record_data = record_result._record
    # Create deletion requests (filtered in)
    current_requests_service.create(
        identity=user_1.identity,
        request_type=RecordDeletion,
        topic=record_data,
        creator=None,  # identity.user,
        receiver=None,
        data={
            "payload": {
                "comment": "Please delete this record.",
                "reason": "test-record",
            }
        },
    )
    # Create unrelated requests (filtered out)
    # the details are unimportant so nonsensical
    user_2 = users["user2@inveniosoftware.org"]
    current_requests_service.create(
        identity=user_2.identity,
        request_type=UserAccessRequest,
        topic=record_data,
        creator=None,  # identity.user,
        receiver=record_data.parent.access.owner.resolve(),
        data={
            "payload": {
                "message": "Please give me access!",
                "email": "fake@example.org",
                "full_name": "ABC",
                "consent_to_share_personal_data": "true",
            }
        },
    )
    current_requests_service.record_cls.index.refresh()

    # Get requests from endpoint
    client = super_user.login(client)
    r = client.get(
        "/administration/moderation/requests",
        headers=headers,
    )

    assert r.status_code == 200
    # test filtering valid
    assert 1 == r.json["hits"]["total"]
    hit = r.json["hits"]["hits"][0]
    assert RecordDeletion.type_id == hit["type"]
    # test aggregating valid
    # just "status" is needed for now
    assert "status" in r.json["aggregations"]
    # test links valid
    expected_links = {
        "self": "https://127.0.0.1:5000/api/administration/moderation/requests?page=1&size=25&sort=newest"  # noqa
    }
    assert expected_links == r.json["links"]
