# -*- coding: utf-8 -*-
#
# Copyright (C) 2019-2020 CERN.
# Copyright (C) 2019-2020 Northwestern University.
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

from flask_principal import Denial
from invenio_access.permissions import any_user

from .records_ui.utils import previewer_record_file_factory

# PIDSTORE_RECID_FIELD
# RECORDS_PERMISSIONS_RECORD_POLICY
# RECORDS_REST_DEFAULT_SORT
# RECORDS_REST_FACETS
# RECORDS_REST_SORT_OPTIONS

# TODO: Remove when records-rest is out of communities and files
RECORDS_REST_ENDPOINTS = {}
RECORDS_UI_ENDPOINTS = {}


def _(x):
    """Identity function used to trigger string extraction."""
    return x


# Flask
# =====
# See https://flask.palletsprojects.com/en/1.1.x/config/

APP_ALLOWED_HOSTS = ['0.0.0.0', 'localhost', '127.0.0.1']
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

RATELIMIT_STORAGE_URL = "redis://localhost:6379/3"
"""Storage for ratelimiter."""


# Flask-Babel
# ===========
# See https://pythonhosted.org/Flask-Babel/#configuration

BABEL_DEFAULT_LOCALE = 'en'
"""Default locale (language)."""

BABEL_DEFAULT_TIMEZONE = 'Europe/Zurich'
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

APP_THEME = ['semantic-ui']
"""Application theme."""

BASE_TEMPLATE = 'invenio_theme/page.html'
"""Global base template."""

COVER_TEMPLATE = 'invenio_theme/page_cover.html'
"""Cover page base template (used for e.g. login/sign-up)."""

SETTINGS_TEMPLATE = 'invenio_theme/page_settings.html'
"""Settings base template."""

THEME_FOOTER_TEMPLATE = 'invenio_app_rdm/footer.html'
"""Footer base template."""

THEME_FRONTPAGE = False
"""Use default frontpage."""

THEME_FRONTPAGE_TITLE = _('The turn-key research data management repository')
"""Frontpage title."""

THEME_HEADER_TEMPLATE = 'invenio_app_rdm/header.html'
"""Header base template."""

THEME_HEADER_LOGIN_TEMPLATE = 'invenio_app_rdm/header_login.html'
"""Header login base template."""

THEME_LOGO = 'images/invenio-rdm.svg'
"""Theme logo."""

THEME_SITENAME = _('InvenioRDM')
"""Site name."""


# Invenio-Communities
# ===================

COMMUNITIES_ENABLED = False
"""Control if community views and endpoints are enabled."""


# Invenio-Files-REST
# ==================
# See https://invenio-files-rest.readthedocs.io/en/latest/configuration.html

def files_rest_permission_factory(obj, action):
    """Generate a denying permission."""
    return Denial(any_user)


FILES_REST_PERMISSION_FACTORY = files_rest_permission_factory
"""Set default files permission factory."""


# Invenio-IIIF
# =================
# See https://invenio-iiif.readthedocs.io/en/latest/configuration.html

IIIF_PREVIEW_TEMPLATE = "invenio_app_rdm/landing_page/iiif_preview.html"
"""Template for IIIF image preview."""

# Invenio-Previewer
# =================
# See https://github.com/inveniosoftware/invenio-previewer/blob/master/invenio_previewer/config.py  # noqa

PREVIEWER_PREFERENCE = [
    'csv_dthreejs',
    # TODO: IIIF checks bucket-level permissions, and thus won't work
    # 'iiif_image',
    'simple_image',
    'json_prismjs',
    'xml_prismjs',
    'mistune',
    'pdfjs',
    'ipynb',
    'zip',
]
"""Preferred previewers."""

# PREVIEWER_RECORD_FILE_FACOTRY = previewer_record_file_factory

# Invenio-Formatter
# =================

FORMATTER_BADGES_ALLOWED_TITLES = ['DOI', 'doi']
"""List of allowed titles in badges."""

FORMATTER_BADGES_TITLE_MAPPING = {'doi': 'DOI'}
"""Mapping of titles."""

# Invenio-Mail / Flask-Mail
# =========================
# See https://pythonhosted.org/Flask-Mail/#configuring-flask-mail

MAIL_SUPPRESS_SEND = True
"""Disable email sending by default."""


# Flask-Collect
# =============
# See https://github.com/klen/Flask-Collect#setup

COLLECT_STORAGE = 'flask_collect.storage.file'
"""Static files collection method (defaults to copying files)."""


# Invenio-Accounts
# ================
# (Flask-Security, Flask-Login, Flask-Principal, Flask-KVSession)
# See https://invenio-accounts.readthedocs.io/en/latest/configuration.html
# See https://flask-security.readthedocs.io/en/3.0.0/configuration.html

ACCOUNTS_SESSION_REDIS_URL = 'redis://localhost:6379/1'
"""Redis session storage URL."""

ACCOUNTS_USERINFO_HEADERS = True
"""Enable session/user id request tracing.

This feature will add X-Session-ID and X-User-ID headers to HTTP response. You
MUST ensure that NGINX (or other proxies) removes these headers again before
sending the response to the client. Set to False, in case of doubt.
"""

SECURITY_EMAIL_SENDER = "info@inveniosoftware.org"
"""Email address used as sender of account registration emails."""

