# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""RDM Admin views."""

from flask import render_template, g
from flask_login import login_required
from invenio_app_rdm.admin_ui.permissions import admin_access




@login_required
@admin_access.require()
def admin():
    return render_template("invenio_admin/admin/layout.html")


@login_required
@admin_access.require()
def oai_pmh():
    return render_template("invenio_admin/admin/layout.html")


@login_required
@admin_access.require()
def featured():
    return render_template("invenio_admin/admin/layout.html")
