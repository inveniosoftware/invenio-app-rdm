# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Permissions."""

from invenio_records_permissions.generators import AnyUser
from invenio_records_permissions.permissions.records import \
    RecordPermissionPolicy


class RDMRecordPermissionPolicy(RecordPermissionPolicy):
    """Access control configuration for records.

    Note that even if the array is empty, the invenio_access Permission class
    always adds the ``superuser-access``, so admins will always be allowed.

    - Create action given to everyone. NOTE: just for testing purposes.
    - Read access given to everyone if public record/files and owners always.
      (inherited)
    - Update access given to record owners. (inherited)
    - Delete access given to admins only. (inherited)
    """

    can_create = [AnyUser]