SECURITY_EMAIL_SUBJECT_REGISTER = _("Welcome to Invenio App RDM!")
"""Email subject for account registration emails."""


# Invenio-Celery / Celery / Flask-Celeryext
# =========================================
# See https://invenio-celery.readthedocs.io/en/latest/configuration.html
# See docs.celeryproject.org/en/latest/userguide/configuration.html
# See https://flask-celeryext.readthedocs.io/en/latest/

BROKER_URL = "amqp://guest:guest@localhost:5672/"
"""URL of message broker for Celery 3 (default is RabbitMQ)."""

CELERY_BEAT_SCHEDULE = {
    'indexer': {
        'task': 'invenio_indexer.tasks.process_bulk_queue',
        'schedule': timedelta(minutes=5),
    },
    'accounts': {
        'task': 'invenio_accounts.tasks.clean_session_table',
        'schedule': timedelta(minutes=60),
    },
    'draft_resources': {
        'task': 'invenio_draft_resources.tasks.cleanup_drafts',
        'schedule': timedelta(minutes=60),
    }
}
"""Scheduled tasks configuration (aka cronjobs)."""

CELERY_BROKER_URL = BROKER_URL
"""Same as BROKER_URL to support Celery 4."""

CELERY_RESULT_BACKEND = "redis://localhost:6379/2"
"""URL of backend for result storage (default is Redis)."""


# Flask-SQLAlchemy
# ================
# See https://flask-sqlalchemy.palletsprojects.com/en/2.x/config/

SQLALCHEMY_DATABASE_URI = \
    'postgresql+psycopg2://invenio-app-rdm:invenio-app-rdm@localhost/' \
    'invenio-app-rdm'
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

JSONSCHEMAS_HOST = 'unused'
# This variable is set to something different than localhost to avoid a warning
# being issued. The value is however not used, because of the two variables
# set below.

RECORDS_REFRESOLVER_CLS = "invenio_records.resolver.InvenioRefResolver"
"""Custom JSONSchemas ref resolver class.

Note that when using a custom ref resolver class you should also set
``RECORDS_REFRESOLVER_STORE`` to point to a JSONSchema ref resolver store.
"""

RECORDS_REFRESOLVER_STORE = (
    "invenio_jsonschemas.proxies.current_refresolver_store"
)
"""JSONSchemas ref resolver store.

Used together with ``RECORDS_REFRESOLVER_CLS`` to provide a specific
ref resolver store.
"""

# OAI-PMH
# =======
# See https://github.com/inveniosoftware/invenio-oaiserver/blob/master/invenio_oaiserver/config.py  # noqa
# (Using GitHub because documentation site out-of-sync at time of writing)

OAISERVER_ID_PREFIX = 'oai:invenio-app-rdm.org:'
"""The prefix that will be applied to the generated OAI-PMH ids."""


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

ACCESS_CACHE = "invenio_cache:current_cache"
"""Use the cache for permmissions caching."""

# Invenio-Search
# ==============
# See https://invenio-search.readthedocs.io/en/latest/configuration.html

SEARCH_ELASTIC_HOSTS = [{"host": "localhost", "port": 9200}]
"""Elasticsearch hosts."""


# Invenio-Base
# ============
# See https://invenio-base.readthedocs.io/en/latest/api.html#invenio_base.wsgi.wsgi_proxyfix  # noqa

WSGI_PROXIES = 2
"""Correct number of proxies in front of your application."""


# Invenio-APP-RDM
# ===============

SEARCH_UI_SEARCH_TEMPLATE = 'invenio_app_rdm/records/search.html'
"""Search page's base template."""

APP_RDM_ROUTES = {
    "index": "/",
    "help_search": "/help/search",
    "record_search": "/search2",
    "record_detail": "/records/<pid_value>",
    "record_export": "/records/<pid_value>/export/<export_format>",
    "record_file_preview": "/records/<pid_value>/preview/<path:filename>",
    "record_file_download": "/records/<pid_value>/files/<path:filename>",
    "record_from_pid": "/<any({schemes}):pid_scheme>/<path:pid_value>",
    "record_latest": "/records/<pid_value>/latest",
    "deposit_search": "/uploads",
    "deposit_create": "/uploads/new",
    "deposit_edit": "/uploads/<pid_value>",
}

APP_RDM_RECORD_EXPORTERS = {
    "json": {
        "name": _("JSON"),
        "serializer": ("invenio_rdm_records.resources.serializers:"
                       "UIJSONSerializer")
    },
    "datacite": {
       "name": _("DataCite JSON"),
       "serializer": ("invenio_rdm_records.resources.serializers:"
                      "DataCite43JSONSerializer")
    }
}

APP_RDM_RECORDS_EXPORT_URL = "/records/<pid_value>/export/<export_format>"

APP_RDM_DEPOSIT_FORM_DEFAULTS = {
    "publication_date": lambda: datetime.now().strftime("%Y-%m-%d"),
    "rights": [
        {
            "id": "cc-by-4.0",
            "title": "Creative Commons Attribution 4.0 International",
            "description": ("The Creative Commons Attribution license allows "
                            "re-distribution and re-use of a licensed work "
                            "on the condition that the creator is "
                            "appropriately credited."),
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


# Invenio-IIIF
# ===================

IIIF_API_DECORATOR_HANDLER = None
IIIF_IMAGE_OPENER_HANDLER = "invenio_rdm_records.resources.iiif:image_opener"
