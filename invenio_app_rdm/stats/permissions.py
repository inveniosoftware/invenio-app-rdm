# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Permission factories for Invenio-Stats.

In contrast to the very liberal defaults provided by Invenio-Stats, these permission
factories deny access unless otherwise specified.
"""

from invenio_stats import current_stats

DenyAllPermission = type(
    "Deny",
    (),
    {"can": lambda self: False, "allows": lambda *args: False},
)()
"""The permission factory that denies without even blinking."""


def default_deny_permission_factory(query_name, params):
    """Default deny permission factory.

    It disables the statistics by default, unless the queries have a dedicated
    configured permission factory.
    """
    if current_stats.queries[query_name].permission_factory is None:
        return DenyAllPermission
    else:
        return current_stats.queries[query_name].permission_factory(query_name, params)
