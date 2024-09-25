# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2024 CERN.
# Copyright (C) 2019-2020 Northwestern University.
# Copyright (C) 2021      Graz University of Technology.
# Copyright (C) 2022-2024 KTH Royal Institute of Technology.
# Copyright (C) 2023      TU Wien
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Default configuration for Invenio App RDM.

As a flavour extension, Invenio-App-RDM doesn't define configuration
variables of its own, but rather forcefully sets other modules'
configuration variables.

Import below the configuration defined in other modules that should be
(forcefully) set in an InvenioRDM instance, e.g.:

    from invenio_rdm_records.config import *


The role of Invenio App RDM is to configure other modules a specific way.
These configurations can nevertheless be overridden by either:

- Configuration file: ``<virtualenv prefix>/var/instance/invenio.cfg``
- Environment variables: ``APP_<variable name>``

WARNING: An instance should NOT install multiple flavour extensions since
         there would be no guarantee of priority anymore.
"""

from datetime import datetime, timedelta

import invenio_communities.notifications.builders as community_notifications
from celery.schedules import crontab
from flask_principal import Denial
from flask_resources import HTTPJSONException, create_error_handler
from invenio_access.permissions import any_user
from invenio_communities.communities.resources.config import community_error_handlers
from invenio_communities.notifications.builders import (
    CommunityInvitationAcceptNotificationBuilder,
    CommunityInvitationCancelNotificationBuilder,
    CommunityInvitationDeclineNotificationBuilder,
    CommunityInvitationExpireNotificationBuilder,
    CommunityInvitationSubmittedNotificationBuilder,
)
from invenio_notifications.backends import EmailNotificationBackend
from invenio_rdm_records.notifications.builders import (
    CommunityInclusionAcceptNotificationBuilder,
    CommunityInclusionCancelNotificationBuilder,
    CommunityInclusionDeclineNotificationBuilder,
    CommunityInclusionExpireNotificationBuilder,
    CommunityInclusionSubmittedNotificationBuilder,
    GrantUserAccessNotificationBuilder,
    GuestAccessRequestAcceptNotificationBuilder,
    GuestAccessRequestCancelNotificationBuilder,
    GuestAccessRequestDeclineNotificationBuilder,
    GuestAccessRequestSubmitNotificationBuilder,
    GuestAccessRequestSubmittedNotificationBuilder,
    GuestAccessRequestTokenCreateNotificationBuilder,
    UserAccessRequestAcceptNotificationBuilder,
    UserAccessRequestCancelNotificationBuilder,
    UserAccessRequestDeclineNotificationBuilder,
    UserAccessRequestSubmitNotificationBuilder,
)
from invenio_rdm_records.proxies import current_rdm_records_service
from invenio_rdm_records.requests.entity_resolvers import (
    EmailResolver,
    RDMRecordServiceResultResolver,
)
from invenio_rdm_records.resources.stats.event_builders import build_record_unique_id
from invenio_rdm_records.services.communities.components import (
    CommunityServiceComponents,
)
from invenio_rdm_records.services.errors import (
    InvalidAccessRestrictions,
    InvalidCommunityVisibility,
)
from invenio_rdm_records.services.github.release import RDMGithubRelease
from invenio_rdm_records.services.permissions import RDMRequestsPermissionPolicy
from invenio_rdm_records.services.stats import permissions_policy_lookup_factory
from invenio_rdm_records.services.tasks import StatsRDMReindexTask
from invenio_records_resources.references.entity_resolvers import ServiceResultResolver
from invenio_requests.notifications.builders import (
    CommentRequestEventCreateNotificationBuilder,
)
from invenio_requests.resources.requests.config import request_error_handlers
from invenio_stats.aggregations import StatAggregator
from invenio_stats.contrib.event_builders import build_file_unique_id
from invenio_stats.processors import (
    EventsIndexer,
    anonymize_user,
    filter_robots,
    flag_machines,
)
from invenio_stats.queries import TermsQuery
from invenio_stats.tasks import StatsAggregationTask, StatsEventTask
from invenio_vocabularies.config import (
    VOCABULARIES_DATASTREAM_READERS,
    VOCABULARIES_DATASTREAM_TRANSFORMERS,
    VOCABULARIES_DATASTREAM_WRITERS,
)
from invenio_vocabularies.contrib.affiliations.datastreams import (
    VOCABULARIES_DATASTREAM_READERS as AFFILIATIONS_READERS,
)
from invenio_vocabularies.contrib.affiliations.datastreams import (
    VOCABULARIES_DATASTREAM_TRANSFORMERS as AFFILIATIONS_TRANSFORMERS,
)
from invenio_vocabularies.contrib.affiliations.datastreams import (
    VOCABULARIES_DATASTREAM_WRITERS as AFFILIATIONS_WRITERS,
)
from invenio_vocabularies.contrib.awards.datastreams import (
    VOCABULARIES_DATASTREAM_READERS as AWARDS_READERS,
)
from invenio_vocabularies.contrib.awards.datastreams import (
    VOCABULARIES_DATASTREAM_TRANSFORMERS as AWARDS_TRANSFORMERS,
)
from invenio_vocabularies.contrib.awards.datastreams import (
    VOCABULARIES_DATASTREAM_WRITERS as AWARDS_WRITERS,
)
from invenio_vocabularies.contrib.common.ror.datastreams import (
    VOCABULARIES_DATASTREAM_READERS as COMMON_ROR_READERS,
)
from invenio_vocabularies.contrib.common.ror.datastreams import (
    VOCABULARIES_DATASTREAM_TRANSFORMERS as COMMON_ROR_TRANSFORMERS,
)
from invenio_vocabularies.contrib.common.ror.datastreams import (
    VOCABULARIES_DATASTREAM_WRITERS as COMMON_ROR_WRITERS,
)
from invenio_vocabularies.contrib.funders.datastreams import (
    VOCABULARIES_DATASTREAM_READERS as FUNDERS_READERS,
)
from invenio_vocabularies.contrib.funders.datastreams import (
    VOCABULARIES_DATASTREAM_TRANSFORMERS as FUNDERS_TRANSFORMERS,
)
from invenio_vocabularies.contrib.funders.datastreams import (
    VOCABULARIES_DATASTREAM_WRITERS as FUNDERS_WRITERS,
)
from invenio_vocabularies.contrib.names.datastreams import (
    VOCABULARIES_DATASTREAM_READERS as NAMES_READERS,
)
from invenio_vocabularies.contrib.names.datastreams import (
    VOCABULARIES_DATASTREAM_TRANSFORMERS as NAMES_TRANSFORMERS,
)
from invenio_vocabularies.contrib.names.datastreams import (
    VOCABULARIES_DATASTREAM_WRITERS as NAMES_WRITERS,
)
from invenio_vocabularies.contrib.subjects.datastreams import (
    VOCABULARIES_DATASTREAM_READERS as SUBJECTS_READERS,
)
from invenio_vocabularies.contrib.subjects.datastreams import (
    VOCABULARIES_DATASTREAM_TRANSFORMERS as SUBJECTS_TRANSFORMERS,
)
from invenio_vocabularies.contrib.subjects.datastreams import (
    VOCABULARIES_DATASTREAM_WRITERS as SUBJECTS_WRITERS,
)
from werkzeug.local import LocalProxy

from .theme.views import notification_settings
from .users.schemas import NotificationsUserSchema, UserPreferencesNotificationsSchema

# TODO: Remove when records-rest is out of communities and files
RECORDS_REST_ENDPOINTS = {}
RECORDS_UI_ENDPOINTS = {}


def _(x):
    """Identity function used to trigger string extraction."""
    return x


# Flask
# =====
# See https://flask.palletsprojects.com/en/1.1.x/config/

APP_ALLOWED_HOSTS = ["0.0.0.0", "localhost", "127.0.0.1"]
"""Allowed hosts.

