# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 TU Wien.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Tests for utility functions."""

from datetime import datetime

from invenio_app_rdm.records_ui.utils import set_default_value


def test_set_default_value__value():
    """Test setting a value."""
    dict_ = {"metadata": {"publication_date": None}}
    value = "1939-01-01"
    path = "publication_date"

    set_default_value(dict_, value, path)

    assert dict_["metadata"]["publication_date"] == value


def test_set_default_value__callable():
    """Test setting a value via a callable."""
    dict_ = {"metadata": {"publication_date": None}}

    def func():
        return datetime.now().strftime("%Y-%m-%d")

    path = "publication_date"
    today = func()

    set_default_value(dict_, func, path)

    assert dict_["metadata"]["publication_date"] == today


def test_set_default_value__no_path_prefix():
    """Test setting a value for an unprefixed path."""
    dict_ = {"metadata": {"publication_date": None}}
    value = "1939-01-01"
    path = ".publication_date"

    set_default_value(dict_, value, path)

    assert dict_["metadata"]["publication_date"] is None
    assert dict_["publication_date"] == value


def test_set_default_value__explicit_and_automatic_prefix():
    """Compare values set with auto-prefix and explicit prefix."""
    dict1 = {"metadata": {"publication_date": None}}
    dict2 = dict1.copy()
    value = "1939-01-01"
    path1 = "publication_date"
    path2 = ".metadata.publication_date"

    set_default_value(dict1, value, path1)
    set_default_value(dict2, value, path2)

    assert (
        dict1["metadata"]["publication_date"] == dict2["metadata"]["publication_date"]
    )
    assert dict1["metadata"]["publication_date"] == value
