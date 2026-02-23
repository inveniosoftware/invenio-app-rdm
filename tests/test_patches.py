# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Test monkey-patches for upstream dependency bugs."""

from unittest.mock import MagicMock, patch

import pytest

from invenio_app_rdm.patches import (
    _patched_get_needs,
    _patched_grant_tokens_dump,
    _patched_review_delete_draft,
    apply_patches,
)


class TestPatchedGetNeeds:
    """Tests for the patched RDMRecordProxy.get_needs method."""

    def test_returns_empty_when_no_context(self):
        """Return empty needs when ctx is None."""
        proxy = MagicMock()
        result = _patched_get_needs(proxy, ctx=None)
        assert result == []

    def test_returns_empty_when_no_record_permission(self):
        """Return empty needs when record_permission not in ctx."""
        proxy = MagicMock()
        result = _patched_get_needs(proxy, ctx={"other_key": "value"})
        assert result == []

    def test_returns_empty_on_pid_does_not_exist(self):
        """Return empty needs when the record PID does not exist."""
        from invenio_pidstore.errors import PIDDoesNotExistError

        proxy = MagicMock()
        proxy._ref_dict = {"record": "deleted-pid"}
        proxy.resolve.side_effect = PIDDoesNotExistError("recid", "deleted-pid")

        result = _patched_get_needs(proxy, ctx={"record_permission": "read"})
        assert result == []

    def test_returns_empty_on_pid_unregistered(self):
        """Return empty needs when the record PID is unregistered."""
        from invenio_pidstore.errors import PIDUnregistered

        pid_mock = MagicMock()
        proxy = MagicMock()
        proxy._ref_dict = {"record": "unregistered-pid"}
        proxy.resolve.side_effect = PIDUnregistered(pid_mock)

        result = _patched_get_needs(proxy, ctx={"record_permission": "read"})
        assert result == []

    def test_returns_empty_on_no_result_found(self):
        """Return empty needs when no DB row is found."""
        from sqlalchemy.orm.exc import NoResultFound

        proxy = MagicMock()
        proxy._ref_dict = {"record": "missing-pid"}
        proxy.resolve.side_effect = NoResultFound()

        result = _patched_get_needs(proxy, ctx={"record_permission": "read"})
        assert result == []

    def test_returns_needs_on_success(self):
        """Return proper needs when record resolves successfully."""
        mock_record = MagicMock()
        mock_needs = [MagicMock(), MagicMock()]
        mock_policy = MagicMock()
        mock_policy.needs = mock_needs

        proxy = MagicMock()
        proxy.resolve.return_value = mock_record

        with patch(
            "invenio_app_rdm.patches.current_rdm_records_service"
        ) as mock_service:
            mock_service.config.permission_policy_cls.return_value = mock_policy

            result = _patched_get_needs(
                proxy, ctx={"record_permission": "read"}
            )

            assert result == mock_needs
            mock_service.config.permission_policy_cls.assert_called_once_with(
                "read", record=mock_record
            )


class TestPatchedGrantTokensDump:
    """Tests for the patched GrantTokensDumperExt.dump method."""

    def test_dump_with_successful_entities(self):
        """Dump grant tokens successfully when entities resolve."""
        mock_need = MagicMock()
        mock_entity = MagicMock()
        mock_request = MagicMock()
        mock_request.topic = mock_entity
        mock_request.type.entity_needs.return_value = [mock_need]
        mock_request.id = "test-request-id"

        dumper = MagicMock()
        dumper.fields = ["topic"]
        dumper.grants_field = "grants"

        data = {}
        _patched_grant_tokens_dump(dumper, mock_request, data)

        assert "grants" in data
        assert len(data["grants"]) == 1

    def test_dump_continues_on_entity_error(self):
        """Continue dumping when an entity fails to resolve."""
        from invenio_pidstore.errors import PIDDoesNotExistError

        mock_entity_ok = MagicMock()
        mock_entity_bad = MagicMock()

        mock_request = MagicMock()
        mock_request.created_by = mock_entity_ok
        mock_request.topic = mock_entity_bad
        mock_request.id = "test-request-id"

        # topic entity_needs raises an error, created_by works fine
        mock_need = MagicMock()

        def entity_needs_side_effect(entity):
            if entity is mock_entity_bad:
                raise PIDDoesNotExistError("recid", "deleted-pid")
            return [mock_need]

        mock_request.type.entity_needs.side_effect = entity_needs_side_effect

        dumper = MagicMock()
        dumper.fields = ["created_by", "topic"]
        dumper.grants_field = "grants"

        data = {}
        _patched_grant_tokens_dump(dumper, mock_request, data)

        # Should still have grants from created_by, but not from topic
        assert "grants" in data
        assert len(data["grants"]) == 1

    def test_dump_handles_list_entities(self):
        """Handle list entity fields gracefully."""
        mock_need = MagicMock()
        mock_entity = MagicMock()
        mock_request = MagicMock()
        mock_request.reviewers = [mock_entity]
        mock_request.type.entity_needs.return_value = [mock_need]
        mock_request.id = "test-request-id"

        dumper = MagicMock()
        dumper.fields = ["reviewers"]
        dumper.grants_field = "grants"

        data = {}
        _patched_grant_tokens_dump(dumper, mock_request, data)

        assert "grants" in data
        assert len(data["grants"]) == 1

    def test_dump_with_none_entity(self):
        """Handle None entity fields (e.g. topic can be None)."""
        mock_request = MagicMock()
        mock_request.topic = None
        mock_request.type.entity_needs.return_value = []
        mock_request.id = "test-request-id"

        dumper = MagicMock()
        dumper.fields = ["topic"]
        dumper.grants_field = "grants"

        data = {}
        _patched_grant_tokens_dump(dumper, mock_request, data)

        assert data["grants"] == []


class TestApplyPatches:
    """Tests for the apply_patches function."""

    def test_apply_patches_success(self):
        """All patches should be applied successfully."""
        with patch(
            "invenio_app_rdm.patches.logger"
        ) as mock_logger:
            apply_patches()
            # No errors should be logged
            mock_logger.error.assert_not_called()

    def test_patches_are_applied_to_correct_classes(self):
        """Verify patches are applied to the correct class methods."""
        apply_patches()

        from invenio_rdm_records.requests.entity_resolvers import RDMRecordProxy
        from invenio_rdm_records.services.components.review import ReviewComponent
        from invenio_requests.records.dumpers.granttokens import (
            GrantTokensDumperExt,
        )

        assert RDMRecordProxy.get_needs == _patched_get_needs
        assert GrantTokensDumperExt.dump == _patched_grant_tokens_dump
        assert ReviewComponent.delete_draft == _patched_review_delete_draft
