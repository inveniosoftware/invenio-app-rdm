# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2021 CERN.
# Copyright (C) 2019-2021 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Common pytest fixtures and plugins."""

from collections import namedtuple

import pytest
from flask_security import login_user
from flask_security.utils import hash_password
from invenio_access.models import ActionUsers
from invenio_access.permissions import system_identity
from invenio_access.proxies import current_access
from invenio_accounts.proxies import current_datastore
from invenio_accounts.testutils import login_user_via_session
from invenio_db import db
from invenio_vocabularies.proxies import current_service as vocabulary_service

pytest_plugins = ("celery.contrib.pytest", )


@pytest.fixture(scope='function')
def minimal_record(users):
    """Minimal record data as dict coming from the external world."""
    return {
        "access": {
            "record": "public",
            "files": "public",
        },
        "files": {
            "enabled": False  # Most tests don't care about file upload
        },
        "metadata": {
            "publication_date": "2020-06-01",
            "resource_type": {
                "id": "image-photo",
            },
            # Technically not required
            "creators": [{
                "person_or_org": {
                    "type": "personal",
                    "name": "Doe, John",
                    "given_name": "John Doe",
                    "family_name": "Doe",
                }
            }],
            "title": "A Romans story"
        }
    }


@pytest.fixture()
def users(app, db):
    """Create users."""
    password = '123456'
    with db.session.begin_nested():
        datastore = app.extensions['security'].datastore
        # create users
        hashed_password = hash_password(password)
        user1 = datastore.create_user(email='user1@test.com',
                                      password=hashed_password, active=True)
        user2 = datastore.create_user(email='user2@test.com',
                                      password=hashed_password, active=True)
        # Give role to admin
        db.session.add(ActionUsers(action='admin-access',
                                   user=user1))
    db.session.commit()
    return {
        'user1': user1,
        'user2': user2,
    }


@pytest.fixture()
def roles(app, db):
    """Create some roles."""
    with db.session.begin_nested():
        datastore = app.extensions["security"].datastore
        role1 = datastore.create_role(name="admin",
                                      description="admin role")
        role2 = datastore.create_role(name="test",
                                      description="tests are coming")

    db.session.commit()
    return {
        "admin": role1,
        "test": role2
    }


@pytest.fixture()
def admin_user(users, roles):
    """Give admin rights to a user."""
    user = users["user1"]
    role = roles["admin"]
    current_datastore.add_role_to_user(user, role)
    action = current_access.actions["superuser-access"]
    db.session.add(ActionUsers.allow(action, user_id=user.id))

    return user


@pytest.fixture()
def client_with_login(client, users):
    """Log in a user to the client."""
    user = users["user1"]
    login_user(user, remember=True)
    login_user_via_session(client, email=user.email)
    return client


@pytest.fixture(scope="module")
def resource_type_type(app):
    """Resource type vocabulary type."""
    return vocabulary_service.create_type(
        system_identity, "resource_types", "rsrct")


@pytest.fixture(scope="module")
def resource_type_item(app, resource_type_type):
    """Resource type vocabulary record."""
    return vocabulary_service.create(system_identity, {
        "id": "image-photo",
        "props": {
            "csl": "graphic",
            "datacite_general": "Image",
            "datacite_type": "Photo",
            "openaire_resourceType": "25",
            "openaire_type": "dataset",
            "schema.org": "https://schema.org/Photograph",
            "subtype": "image-photo",
            "subtype_name": "Photo",
            "type": "image",
            "type_icon": "chart bar outline",
            "type_name": "Image",
        },
        "title": {
            "en": "Photo"
        },
        "type": "resource_types"
    })


RunningApp = namedtuple("RunningApp", [
    "app", "location", "resource_type_item"
])


@pytest.fixture
def running_app(app, location, resource_type_item):
    """Fixture mimicking a running app."""
    return RunningApp(app, location, resource_type_item)
