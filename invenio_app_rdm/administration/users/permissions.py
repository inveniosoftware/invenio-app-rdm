# SPDX-FileCopyrightText: 2025-2026 CERN.
# SPDX-FileCopyrightText: 2025 KTH Royal Institute of Technology.
# SPDX-FileCopyrightText: 2026 Paradigm Repositories.
# SPDX-License-Identifier: MIT

"""Helpers for administration moderation access checks."""

from flask import g
from invenio_access import ActionNeed, Permission


def can_access_user_administration(identity=None):
    """Return True if the identity may access user/role admin views."""
    identity = identity or getattr(g, "identity", None)
    if not identity:
        return False

    moderator_need = ActionNeed("administration-moderation")
    permission = Permission(moderator_need)
    return permission.allows(identity)
