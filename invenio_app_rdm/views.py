# SPDX-FileCopyrightText: 2019-2025 CERN.
# SPDX-License-Identifier: MIT

"""General views and view utilities."""


def create_url_rule(rule, default_view_func):
    """Generate rule from string or tuple."""
    # TODO: We want to deprecate the use of this kind of "string or 2-tuple" config
    #       values, and directly use dictionaries that map exactly to the parameters
    #       that `Blueprint.add_url_rule(...)` accepts, with some sane defaults.
    if isinstance(rule, tuple):
        path, view_func = rule

        return {"rule": path, "view_func": view_func}
    else:
        return {"rule": rule, "view_func": default_view_func}
