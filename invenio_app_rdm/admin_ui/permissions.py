# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2022 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Permissions for Invenio-Admin."""


from flask_principal import ActionNeed
from invenio_access import Permission

action_admin_access = ActionNeed("admin-access")
"""Define the action needed by the default permission factory."""


def admin_permission_factory():
    """Default factory for creating a permission for an admin."""

    return Permission(action_admin_access)


admin_access = admin_permission_factory()
