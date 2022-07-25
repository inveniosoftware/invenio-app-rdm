# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""RDM Admin views."""

from flask import render_template, g
from flask_login import login_required
from invenio_access.permissions import Permission
from invenio_records_resources.services.errors import PermissionDeniedError

from flask_principal import RoleNeed
from functools import wraps


def back_office_user(function):
    @wraps(function)
    def decorated_view(*args, **kwargs):
        current_user_identity = g.identity

        permissions = Permission(RoleNeed("admin"))

        if not permissions.allows(current_user_identity):
            raise PermissionDeniedError()

        return function(*args, **kwargs)

    return decorated_view


@login_required
@back_office_user
def admin():
    return render_template("invenio_admin/admin/layout.html")


@login_required
@back_office_user
def oai_pmh():
    return render_template("invenio_admin/admin/layout.html")


@login_required
@back_office_user
def featured():
    return render_template("invenio_admin/admin/layout.html")