Since HAProxy and Nginx route all requests no matter the host header
provided, the allowed hosts variable is set to localhost. In production it
should be set to the correct host and it is strongly recommended to only
route correct hosts to the application.
"""

MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MiB
"""Max upload size for form data via application/multipart-formdata."""

SECRET_KEY = "CHANGE_ME"
"""Flask secret key.

Each installation (dev, production, ...) needs a separate key.

SECURITY WARNING: keep the secret key used in production secret!
"""

SESSION_COOKIE_SECURE = True
"""Sets cookie with the secure flag by default."""

SESSION_COOKIE_SAMESITE = "Lax"
"""Restricts how cookies are sent with requests from external sites."""

# Flask-Limiter
# =============
# https://flask-limiter.readthedocs.io/en/stable/#configuration

RATELIMIT_STORAGE_URI = "redis://localhost:6379/3"
"""Storage for ratelimiter."""

# Increase defaults
RATELIMIT_AUTHENTICATED_USER = "25000 per hour;1000 per minute"

RATELIMIT_GUEST_USER = "5000 per hour;500 per minute"

# Flask-Babel
# ===========
# See https://pythonhosted.org/Flask-Babel/#configuration

BABEL_DEFAULT_LOCALE = "en"
"""Default locale (language)."""

BABEL_DEFAULT_TIMEZONE = "Europe/Zurich"
"""Default time zone."""

# Invenio-I18N
# ============
# See https://invenio-i18n.readthedocs.io/en/latest/configuration.html

# Other supported languages (do not include BABEL_DEFAULT_LOCALE in list).
# I18N_LANGUAGES = [
#     ('fr', _('French'))
# ]


# Invenio-Theme
# =============
# See https://invenio-theme.readthedocs.io/en/latest/configuration.html

APP_THEME = ["semantic-ui"]
"""Application theme."""

BASE_TEMPLATE = "invenio_app_rdm/page.html"
"""Global base template."""

COVER_TEMPLATE = "invenio_theme/page_cover.html"
"""Cover page base template (used for e.g. login/sign-up)."""

SETTINGS_TEMPLATE = "invenio_theme/page_settings.html"
"""Settings base template."""

THEME_FOOTER_TEMPLATE = "invenio_app_rdm/footer.html"
"""Footer base template."""

THEME_FRONTPAGE = False
"""Use default frontpage."""

THEME_FRONTPAGE_TITLE = _("The turn-key research data management repository")
"""Frontpage title."""

THEME_HEADER_TEMPLATE = "invenio_app_rdm/header.html"
"""Header base template."""

THEME_FRONTPAGE_TEMPLATE = "invenio_app_rdm/frontpage.html"
"""Frontpage template."""

THEME_HEADER_LOGIN_TEMPLATE = "invenio_app_rdm/header_login.html"
"""Header login base template."""


def _get_package_version():
    from importlib.metadata import PackageNotFoundError, version

    from packaging.version import Version

    try:
        package_version = version("invenio-app-rdm")
        parsed_version = Version(package_version)
        major_minor_version = (
            f"InvenioRDM {parsed_version.major}.{parsed_version.minor}"
        )
        return major_minor_version
    except PackageNotFoundError:
        # default without any version
        return "InvenioRDM"


THEME_GENERATOR = _get_package_version()
"""Generator meta tag to identify the software that generated the page.

Set it to `None` to disable the tag.
"""

THEME_LOGO = "images/invenio-rdm.svg"
"""Theme logo."""

THEME_SITENAME = _("InvenioRDM")
"""Site name."""

THEME_TWITTERHANDLE = ""
"""Twitter handle."""

THEME_SHOW_FRONTPAGE_INTRO_SECTION = True
"""Front page intro section visibility"""

THEME_JAVASCRIPT_TEMPLATE = "invenio_app_rdm/javascript.html"

# Invenio-Files-REST
# ==================
# See https://invenio-files-rest.readthedocs.io/en/latest/configuration.html


def files_rest_permission_factory(obj, action):
    """Generate a denying permission."""
    return Denial(any_user)


FILES_REST_PERMISSION_FACTORY = files_rest_permission_factory
"""Set default files permission factory."""

FILES_REST_CHECKSUM_VERIFICATION_URI_PREFIXES = []
"""URI prefixes of files their checksums should be verified"""

# Storage classes
FILES_REST_STORAGE_CLASS_LIST = {
    "L": "Local",
    "F": "Fetch",
    "R": "Remote",
}

FILES_REST_DEFAULT_STORAGE_CLASS = "L"

FILES_REST_DEFAULT_QUOTA_SIZE = 10**10
"""Default quota size is 10Gb."""

FILES_REST_DEFAULT_MAX_FILE_SIZE = FILES_REST_DEFAULT_QUOTA_SIZE
"""Default maximum file size for a bucket in bytes."""

# Invenio-Formatter
# =================

FORMATTER_BADGES_ALLOWED_TITLES = ["DOI", "doi"]
"""List of allowed titles in badges."""

FORMATTER_BADGES_TITLE_MAPPING = {"doi": "DOI"}
"""Mapping of titles."""

# Invenio-Mail / Flask-Mail
# =========================
# See https://pythonhosted.org/Flask-Mail/#configuring-flask-mail

MAIL_SUPPRESS_SEND = True
"""Disable email sending by default."""

MAIL_DEFAULT_SENDER = "info@inveniosoftware.org"
"""Email address used as sender of account registration emails.

