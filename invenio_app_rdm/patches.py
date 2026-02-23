# -*- coding: utf-8 -*-
#
# Copyright (C) 2025 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Monkey-patches for upstream dependency bugs.

This module applies targeted fixes to dependency packages that have not yet
released patches for known issues. Each patch should reference the upstream
issue/PR and be removed once the fix is available upstream.

Fixes applied:
    - RDMRecordProxy.get_needs(): Handles PIDDoesNotExistError when the
      referenced draft/record has been deleted (e.g. after cancelling a review
      and deleting the draft). Without this fix, reindexing requests that
      reference deleted records causes PIDDoesNotExistError.

    - GrantTokensDumperExt.dump(): Defense-in-depth fix that catches any
      entity resolution errors during request indexing, preventing a single
      broken entity reference from blocking the entire reindex operation.

    - ReviewComponent.delete_draft(): Clears the review reference on the
      parent record when the review is in a cancelled state, preventing
      orphaned requests from referencing deleted drafts.
"""

import logging

logger = logging.getLogger(__name__)


def _patched_get_needs(self, ctx=None):
    """Patched get_needs that handles deleted records gracefully.

    Original: invenio_rdm_records.requests.entity_resolvers.RDMRecordProxy.get_needs

    When a draft is deleted after its review request was cancelled, the
    request still references the draft. During reindexing, get_needs() tries
    to resolve the deleted draft's PID, causing PIDDoesNotExistError.
    This patch catches the error and returns empty needs instead.
    """
    from invenio_pidstore.errors import PIDDoesNotExistError, PIDUnregistered
    from sqlalchemy.orm.exc import NoResultFound

    from invenio_rdm_records.proxies import current_rdm_records_service

    if ctx is None or "record_permission" not in ctx:
        return []

    try:
        record = self.resolve()
    except (PIDDoesNotExistError, PIDUnregistered, NoResultFound):
        logger.warning(
            "Could not resolve record for entity proxy %s. "
            "The record may have been deleted. Returning empty needs.",
            self._ref_dict,
        )
        return []

    record_permission = ctx["record_permission"]
    needs = current_rdm_records_service.config.permission_policy_cls(
        record_permission, record=record
    ).needs
    return needs


def _patched_grant_tokens_dump(self, request, data):
    """Patched dump that handles entity resolution errors gracefully.

    Original: invenio_requests.records.dumpers.granttokens.GrantTokensDumperExt.dump

    Defense-in-depth fix: if any entity referenced by a request cannot be
    resolved (e.g. because the referenced record was deleted), log a warning
    and continue indexing with whatever grants could be resolved, rather
    than crashing the entire reindex operation.
    """
    from invenio_records_resources.references import EntityGrant

    grants = []
    for field_name in self.fields:
        entity = getattr(request, field_name)
        try:
            if isinstance(entity, list):
                for e in entity:
                    for need in request.type.entity_needs(e):
                        grants.append(EntityGrant(field_name, need).token)
            else:
                for need in request.type.entity_needs(entity):
                    grants.append(EntityGrant(field_name, need).token)
        except Exception:
            logger.warning(
                "Failed to resolve entity needs for field '%s' "
                "on request '%s'. The referenced entity may have "
                "been deleted.",
                field_name,
                request.id,
            )
    data[self.grants_field] = grants


def _patched_review_delete_draft(
    self, identity, draft=None, record=None, force=False
):
    """Patched delete_draft that cleans up cancelled review requests.

    Original: invenio_rdm_records.services.components.review.ReviewComponent.delete_draft

    When a draft with a cancelled review is deleted, the original code
    leaves the request as-is (only deleting requests in 'created' status).
    This creates orphaned requests that reference deleted drafts, causing
    PIDDoesNotExistError during reindexing.

    This patch additionally clears the review topic reference for cancelled
    requests so they no longer point to the deleted draft.
    """
    from invenio_i18n import lazy_gettext as _
    from invenio_requests import current_requests_service

    from invenio_rdm_records.services.errors import ReviewStateError

    review = draft.parent.review
    if review is None:
        return

    # Block deletion if the review is still open (e.g. submitted).
    if review.is_open:
        raise ReviewStateError(
            _(
                "You cannot delete a draft with an open review. Please "
                "cancel the review first."
            )
        )

    if review.status == "created":
        # Delete request entirely if it was never submitted.
        current_requests_service.delete(
            identity, draft.parent.review.id, uow=self.uow
        )
    elif review.status == "cancelled":
        # For cancelled requests: clear the topic reference so the request
        # no longer points to the draft that is about to be deleted.
        # This prevents PIDDoesNotExistError when the request is reindexed.
        review.topic = None
        review.commit()
        # Re-index the request to update the search index.
        from invenio_records_resources.services.uow import RecordCommitOp

        self.uow.register(
            RecordCommitOp(review, indexer=current_requests_service.indexer)
        )


def apply_patches():
    """Apply all monkey-patches to fix upstream dependency bugs.

    This function should be called during app finalization (in ext.py).
    Each patch is applied independently so that a failure in one does not
    block the others.
    """
    # Patch 1: RDMRecordProxy.get_needs()
    try:
        from invenio_rdm_records.requests.entity_resolvers import RDMRecordProxy

        RDMRecordProxy.get_needs = _patched_get_needs
        logger.debug("Applied patch: RDMRecordProxy.get_needs")
    except Exception:
        logger.error(
            "Failed to apply patch for RDMRecordProxy.get_needs", exc_info=True
        )

    # Patch 2: GrantTokensDumperExt.dump()
    try:
        from invenio_requests.records.dumpers.granttokens import GrantTokensDumperExt

        GrantTokensDumperExt.dump = _patched_grant_tokens_dump
        logger.debug("Applied patch: GrantTokensDumperExt.dump")
    except Exception:
        logger.error(
            "Failed to apply patch for GrantTokensDumperExt.dump", exc_info=True
        )

    # Patch 3: ReviewComponent.delete_draft()
    try:
        from invenio_rdm_records.services.components.review import ReviewComponent

        ReviewComponent.delete_draft = _patched_review_delete_draft
        logger.debug("Applied patch: ReviewComponent.delete_draft")
    except Exception:
        logger.error(
            "Failed to apply patch for ReviewComponent.delete_draft", exc_info=True
        )
