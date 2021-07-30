# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Permission factory to block access to admin.

The Invenio-Admin interface is deprecated for InvenioRDM and should not be
used. The reason being that Invenio-Admin is too much of a database inspection
tool, rather than an actual administration interface.
"""

from invenio_access.permissions import Permission


class Deny(Permission):
    """Permission that always deny access."""

    def __init__(self):
        """Deny."""
        super().__init__()

    def allows(self, identity):
        """Deny."""
        return False


def permission_factory(admin_view):
    """Deny access to admin interface.

    This permission factory is being installed via the
    ``ADMIN_PERMISSION_FACTORY`` configuration variable.
    """
    return Deny()