`SECURITY_EMAIL_SENDER` will default to this value.
"""

# Flask-Collect
# =============
# See https://github.com/klen/Flask-Collect#setup

COLLECT_STORAGE = "flask_collect.storage.file"
"""Static files collection method (defaults to copying files)."""

# Invenio-Accounts
# ================
# (Flask-Security, Flask-Login, Flask-Principal, Flask-KVSession)
# See https://invenio-accounts.readthedocs.io/en/latest/configuration.html
# See https://flask-security.readthedocs.io/en/3.0.0/configuration.html

ACCOUNTS_SESSION_REDIS_URL = "redis://localhost:6379/1"
"""Redis session storage URL."""

ACCOUNTS_USERINFO_HEADERS = True
"""Enable session/user id request tracing.

This feature will add X-Session-ID and X-User-ID headers to HTTP response. You
MUST ensure that NGINX (or other proxies) removes these headers again before
sending the response to the client. Set to False, in case of doubt.
"""


ACCOUNTS_USER_PREFERENCES_SCHEMA = UserPreferencesNotificationsSchema()
"""The schema to use for validation of the user preferences."""

# Invenio-Security-Invenio
# ========================

SECURITY_EMAIL_SUBJECT_REGISTER = _("Welcome to Invenio App RDM!")
"""Email subject for account registration emails."""

# Invenio-UserProfiles
# ================

USERPROFILES_EXTEND_SECURITY_FORMS = True
"""Extend the registration form with profile fields (name, affiliations)."""

# Invenio-Celery / Celery / Flask-Celeryext
# =========================================
# See https://invenio-celery.readthedocs.io/en/latest/configuration.html
# See docs.celeryproject.org/en/latest/userguide/configuration.html
# See https://flask-celeryext.readthedocs.io/en/latest/

BROKER_URL = "amqp://guest:guest@localhost:5672/"
"""URL of message broker for Celery 3 (default is RabbitMQ)."""

CELERY_BEAT_SCHEDULE = {
    "indexer": {
        "task": "invenio_records_resources.tasks.manage_indexer_queues",
        "schedule": timedelta(seconds=10),
    },
    "accounts_sessions": {
        "task": "invenio_accounts.tasks.clean_session_table",
        "schedule": timedelta(minutes=60),
    },
    "accounts_ips": {
        "task": "invenio_accounts.tasks.delete_ips",
        "schedule": timedelta(hours=6),
    },
    "draft_resources": {
        "task": ("invenio_drafts_resources.services.records.tasks.cleanup_drafts"),
        "schedule": timedelta(minutes=60),
    },
    "rdm_records": {
        "task": "invenio_rdm_records.services.tasks.update_expired_embargos",
        "schedule": crontab(minute=2, hour=0),
    },
    "expire_requests": {
        "task": "invenio_requests.tasks.check_expired_requests",
        "schedule": crontab(minute=3, hour=0),
    },
    "file-checks": {
        "task": "invenio_files_rest.tasks.schedule_checksum_verification",
        "schedule": timedelta(hours=1),
        "kwargs": {
            "batch_interval": {"hours": 1},
            "frequency": {"days": 14},
            "max_count": 0,
            # Query taking into account only files with URI prefixes defined by
            # the FILES_REST_CHECKSUM_VERIFICATION_URI_PREFIXES config variable
            "files_query": "invenio_app_rdm.utils.files.checksum_verification_files_query",
        },
    },
    "file-integrity-report": {
        "task": "invenio_app_rdm.tasks.file_integrity_report",
        "schedule": crontab(minute=0, hour=7),  # Every day at 07:00 UTC
    },
    # indexing of statistics events & aggregations
    "stats-process-events": {
        **StatsEventTask,
        "schedule": crontab(minute="25,55"),  # Every hour at minute 25 and 55
    },
    "stats-aggregate-events": {
        **StatsAggregationTask,
        "schedule": crontab(minute=0),  # Every hour at minute 0
    },
    "reindex-stats": StatsRDMReindexTask,  # Every hour at minute 10
    # Invenio communities provides some caching that has the potential to be never removed,
    # therefore, we need a cronjob to ensure that at least once per day we clear the cache
    "clear-cache": {
        "task": "invenio_communities.tasks.clear_cache",
        "schedule": crontab(minute=0, hour=1),  # Every day at 01:00 UTC
    },
    "clean-access-request-tokens": {
        "task": "invenio_rdm_records.requests.access.tasks.clean_expired_request_access_tokens",
        "schedule": crontab(minute=4, hour=0),
    },
}
"""Scheduled tasks configuration (aka cronjobs)."""

CELERY_BROKER_URL = BROKER_URL
"""Same as BROKER_URL to support Celery 4."""

CELERY_RESULT_BACKEND = "redis://localhost:6379/2"
"""URL of backend for result storage (default is Redis)."""

# Flask-SQLAlchemy
# ================
# See https://flask-sqlalchemy.palletsprojects.com/en/2.x/config/

SQLALCHEMY_DATABASE_URI = (
    "postgresql+psycopg2://invenio-app-rdm:invenio-app-rdm@localhost/invenio-app-rdm"
)
"""Database URI including user and password.

Default value is provided to make module testing easier.
"""

SQLALCHEMY_ECHO = False
"""Enable to see all SQL queries."""

SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_pre_ping": False,
    "pool_recycle": 3600,
    # set a more agressive timeout to ensure http requests don't wait for long
    "pool_timeout": 10,
}
"""SQLAlchemy engine options.

This is used to configure for instance the database connection pool.
Specifically for connection pooling the following options below are relevant.
Note, that the connection pool settings have to be aligned with:

1. your database server's max allowed connections settings, and
2. your application deployment (number of processes/threads)

**Disconnect handling**

Note, it's possible that a connection you get from the connection pool is no
longer open. This happens if e.g. the database server was restarted or the
server has a timeout that closes the connection. In these case you'll see an
error similar to::

    psycopg2.OperationalError: server closed the connection unexpectedly
        This probably means the server terminated abnormally
        before or while processing the request.

The errors can be avoided by using the ``pool_pre_ping`` option, which will
ensure the connection is open first by issuing a ``SELECT 1``. The pre-ping
feature however, comes with a performance penalty, and thus it may be better
to first try adjusting the ``pool_recyle`` to ensure connections are closed and
reopened regularly.

