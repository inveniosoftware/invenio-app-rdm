# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

from __future__ import absolute_import, print_function

from elasticsearch_dsl.query import Q
from flask import current_app
from invenio_search.api import DefaultFilter, RecordsSearch


def rdm_recods_filter():

    perm_factory = current_app.config['RECORDS_REST_ENDPOINTS']['recid']['list_permission_factory_imp']()
    # FIXME: this might fail if factory returns None, meaning no "query_filter" 
    # was implemente in the generators. However, IfPublic should always be there.
    return Q('bool', filter=perm_factory.query_filter)


class RDMRecordsSearch(RecordsSearch):
    """Search class for RDM records."""

    class Meta:
        """Default index and filter for frontpage search."""
        index = 'records'
        doc_types = None
        default_filter = DefaultFilter(rdm_recods_filter)
