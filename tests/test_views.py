# -*- coding: utf-8 -*-
#
# Copyright (C) 2024 CERN.
# Copyright (C) 2024 KTH Royal Institute of Technology.
#
# Invenio-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.


from unittest.mock import Mock, patch

import pytest

from invenio_app_rdm.theme.views import add_static_page_routes


def test_add_static_page_routes():
    """Test add_static_page_routes function."""

    # Mocking the blueprint and app objects
    mock_blueprint = Mock()
    mock_app = Mock()
    mock_app.config = {"APP_RDM_PAGES": {"endpoint1": "/path1", "endpoint2": "/path2"}}

    # Mocking the create_page_view function
    with patch("invenio_app_rdm.theme.views.create_page_view") as mock_create_page_view:
        mock_create_page_view.side_effect = lambda x: f"view_func_{x}"

        add_static_page_routes(mock_blueprint, mock_app)

    mock_blueprint.add_url_rule.assert_any_call(
        "/path1", endpoint="endpoint1", view_func="view_func_/path1"
    )
    mock_blueprint.add_url_rule.assert_any_call(
        "/path2", endpoint="endpoint2", view_func="view_func_/path2"
    )

    # Check if was called with the right arguments
    mock_create_page_view.assert_any_call("/path1")
    mock_create_page_view.assert_any_call("/path2")

    # Check if was called the right number of times
    assert mock_blueprint.add_url_rule.call_count == 2