... code-block:: python

    SQLALCHEMY_ENGINE_OPTIONS = dict(
        # enable the connection pool “pre-ping” feature that tests connections
        # for liveness upon each checkout.
        pool_pre_ping=True,

        # the number of connections to allow in connection pool “overflow”,
        # that is connections that can be opened above and beyond the
        # pool_size setting
        max_overflow=10,

        # the number of connections to keep open inside the connection
        pool_size=5,

        # recycle connections after the given number of seconds has passed.
        pool_recycle=3600,

        # number of seconds to wait before giving up on getting a connection
        # from the pool
        pool_timeout=30,
    )

See https://docs.sqlalchemy.org/en/latest/core/engines.html.
"""

# Disable logging user information in SQLAlchemy-Continuum. This setting is not
# documented on purpose, since we don't want administrators to be aware of the
# setting.
DB_VERSIONING_USER_MODEL = None

# Invenio-JSONSchemas/Invenio-Records
# ===================================
# See https://invenio-jsonschemas.readthedocs.io/en/latest/configuration.html

JSONSCHEMAS_REGISTER_ENDPOINTS_API = False
"""Don't' register schema endpoints."""

JSONSCHEMAS_REGISTER_ENDPOINTS_UI = False
"""Don't' register schema endpoints."""

JSONSCHEMAS_HOST = "unused"
# This variable is set to something different than localhost to avoid a warning
# being issued. The value is however not used, because of the two variables
# set below.

RECORDS_REFRESOLVER_CLS = "invenio_records.resolver.InvenioRefResolver"
"""Custom JSONSchemas ref resolver class.

Note that when using a custom ref resolver class you should also set
``RECORDS_REFRESOLVER_STORE`` to point to a JSONSchema ref resolver store.
"""

RECORDS_REFRESOLVER_STORE = "invenio_jsonschemas.proxies.current_refresolver_store"
"""JSONSchemas ref resolver store.

Used together with ``RECORDS_REFRESOLVER_CLS`` to provide a specific
ref resolver store.
"""

# OAI-PMH
# =======
# See https://github.com/inveniosoftware/invenio-oaiserver/blob/master/invenio_oaiserver/config.py  # noqa
# (Using GitHub because documentation site out-of-sync at time of writing)

OAISERVER_ID_PREFIX = "oai:invenio-app-rdm.org:"
"""The prefix that will be applied to the generated OAI-PMH ids."""

OAISERVER_SEARCH_CLS = "invenio_rdm_records.oai:OAIRecordSearch"
"""Class for record search."""

OAISERVER_ID_FETCHER = "invenio_rdm_records.oai:oaiid_fetcher"
"""OAI ID fetcher function."""

OAISERVER_METADATA_FORMATS = {
    "marcxml": {
        "serializer": "invenio_rdm_records.oai:marcxml_etree",
        "schema": "https://www.loc.gov/standards/marcxml/schema/MARC21slim.xsd",
        "namespace": "https://www.loc.gov/standards/marcxml/",
    },
    "oai_dc": {
        "serializer": "invenio_rdm_records.oai:dublincore_etree",
        "schema": "http://www.openarchives.org/OAI/2.0/oai_dc.xsd",
        "namespace": "http://www.openarchives.org/OAI/2.0/oai_dc/",
    },
    "dcat": {
        "serializer": "invenio_rdm_records.oai:dcat_etree",
        "schema": "http://schema.datacite.org/meta/kernel-4/metadata.xsd",
        "namespace": "https://www.w3.org/ns/dcat",
    },
    "marc21": {
        "serializer": "invenio_rdm_records.oai:marcxml_etree",
        "schema": "https://www.loc.gov/standards/marcxml/schema/MARC21slim.xsd",
        "namespace": "https://www.loc.gov/standards/marcxml/",
    },
    "datacite": {
        "serializer": "invenio_rdm_records.oai:datacite_etree",
        "schema": "http://schema.datacite.org/meta/kernel-4.3/metadata.xsd",
        "namespace": "http://datacite.org/schema/kernel-4",
    },
    "oai_datacite": {
        "serializer": "invenio_rdm_records.oai:oai_datacite_etree",
        "schema": "http://schema.datacite.org/oai/oai-1.1/oai.xsd",
        "namespace": "http://schema.datacite.org/oai/oai-1.1/",
    },
    "datacite4": {
        "serializer": "invenio_rdm_records.oai:datacite_etree",
        "schema": "http://schema.datacite.org/meta/kernel-4.3/metadata.xsd",
        "namespace": "http://datacite.org/schema/kernel-4",
    },
    "oai_datacite4": {
        "serializer": ("invenio_rdm_records.oai:oai_datacite_etree"),
        "schema": "http://schema.datacite.org/oai/oai-1.1/oai.xsd",
        "namespace": "http://schema.datacite.org/oai/oai-1.1/",
    },
}

OAISERVER_LAST_UPDATE_KEY = "updated"
"""Record update key."""

OAISERVER_CREATED_KEY = "created"
"""Record created key."""

OAISERVER_RECORD_CLS = "invenio_rdm_records.records.api:RDMRecord"
"""Record retrieval class."""

OAISERVER_RECORD_SETS_FETCHER = "invenio_oaiserver.percolator:find_sets_for_record"
"""Record's OAI sets function."""

OAISERVER_RECORD_INDEX = LocalProxy(
    lambda: current_rdm_records_service.record_cls.index._name
)

"""Specify a search index with records that should be exposed via OAI-PMH."""

OAISERVER_GETRECORD_FETCHER = "invenio_rdm_records.oai:getrecord_fetcher"
"""Record data fetcher for serialization."""

# Flask-DebugToolbar
# ==================
# See https://flask-debugtoolbar.readthedocs.io/en/latest/#configuration
# Flask-DebugToolbar is by default enabled when the application is running in
# debug mode. More configuration options are available above

DEBUG_TB_INTERCEPT_REDIRECTS = False
"""Switches off incept of redirects by Flask-DebugToolbar."""

# Flask-Caching
# =============
# See https://flask-caching.readthedocs.io/en/latest/index.html#configuring-flask-caching  # noqa

CACHE_REDIS_URL = "redis://localhost:6379/0"
"""URL to connect to Redis server."""

CACHE_TYPE = "flask_caching.backends.redis"
"""Use Redis caching object."""

# Invenio-Access
# ==============
# See https://invenio-access.readthedocs.io/en/latest/configuration.html

ACCESS_CACHE = "invenio_cache:current_cache"
"""Use the cache for permmissions caching."""

# Invenio-Search
# ==============
# See https://invenio-search.readthedocs.io/en/latest/configuration.html

