# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2021 CERN.
# Copyright (C) 2019-2021 Northwestern University.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Common pytest fixtures and plugins."""

# Monkey patch Werkzeug 2.1
# Flask-Login uses the safe_str_cmp method which has been removed in Werkzeug
# 2.1. Flask-Login v0.6.0 (yet to be released at the time of writing) fixes the
# issue. Once we depend on Flask-Login v0.6.0 as the minimal version in
# Flask-Security-Invenio/Invenio-Accounts we can remove this patch again.
try:
    # Werkzeug <2.1
    from werkzeug import security
    security.safe_str_cmp
except AttributeError:
    # Werkzeug >=2.1
    import hmac

    from werkzeug import security
    security.safe_str_cmp = hmac.compare_digest

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
from invenio_records_resources.proxies import current_service_registry
from invenio_vocabularies.contrib.subjects.api import Subject
from invenio_vocabularies.proxies import current_service as vocabulary_service
from invenio_vocabularies.records.api import Vocabulary
from invenio_vocabularies.records.models import VocabularyScheme


@pytest.fixture(scope='module')
def app_config(app_config):
    """Override pytest-invenio app_config fixture to disable CSRF check."""
    # Variable not used. We set it to silent warnings
    app_config['REST_CSRF_ENABLED'] = False

    return app_config


@pytest.fixture(scope="module")
def subjects_service(app):
    """Subjects service."""
    return current_service_registry.get("subjects")


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
        system_identity, "resourcetypes", "rsrct")


@pytest.fixture(scope="module")
def resource_type_item(app, resource_type_type):
    """Resource type vocabulary record."""
    rst = vocabulary_service.create(system_identity, {
        "id": "image-photo",
        "icon": "chart bar outline",
        "props": {
            "csl": "graphic",
            "datacite_general": "Image",
            "datacite_type": "Photo",
            "eurepo": "info:eu-repo/semantic/image-photo",
            "openaire_resourceType": "25",
            "openaire_type": "dataset",
            "schema.org": "https://schema.org/Photograph",
            "subtype": "image-photo",
            "type": "image",
        },
        "title": {
            "en": "Photo"
        },
        "tags": ["depositable", "linkable"],
        "type": "resourcetypes"
    })

    Vocabulary.index.refresh()

    return rst


@pytest.fixture(scope="module")
def languages_type(app):
    """Language vocabulary type."""
    return vocabulary_service.create_type(
        system_identity, "languages", "lng")


@pytest.fixture(scope="module")
def language_item(app, languages_type):
    """Language vocabulary record."""
    lang = vocabulary_service.create(system_identity, {
        "id": "eng",
        "props": {
            "alpha_2": "",
        },
        "title": {
            "en": "English"
        },
        "type": "languages"
    })

    Vocabulary.index.refresh()

    return lang


@pytest.fixture
def subjects_mesh_scheme(app, db):
    """Subject Scheme for MeSH."""
    scheme = VocabularyScheme.create(
        id="MeSH", parent_id="subjects",
        name="Medical Subject Headings",
        uri="https://www.nlm.nih.gov/mesh/meshhome.html")
    db.session.commit()
    return scheme


@pytest.fixture
def subject_item(app, subjects_mesh_scheme, subjects_service):
    """Subject vocabulary record."""
    subj = subjects_service.create(system_identity, {
        "id": "https://id.nlm.nih.gov/mesh/D000015",
        "scheme": "MeSH",
        "subject": "Abnormalities, Multiple"
    })

    Subject.index.refresh()

    return subj


RunningApp = namedtuple("RunningApp", [
    "app", "location", "resource_type_item", "language_item", "subject_item"
])


@pytest.fixture
def running_app(
    app, location, resource_type_item, language_item, subject_item
):
    """Fixture mimicking a running app."""
    return RunningApp(
        app, location, resource_type_item, language_item, subject_item
    )
