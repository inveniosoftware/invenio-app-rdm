# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Test that admin is not accessible even for admin users."""

from invenio_accounts.testutils import login_user_via_session


def test_admin_deny_access_admin(running_app, client, admin_user):
    login_user_via_session(client, email=admin_user.email)
    assert client.get('/admin/').status_code == 403