SEARCH_HOSTS = [{"host": "localhost", "port": 9200}]
"""Search hosts."""

# Invenio-Indexer
# ===============
# See https://invenio-indexer.readthedocs.io/en/latest/configuration.html

# We want that indexers are always explicit about the index they are indexing to.
# NOTE: Can be removed when https://github.com/inveniosoftware/invenio-indexer/pull/158 is merged and released.
INDEXER_DEFAULT_INDEX = None
"""Default index to use if no schema is defined."""

# Invenio-Base
# ============
# See https://invenio-base.readthedocs.io/en/latest/api.html#invenio_base.wsgi.wsgi_proxyfix  # noqa

WSGI_PROXIES = 2
"""Correct number of proxies in front of your application."""

# Invenio-Admin
# =============

# Admin interface is deprecated and should not be used.
ADMIN_PERMISSION_FACTORY = "invenio_app_rdm.admin.permission_factory"

# Invenio-REST
# ============

REST_CSRF_ENABLED = True

# Invenio-Vocabularies
# ====================

VOCABULARIES_DATASTREAM_READERS = {
    **VOCABULARIES_DATASTREAM_READERS,
    **NAMES_READERS,
    **COMMON_ROR_READERS,
    **AWARDS_READERS,
    **FUNDERS_READERS,
    **AFFILIATIONS_READERS,
    **SUBJECTS_READERS,
}
"""Data Streams readers."""

VOCABULARIES_DATASTREAM_TRANSFORMERS = {
    **VOCABULARIES_DATASTREAM_TRANSFORMERS,
    **NAMES_TRANSFORMERS,
    **COMMON_ROR_TRANSFORMERS,
    **AWARDS_TRANSFORMERS,
    **FUNDERS_TRANSFORMERS,
    **AFFILIATIONS_TRANSFORMERS,
    **SUBJECTS_TRANSFORMERS,
}
"""Data Streams transformers."""

VOCABULARIES_DATASTREAM_WRITERS = {
    **VOCABULARIES_DATASTREAM_WRITERS,
    **NAMES_WRITERS,
    **FUNDERS_WRITERS,
    **AWARDS_WRITERS,
    **AFFILIATIONS_WRITERS,
    **COMMON_ROR_WRITERS,
    **SUBJECTS_WRITERS,
}
"""Data Streams writers."""

# Invenio-APP-RDM
# ===============

SEARCH_UI_SEARCH_TEMPLATE = "invenio_app_rdm/records/search.html"
"""Search page's base template.

Previous invenio-search-ui, now is picked by the instance records/ext.py.
"""

APP_RDM_DEPOSIT_FORM_TEMPLATE = "invenio_app_rdm/records/deposit.html"
"""Deposit page's form template."""

APP_RDM_USER_DASHBOARD_ROUTES = {
    "uploads": "/me/uploads",
    "communities": "/me/communities",
    "requests": "/me/requests",
}

APP_RDM_ROUTES = {
    "index": "/",
    "robots": "/robots.txt",
    "help_search": "/help/search",
    "help_statistics": "/help/statistics",
    "help_versioning": "/help/versioning",
    "record_search": "/search",
    "record_detail": "/records/<pid_value>",
    "record_export": "/records/<pid_value>/export/<export_format>",
    "record_file_preview": "/records/<pid_value>/preview/<path:filename>",
    "record_file_download": "/records/<pid_value>/files/<path:filename>",
    "record_thumbnail": "/records/<pid_value>/thumb<int:size>",
    "record_media_file_download": "/records/<pid_value>/media-files/<path:filename>",
    "record_from_pid": "/<any({schemes}):pid_scheme>/<path:pid_value>",
    "record_latest": "/records/<pid_value>/latest",
    "dashboard_home": "/me",
    "deposit_create": "/uploads/new",
    "deposit_edit": "/uploads/<pid_value>",
}

APP_RDM_RECORD_EXPORTERS = {
    "json": {
        "name": _("JSON"),
        "serializer": ("flask_resources.serializers:JSONSerializer"),
        "params": {"options": {"indent": 2, "sort_keys": True}},
        "content-type": "application/json",
        "filename": "{id}.json",
    },
    "json-ld": {
        "name": _("JSON-LD"),
        "serializer": (
            "invenio_rdm_records.resources.serializers:" "SchemaorgJSONLDSerializer"
        ),
        "content-type": "application/ld+json",
        "filename": "{id}.json",
    },
    "csl": {
        "name": _("CSL"),
        "serializer": ("invenio_rdm_records.resources.serializers:CSLJSONSerializer"),
        "params": {"options": {"indent": 2, "sort_keys": True}},
        "content-type": "application/vnd.citationstyles.csl+json",
        "filename": "{id}.json",
    },
    "datacite-json": {
        "name": _("DataCite JSON"),
        "serializer": (
            "invenio_rdm_records.resources.serializers:DataCite43JSONSerializer"
        ),
        "params": {"options": {"indent": 2, "sort_keys": True}},
        "content-type": "application/vnd.datacite.datacite+json",
        "filename": "{id}.json",
    },
    "datacite-xml": {
        "name": _("DataCite XML"),
        "serializer": (
            "invenio_rdm_records.resources.serializers:DataCite43XMLSerializer"
        ),
        "params": {},
        "content-type": "application/vnd.datacite.datacite+xml",
        "filename": "{id}.xml",
    },
    "dublincore": {
        "name": _("Dublin Core XML"),
        "serializer": (
            "invenio_rdm_records.resources.serializers:DublinCoreXMLSerializer"
        ),
        "params": {},
        "content-type": "application/x-dc+xml",
        "filename": "{id}.xml",
    },
    "marcxml": {
        "name": _("MARCXML"),
        "serializer": ("invenio_rdm_records.resources.serializers:MARCXMLSerializer"),
        "params": {},
        "content-type": "application/marcxml+xml",
        "filename": "{id}.xml",
    },
    "bibtex": {
        "name": _("BibTeX"),
        "serializer": ("invenio_rdm_records.resources.serializers:" "BibtexSerializer"),
        "params": {},
        "content-type": "application/x-bibtex",
        "filename": "{id}.bib",
    },
    "geojson": {
        "name": _("GeoJSON"),
        "serializer": ("invenio_rdm_records.resources.serializers:GeoJSONSerializer"),
        "params": {"options": {"indent": 2, "sort_keys": True}},
        "content-type": "application/vnd.geo+json",
        "filename": "{id}.geojson",
    },
    "dcat-ap": {
        "name": _("DCAT"),
        "serializer": "invenio_rdm_records.resources.serializers:DCATSerializer",
        "params": {},
        "content-type": "application/dcat+xml",
        "filename": "{id}.xml",
    },
    "codemeta": {
        "name": _("Codemeta"),
        "serializer": "invenio_rdm_records.resources.serializers:CodemetaSerializer",
        "params": {},
        "content-type": "application/ld+json",
        "filename": "{id}.json",
    },
    "cff": {
        "name": _("Citation File Format"),
        "serializer": "invenio_rdm_records.resources.serializers:CFFSerializer",
        "params": {},
        "content-type": "application/x-yaml",
        "filename": "{id}.yaml",
    },
}

