# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
# Copyright (C) 2019 Northwestern University,
#                    Galter Health Sciences Library & Learning Center.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Permissions for Invenio App RDM."""


from invenio_records_permissions.generators import AnyUser, \
    AnyUserIfPublicFiles
from invenio_records_permissions.permissions.records import \
    RecordPermissionConfig


class RDMRecordPermissionConfig(RecordPermissionConfig):
    """Access control configuration for records.

    Note that even if the array is empty, the invenio_access Permission class
    always adds the ``superuser-access``, so admins will always be allowed.

    - Create action given to everyone. NOTE: just for testing purposes.
    - Read access given to everyone.
    - Update access given to record owners.
    - Delete access given to admins only.
    """

    can_create = [AnyUser]
    can_read_files = [AnyUserIfPublicFiles]
