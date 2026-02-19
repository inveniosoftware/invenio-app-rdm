# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
# Copyright (C) 2025 KTH Royal Institute of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Helpers for administration moderation access checks."""

from flask import g
from flask_principal import RoleNeed
from invenio_access import Permission
from invenio_access.permissions import superuser_access


def can_access_user_administration(identity=None):
    """Return True if the identity may access user/role admin views."""
    identity = identity or getattr(g, "identity", None)
    if not identity:
        return False

    provides = identity.provides
    admin_need = RoleNeed("administration")
    moderator_need = RoleNeed("administration-moderation")

    permission = Permission(superuser_access)
    if permission.allows(identity):
        return True

    return admin_need in provides and moderator_need in provides