APP_RDM_RECORD_LANDING_PAGE_EXTERNAL_LINKS = []
""" Default format used for adding badges to a record.

Make sure the 'render' field points to a valid render function in invenio_app_rdm.records_ui.utils.
Example implementation can also be found in invenio_app_rdm.records_ui.utils.

APP_RDM_RECORD_LANDING_PAGE_EXTERNAL_LINKS = [
    {
        "id": "github",
        "render": github_link_render,
    },
    {
        "id": "openaire",
        "render": openaire_link_render,
    },
}

def github_link_render(record):
    ...
"""

APP_RDM_RECORDS_EXPORT_URL = "/records/<pid_value>/export/<export_format>"

APP_RDM_DEPOSIT_FORM_DEFAULTS = {
    "publication_date": lambda: datetime.now().strftime("%Y-%m-%d"),
    "rights": [
        {
            "id": "cc-by-4.0",
            "title": "Creative Commons Attribution 4.0 International",
            "description": (
                "The Creative Commons Attribution license allows "
                "re-distribution and re-use of a licensed work "
                "on the condition that the creator is "
                "appropriately credited."
            ),
            "link": "https://creativecommons.org/licenses/by/4.0/legalcode",
        }
    ],
    "publisher": "CERN",
}
"""Default values for new records in the deposit UI.

The keys denote the dot-separated path, where in the record's metadata
the values should be set (see invenio-records.dictutils).
If the value is callable, its return value will be used for the field
(e.g. lambda/function for dynamic calculation of values).
"""

APP_RDM_DEPOSIT_FORM_AUTOCOMPLETE_NAMES = "search"
"""Behavior for autocomplete names search field for creators/contributors.

Available options:

- ``search`` (default): Show search field and form always.
- ``search_only``: Only show search field. Form displayed after selection or
  explicit "manual" entry.
- ``off``: Only show person form (no search field).
"""

APP_RDM_DEPOSIT_FORM_QUOTA = {
    "maxFiles": 100,
    "maxStorage": FILES_REST_DEFAULT_QUOTA_SIZE,
}
"""Deposit file upload quota """

APP_RDM_DISPLAY_DECIMAL_FILE_SIZES = True
"""Display the file sizes in powers of 1000 (KB, ...) or 1024 (KiB, ...)."""

APP_RDM_DEPOSIT_FORM_PUBLISH_MODAL_EXTRA = ""
"""Additional text/html to be displayed in the publish and submit for review modal."""

APP_RDM_RECORD_LANDING_PAGE_TEMPLATE = "invenio_app_rdm/records/detail.html"

APP_RDM_RECORD_THUMBNAIL_SIZES = [10, 50, 100, 250, 750, 1200]
"""Allowed record thumbnail sizes."""

APP_RDM_DETAIL_SIDE_BAR_TEMPLATES = [
    "invenio_app_rdm/records/details/side_bar/manage_menu.html",
    "invenio_app_rdm/records/details/side_bar/metrics.html",
    "invenio_app_rdm/records/details/side_bar/versions.html",
    "invenio_app_rdm/records/details/side_bar/external_resources.html",
    "invenio_app_rdm/records/details/side_bar/communities.html",
    "invenio_app_rdm/records/details/side_bar/keywords_subjects.html",
    "invenio_app_rdm/records/details/side_bar/details.html",
    "invenio_app_rdm/records/details/side_bar/locations.html",
    "invenio_app_rdm/records/details/side_bar/licenses.html",
    "invenio_app_rdm/records/details/side_bar/citations.html",
    "invenio_app_rdm/records/details/side_bar/export.html",
    "invenio_app_rdm/records/details/side_bar/technical_metadata.html",
]
"""Template names for detail view sidebar components"""

APP_RDM_FILES_INTEGRITY_REPORT_TEMPLATE = (
    "invenio_app_rdm/files_integrity_report/email/files_integrity_report.html"
)
"""Files integrity report template"""

APP_RDM_FILES_INTEGRITY_REPORT_SUBJECT = "Files integrity report"
"""Files integrity report subject"""

APP_RDM_ADMIN_EMAIL_RECIPIENT = "info@inveniosoftware.org"
"""Admin e-mail"""

# Invenio-Communities
# ===================

COMMUNITIES_SERVICE_COMPONENTS = CommunityServiceComponents

COMMUNITIES_ERROR_HANDLERS = {
    **community_error_handlers,
    InvalidCommunityVisibility: create_error_handler(
        lambda e: HTTPJSONException(
            code=400,
            description=e.reason,
        )
    ),
}

COMMUNITIES_RECORDS_SEARCH = {
    "facets": ["access_status", "resource_type", "language"],
    "sort": ["bestmatch", "newest", "oldest", "version"],
}
"""Community requests search configuration (i.e list of community requests)"""

COMMUNITIES_SHOW_BROWSE_MENU_ENTRY = False
"""Toggle to show or hide the 'Browse' menu entry for communities."""

# Invenio-RDM-Records
# ===================

RDM_REQUESTS_ROUTES = {
    "user-dashboard-request-details": "/me/requests/<request_pid_value>",
    "community-dashboard-request-details": "/communities/<pid_value>/requests/<request_pid_value>",
    "community-dashboard-invitation-details": "/communities/<pid_value>/invitations/<request_pid_value>",
}

RDM_COMMUNITIES_ROUTES = {
    "community-detail": "/communities/<pid_value>/records",
    "community-home": "/communities/<pid_value>/",
    "community-browse": "/communities/<pid_value>/browse",
    "community-static-page": "/communities/<pid_value>/pages/<path:page_slug>",
    "community-collection": "/communities/<pid_value>/collections/<tree_slug>/<collection_slug>",
}

RDM_SEARCH_USER_COMMUNITIES = {
    "facets": ["visibility", "type"],
    "sort": ["bestmatch", "newest", "oldest"],
}
"""User communities search configuration (i.e list of user communities)"""

