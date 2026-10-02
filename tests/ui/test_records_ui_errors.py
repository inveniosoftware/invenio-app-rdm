# SPDX-FileCopyrightText: 2026 Flobo2689x.
# SPDX-License-Identifier: MIT

"""Test error handling of the records UI."""

import pytest

from invenio_app_rdm.records_ui.views import records as records_views


def test_internal_key_error_is_not_rendered_as_not_found(client, record, monkeypatch):
    """An internal KeyError must not be turned into a "Page not found" response."""

    def dump_obj(self, obj):
        raise KeyError("internal inconsistency")

    monkeypatch.setattr(records_views.UIJSONSerializer, "dump_obj", dump_obj)

    with pytest.raises(KeyError, match="internal inconsistency"):
        client.get(f"/records/{record.id}")
