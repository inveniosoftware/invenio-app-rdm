# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2025 CERN.
# Copyright (C) 2019-2025 Northwestern University.
# Copyright (C) 2024-2025 Graz University of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Common pytest fixtures and plugins."""

import copy
from collections import namedtuple

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

import pytest
from flask_security import login_user
from flask_security.utils import hash_password
from invenio_access.models import ActionUsers
from invenio_access.permissions import system_identity
from invenio_access.proxies import current_access
from invenio_accounts.proxies import current_datastore
from invenio_accounts.testutils import login_user_via_session
from invenio_app.factory import create_app as _create_app
from invenio_db import db
from invenio_records_resources.proxies import current_service_registry
from invenio_vocabularies.contrib.subjects.api import Subject
from invenio_vocabularies.proxies import current_service as vocabulary_service
from invenio_vocabularies.records.api import Vocabulary
from invenio_vocabularies.records.models import VocabularyScheme


@pytest.fixture(scope="module")
def create_app(entry_points):
    """Creates a test app."""
    return _create_app


@pytest.fixture(scope="module")
def app_config(app_config):
    """Override pytest-invenio app_config fixture to disable CSRF check."""
    # Variable not used. We set it to silent warnings
    app_config["REST_CSRF_ENABLED"] = False

    return app_config


@pytest.fixture(scope="module")
def subjects_service(app):
    """Subjects service."""
    return current_service_registry.get("subjects")


@pytest.fixture(scope="module")
def records_service(app):
    """Records service."""
    return current_service_registry.get("records")


pytest_plugins = ("celery.contrib.pytest",)


@pytest.fixture(scope="module")
def extra_entry_points():
    """Register extra entry point."""
    return {
        "invenio_base.blueprints": [
            "mock_module = tests.mock_module.views:create_blueprint"
        ],
    }


@pytest.fixture(scope="function")
def minimal_record(users):
    """Minimal record data as dict coming from the external world."""
    return {
        "access": {
            "record": "public",
            "files": "public",
        },
        "files": {"enabled": False},  # Most tests don't care about file upload
        "metadata": {
            "publication_date": "2020-06-01",
            "resource_type": {
                "id": "image-photo",
            },
            # Technically not required
            "creators": [
                {
                    "person_or_org": {
                        "type": "personal",
                        "name": "Doe, John",
                        "given_name": "John Doe",
                        "family_name": "Doe",
                    }
                }
            ],
            "title": "A Romans story",
        },
    }


@pytest.fixture()
def users(app, db):
    """Create users."""
    password = "123456"
    with db.session.begin_nested():
        datastore = app.extensions["security"].datastore
        # create users
        hashed_password = hash_password(password)
        user1 = datastore.create_user(
            email="user1@test.com", password=hashed_password, active=True
        )
        user2 = datastore.create_user(
            email="user2@test.com", password=hashed_password, active=True
        )
        # Give role to administration-access
        db.session.add(ActionUsers(action="administration-access", user=user1))
    db.session.commit()
    return {
        "user1": user1,
        "user2": user2,
    }


@pytest.fixture()
def roles(app, db):
    """Create some roles."""
    with db.session.begin_nested():
        datastore = app.extensions["security"].datastore
        role1 = datastore.create_role(
            name="administration", description="administration role"
        )
        role2 = datastore.create_role(name="test", description="tests are coming")

    db.session.commit()
    return {"administration": role1, "test": role2}


@pytest.fixture()
def administration_user(users, roles):
    """Give administration rights to a user."""
    user = users["user1"]
    role = roles["administration"]
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


def create_vocabulary_type(id_, pid_type):
    """Create vocabulary type."""
    vocabulary_service = current_service_registry.get("vocabularies")
    return vocabulary_service.create_type(system_identity, id_, pid_type)


@pytest.fixture(scope="module")
def resource_type_type(app):
    """Resource type vocabulary type."""
    return create_vocabulary_type("resourcetypes", "rsrct")


@pytest.fixture(scope="module")
def resource_type_item(app, resource_type_type):
    """Resource type vocabulary record."""
    rst = vocabulary_service.create(
        system_identity,
        {
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
            "title": {"en": "Photo"},
            "tags": ["depositable", "linkable"],
            "type": "resourcetypes",
        },
    )

    Vocabulary.index.refresh()

    return rst


