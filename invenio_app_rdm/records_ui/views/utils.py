# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Utility functions."""

from invenio_communities.communities.resolver import CommunityResolver
from invenio_rdm_records.requests import CommunitySubmission


def get_community_id(record):
    """Retrieves community UUID.

    WARNING: This should be replaced by the resolvers.
    """
    community_id = None
    parent = record['parent']
    if parent.get('communities'):
        community_id = parent['communities']['default']
    elif parent.get('review'):
        review = parent['review']
        if review['type'] == CommunitySubmission.type_id:
            community_id = review['receiver'][CommunityResolver.type_id]
    return community_id
