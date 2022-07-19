# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""RDM Admin views."""

from flask import render_template
from flask_login import current_user, login_required


# TODO implement check for admin/manager user!
@login_required
def admin():
    return render_template("invenio_admin/admin/layout.html")


@login_required
def oai_pmh():
    return render_template("invenio_admin/admin/layout.html")


@login_required
def featured():
    return render_template("invenio_admin/admin/layout.html")