@pytest.fixture(scope="module")
def languages_type(app):
    """Language vocabulary type."""
    return create_vocabulary_type("languages", "lng")


@pytest.fixture(scope="module")
def language_item(app, languages_type):
    """Language vocabulary record."""
    lang = vocabulary_service.create(
        system_identity,
        {
            "id": "eng",
            "props": {
                "alpha_2": "",
            },
            "title": {"en": "English"},
            "type": "languages",
        },
    )

    Vocabulary.index.refresh()

    return lang


@pytest.fixture
def subjects_mesh_scheme(app, db):
    """Subject Scheme for MeSH."""
    scheme = VocabularyScheme.create(
        id="MeSH",
        parent_id="subjects",
        name="Medical Subject Headings",
        uri="https://www.nlm.nih.gov/mesh/meshhome.html",
    )
    db.session.commit()
    return scheme


@pytest.fixture
def subject_item(app, subjects_mesh_scheme, subjects_service):
    """Subject vocabulary record."""
    subj = subjects_service.create(
        system_identity,
        {
            "id": "https://id.nlm.nih.gov/mesh/D000015",
            "scheme": "MeSH",
            "subject": "Abnormalities, Multiple",
        },
    )

    Subject.index.refresh()

    return subj


@pytest.fixture(scope="module")
def communitytypes_type(app):
    """Creates and retrieves a vocabulary type."""
    return create_vocabulary_type("communitytypes", "comtyp")


@pytest.fixture(scope="module")
def communitytypes(communitytypes_type):
    """Community types."""
    vocabulary_service = current_service_registry.get("vocabularies")
    type_dicts = [
        {"id": "organization", "title": {"en": "Organization"}},
        {"id": "event", "title": {"en": "Event"}},
        {"id": "topic", "title": {"en": "Topic"}},
        {"id": "project", "title": {"en": "Project"}},
    ]
    [t.update({"type": "communitytypes"}) for t in type_dicts]
    types = [
        vocabulary_service.create(identity=system_identity, data=t) for t in type_dicts
    ]
    vocabulary_service.indexer.refresh()
    return types


@pytest.fixture()
def community_input():
    """Community input dict."""
    return {
        "access": {
            "visibility": "public",
            "member_policy": "open",
            "record_policy": "open",
        },
        "slug": "my_community_id",
        "metadata": {
            "title": "My Community",
            # "description": "This is an example Community.",
            "type": {"id": "event"},
            # "curation_policy": "This is the kind of records we accept.",
            # "website": "https://inveniosoftware.org/",
        },
    }


RunningApp = namedtuple(
    "RunningApp",
    [
        "app",
        "location",
        "resource_type_item",
        "language_item",
        "subject_item",
        "communitytypes",
    ],
)


@pytest.fixture
def running_app(
    app, location, resource_type_item, language_item, subject_item, communitytypes
):
    """Fixture mimicking a running app."""
    return RunningApp(
        app, location, resource_type_item, language_item, subject_item, communitytypes
    )


@pytest.fixture()
def create_record(running_app, minimal_record, records_service):
    """Record creation and publication function fixture."""
    files_service = records_service.draft_files

    def _create_record(identity=None, data=minimal_record, files=None):
        """Create and publish an RDMRecord.

        Optionally assign it files.
        """
        idty = identity or system_identity
        data_copy = copy.deepcopy(data)
        if files:
            data_copy["files"] = {"enabled": True}

        draft_data = records_service.create(idty, data_copy)._record
        pid_value_of_draft = draft_data.pid.pid_value
        if files:
            files_service.init_files(idty, pid_value_of_draft, [f.data for f in files])
            for f in files:
                files_service.set_file_content(
                    idty,
                    id_=pid_value_of_draft,
                    file_key=f.data["key"],
                    stream=f.content,
                    content_length=f.content.getbuffer().nbytes,
                )
                files_service.commit_file(
                    idty, id_=pid_value_of_draft, file_key=f.data["key"]
                )

        record_result = records_service.publish(idty, id_=pid_value_of_draft)
        return record_result

    return _create_record


@pytest.fixture()
def create_community(running_app, community_input):
    """Community creation function fixture."""
    community_service = current_service_registry.get("communities")

    def _create_community(identity=None, data=community_input):
        """Create a community."""
        idty = identity or system_identity
        return community_service.create(idty, data)

    return _create_community
