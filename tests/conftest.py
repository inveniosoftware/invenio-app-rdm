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


@pytest.fixture(scope='function')
def minimal_input_record():
    """Minimal record data as dict coming from the external world."""
    return {
        "access": {
            "metadata_restricted": False,
            "files_restricted": False,
            "owners": [1],
            "access_right": "open",
            "created_by": 1,
        },
        "metadata": {
            "publication_date": "2020-06-01",
            "resource_type": {
                "type": "image",
                "subtype": "image-photo"
            },
            # Technically not required
            "creators": [{
                "name": "John Doe",
                "type": "Personal"
            }],
            "titles": [{
                "title": "A Romans story",
                "type": "Other",
                "lang": "eng"
            }]
        }
    }


@pytest.fixture(scope='function')
def minimal_record():
    """Minimal record data as dict coming from the external world."""
    return {
        "access": {
            "metadata": False,
            "files": False,
            "owned_by": [1],
            "access_right": "open"
        },
        "metadata": {
            "publication_date": "2020-06-01",
            "resource_type": {
                "type": "image",
                "subtype": "image-photo"
            },
            # Technically not required
            "creators": [{
                "name": "John Doe",
                "type": "personal"
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