RDM_SEARCH_USER_REQUESTS = {
    "facets": ["type", "status"],
    "sort": ["bestmatch", "newest", "oldest"],
}
"""User requests search configuration (i.e list of user requests)"""

# citation

RDM_CITATION_STYLES = [
    ("apa", _("APA")),
    ("harvard-cite-them-right", _("Harvard")),
    ("modern-language-association", _("MLA")),
    ("vancouver", _("Vancouver")),
    ("chicago-fullnote-bibliography", _("Chicago")),
    ("ieee", _("IEEE")),
]
"""List of citation style """

RDM_CITATION_STYLES_DEFAULT = "apa"
"""Default citation style"""

# Invenio-IIIF
# ============
# See https://invenio-iiif.readthedocs.io/en/latest/configuration.html

IIIF_PREVIEW_TEMPLATE = "invenio_app_rdm/records/iiif_preview.html"
"""Template for IIIF image preview."""

IIIF_API_DECORATOR_HANDLER = None

IIIF_SIMPLE_PREVIEWER_NATIVE_EXTENSIONS = ["gif", "png"]
"""Images are converted to JPEG for preview, unless listed here."""

IIIF_SIMPLE_PREVIEWER_SIZE = "!800,800"
"""Size of image in IIIF preview window. Must be a valid IIIF Image API size parameter."""

IIIF_FORMATS = {
    "pdf": "application/pdf",
    "gif": "image/gif",
    "jp2": "image/jp2",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "tif": "image/tiff",
    "tiff": "image/tiff",
}
"""Controls which formats are supported by the Flask-IIIF server."""

IIIF_FORMATS_PIL_MAP = {
    "gif": "gif",
    "jp2": "jpeg2000",
    "jpeg": "jpeg",
    "jpg": "jpeg",
    "pdf": "pdf",
    "png": "png",
    "tif": "tiff",
    "tiff": "tiff",
}
"""Mapping of IIIF formats to PIL-compatible formats."""

# Invenio-Previewer
# =================
# See https://github.com/inveniosoftware/invenio-previewer/blob/master/invenio_previewer/config.py  # noqa

PREVIEWER_PREFERENCE = [
    "csv_papaparsejs",
    "pdfjs",
    "iiif_simple",
    "simple_image",
    "json_prismjs",
    "xml_prismjs",
    "mistune",
    "video_videojs",
    "audio_videojs",
    "ipynb",
    "zip",
    "txt",
]
"""Preferred previewers."""

# Invenio-Pages
# =============
# See https://invenio-pages.readthedocs.io/en/latest/configuration.html

PAGES_DEFAULT_TEMPLATE = "invenio_app_rdm/default_static_page.html"
"""Default template to render."""

PAGES_TEMPLATES = [
    ("invenio_app_rdm/default_static_page.html", "Default"),
]
"""List of available templates for pages."""

APP_RDM_PAGES = {}
"""Register static pages with predefined initial content from 'pages.yaml' file.

Example:
{
    "about": "/about",
    "terms": "/terms",
    "privacy-policy": "/privacy-policy",
}
"""

# Invenio-Stats
# =============
# See https://invenio-stats.readthedocs.io/en/latest/configuration.html


STATS_EVENTS = {
    "file-download": {
        "templates": "invenio_rdm_records.records.stats.templates.events.file_download",
        "event_builders": [
            "invenio_rdm_records.resources.stats.file_download_event_builder",
            "invenio_rdm_records.resources.stats.check_if_via_api",
        ],
        "cls": EventsIndexer,
        "params": {
            "preprocessors": [
                filter_robots,
                flag_machines,
                anonymize_user,
                build_file_unique_id,
            ]
        },
    },
    "record-view": {
        "templates": "invenio_rdm_records.records.stats.templates.events.record_view",
        "event_builders": [
            "invenio_rdm_records.resources.stats.record_view_event_builder",
            "invenio_rdm_records.resources.stats.check_if_via_api",
            "invenio_rdm_records.resources.stats.drop_if_via_api",
        ],
        "cls": EventsIndexer,
        "params": {
            "preprocessors": [
                filter_robots,
                flag_machines,
                anonymize_user,
                build_record_unique_id,
            ],
        },
    },
}

STATS_AGGREGATIONS = {
    "file-download-agg": {
        "templates": "invenio_rdm_records.records.stats.templates.aggregations.aggr_file_download",
        "cls": StatAggregator,
        "params": {
            "event": "file-download",
            "field": "unique_id",
            "interval": "day",
            "index_interval": "month",
            "copy_fields": {
                "file_id": "file_id",
                "file_key": "file_key",
                "bucket_id": "bucket_id",
                "recid": "recid",
                "parent_recid": "parent_recid",
            },
            "metric_fields": {
                "unique_count": (
                    "cardinality",
                    "unique_session_id",
                    {"precision_threshold": 1000},
                ),
                "volume": ("sum", "size", {}),
            },
        },
    },
    "record-view-agg": {
        "templates": "invenio_rdm_records.records.stats.templates.aggregations.aggr_record_view",
        "cls": StatAggregator,
        "params": {
            "event": "record-view",
            "field": "unique_id",
            "interval": "day",
            "index_interval": "month",
            "copy_fields": {
                "recid": "recid",
                "parent_recid": "parent_recid",
                "via_api": "via_api",
            },
            "metric_fields": {
                "unique_count": (
                    "cardinality",
                    "unique_session_id",
                    {"precision_threshold": 1000},
                ),
            },
            "query_modifiers": [lambda query, **_: query.filter("term", via_api=False)],
        },
    },
}

