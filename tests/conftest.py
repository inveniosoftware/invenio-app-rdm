# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
# Copyright (C) 2019 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Common pytest fixtures and plugins."""

from copy import deepcopy
from datetime import date

import pytest
from flask_security.utils import hash_password
from invenio_access.models import ActionUsers

pytest_plugins = ("celery.contrib.pytest", )


@pytest.fixture(scope='function')
def minimal_input_record(users):
    """Minimal record data as dict coming from the external world."""
    user = users["user1"]
    return {
        "access": {
            "record": "public",
            "files": "public",
            "owned_by": [{"user": user["id"]}],
        },
        "metadata": {
            "publication_date": "2020-06-01",
            "resource_type": {
                "type": "image",
                "subtype": "image-photo"
            },
            # Technically not required
            "creators": [{
                "person_or_org": {
                    "name": "John Doe",
                    "type": "organizational"
                }
            }],
            "titles": [{
                "title": "A Romans story",
                "type": "Other",
                "lang": "eng"
            }]
        }
    }


@pytest.fixture(scope='function')
def minimal_record(users):
    """Minimal record data as dict coming from the external world."""
    user = users["user1"]
    return {
        "access": {
            "record": "public",
            "files": "public",
            "owned_by": [{"user": user["id"]}],
        },
        "metadata": {
            "publication_date": "2020-06-01",
            "resource_type": {
                "type": "image",
                "subtype": "image-photo"
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
    def dump_user(user):
        """User object to dict."""
        return {
            'email': user.email,
            'id': user.id,
            'password': password
        }
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
        'user1': dump_user(user1),
        'user2': dump_user(user2)
    }