STATS_QUERIES = {
    "record-view": {
        "cls": TermsQuery,
        "permission_factory": None,
        "params": {
            "index": "stats-record-view",
            "doc_type": "record-view-day-aggregation",
            "copy_fields": {
                "recid": "recid",
                "parent_recid": "parent_recid",
            },
            "query_modifiers": [],
            "required_filters": {
                "recid": "recid",
            },
            "metric_fields": {
                "views": ("sum", "count", {}),
                "unique_views": ("sum", "unique_count", {}),
            },
        },
    },
    "record-view-all-versions": {
        "cls": TermsQuery,
        "permission_factory": None,
        "params": {
            "index": "stats-record-view",
            "doc_type": "record-view-day-aggregation",
            "copy_fields": {
                "parent_recid": "parent_recid",
            },
            "query_modifiers": [],
            "required_filters": {
                "parent_recid": "parent_recid",
            },
            "metric_fields": {
                "views": ("sum", "count", {}),
                "unique_views": ("sum", "unique_count", {}),
            },
        },
    },
    "record-download": {
        "cls": TermsQuery,
        "permission_factory": None,
        "params": {
            "index": "stats-file-download",
            "doc_type": "file-download-day-aggregation",
            "copy_fields": {
                "recid": "recid",
                "parent_recid": "parent_recid",
            },
            "query_modifiers": [],
            "required_filters": {
                "recid": "recid",
            },
            "metric_fields": {
                "downloads": ("sum", "count", {}),
                "unique_downloads": ("sum", "unique_count", {}),
                "data_volume": ("sum", "volume", {}),
            },
        },
    },
    "record-download-all-versions": {
        "cls": TermsQuery,
        "permission_factory": None,
        "params": {
            "index": "stats-file-download",
            "doc_type": "file-download-day-aggregation",
            "copy_fields": {
                "parent_recid": "parent_recid",
            },
            "query_modifiers": [],
            "required_filters": {
                "parent_recid": "parent_recid",
            },
            "metric_fields": {
                "downloads": ("sum", "count", {}),
                "unique_downloads": ("sum", "unique_count", {}),
                "data_volume": ("sum", "volume", {}),
            },
        },
    },
}

STATS_PERMISSION_FACTORY = permissions_policy_lookup_factory


# Invenio-Notifications
# =================
# See https://github.com/inveniosoftware/invenio-notifications/blob/master/invenio_notifications/config.py  # noqa


NOTIFICATIONS_BACKENDS = {
    EmailNotificationBackend.id: EmailNotificationBackend(),
}
"""Notification backends."""


NOTIFICATIONS_BUILDERS = {
    # Access request
    GuestAccessRequestTokenCreateNotificationBuilder.type: GuestAccessRequestTokenCreateNotificationBuilder,
    GuestAccessRequestAcceptNotificationBuilder.type: GuestAccessRequestAcceptNotificationBuilder,
    GuestAccessRequestSubmitNotificationBuilder.type: GuestAccessRequestSubmitNotificationBuilder,
    GuestAccessRequestSubmittedNotificationBuilder.type: GuestAccessRequestSubmittedNotificationBuilder,
    GuestAccessRequestCancelNotificationBuilder.type: GuestAccessRequestCancelNotificationBuilder,
    GuestAccessRequestDeclineNotificationBuilder.type: GuestAccessRequestDeclineNotificationBuilder,
    UserAccessRequestAcceptNotificationBuilder.type: UserAccessRequestAcceptNotificationBuilder,
    UserAccessRequestSubmitNotificationBuilder.type: UserAccessRequestSubmitNotificationBuilder,
    UserAccessRequestDeclineNotificationBuilder.type: UserAccessRequestDeclineNotificationBuilder,
    UserAccessRequestCancelNotificationBuilder.type: UserAccessRequestCancelNotificationBuilder,
    # Grant user access
    GrantUserAccessNotificationBuilder.type: GrantUserAccessNotificationBuilder,
    # Comment request event
    CommentRequestEventCreateNotificationBuilder.type: CommentRequestEventCreateNotificationBuilder,
    # Community inclusion
    CommunityInclusionAcceptNotificationBuilder.type: CommunityInclusionAcceptNotificationBuilder,
    CommunityInclusionCancelNotificationBuilder.type: CommunityInclusionCancelNotificationBuilder,
    CommunityInclusionDeclineNotificationBuilder.type: CommunityInclusionDeclineNotificationBuilder,
    CommunityInclusionExpireNotificationBuilder.type: CommunityInclusionExpireNotificationBuilder,
    CommunityInclusionSubmittedNotificationBuilder.type: CommunityInclusionSubmittedNotificationBuilder,
    # Community invitation
    CommunityInvitationAcceptNotificationBuilder.type: CommunityInvitationAcceptNotificationBuilder,
    CommunityInvitationCancelNotificationBuilder.type: CommunityInvitationCancelNotificationBuilder,
    CommunityInvitationDeclineNotificationBuilder.type: CommunityInvitationDeclineNotificationBuilder,
    CommunityInvitationExpireNotificationBuilder.type: CommunityInvitationExpireNotificationBuilder,
    CommunityInvitationSubmittedNotificationBuilder.type: CommunityInvitationSubmittedNotificationBuilder,
    # Subcommunity request
    community_notifications.SubCommunityCreate.type: community_notifications.SubCommunityCreate,
    community_notifications.SubCommunityAccept.type: community_notifications.SubCommunityAccept,
    community_notifications.SubCommunityDecline.type: community_notifications.SubCommunityDecline,
}
"""Notification builders."""


NOTIFICATIONS_ENTITY_RESOLVERS = [
    EmailResolver(),
    RDMRecordServiceResultResolver(),
    ServiceResultResolver(service_id="users", type_key="user"),
    ServiceResultResolver(service_id="communities", type_key="community"),
    ServiceResultResolver(service_id="requests", type_key="request"),
    ServiceResultResolver(service_id="request_events", type_key="request_event"),
    ServiceResultResolver(service_id="groups", type_key="group"),
]
"""List of entity resolvers used by notification builders."""

NOTIFICATIONS_SETTINGS_VIEW_FUNCTION = notification_settings
"""View function for notification settings."""


# Invenio-Users-Resources
# =================
# See https://github.com/inveniosoftware/invenio-users-resources/blob/master/invenio_users_resources/config.py  # noqa


USERS_RESOURCES_SERVICE_SCHEMA = NotificationsUserSchema
"""Schema used by the users service."""


# Invenio-Requests
# =================
# See https://github.com/inveniosoftware/invenio-requests/blob/master/invenio_requests/config.py  # noqa


REQUESTS_PERMISSION_POLICY = RDMRequestsPermissionPolicy
"""The requests permission policy, extended to work with guest access requests."""


REQUESTS_ERROR_HANDLERS = {
    **request_error_handlers,
    InvalidAccessRestrictions: create_error_handler(
        lambda e: HTTPJSONException(
            code=400,
            description=e.description,
        )
    ),
}


# Invenio-Github
# =================
#
GITHUB_RELEASE_CLASS = RDMGithubRelease
"""Default RDM release class."""


# Flask-Menu
# ==========
#
USER_DASHBOARD_MENU_OVERRIDES = {}
"""Overrides for "dashboard" menu."""


# Invenio-Administration
# ======================
#
from invenio_app_rdm import __version__

ADMINISTRATION_DISPLAY_VERSIONS = [("invenio-app-rdm", f"v{__version__}")]
"""Show the InvenioRDM version in the administration panel."""
