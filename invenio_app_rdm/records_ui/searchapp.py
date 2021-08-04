# -*- coding: utf-8 -*-
#
# Copyright (C) 2018-2021 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Configuration helper for React-SearchKit."""

from copy import deepcopy
from functools import partial

from flask import current_app
from invenio_rdm_records.searchconfig import OptionsSelector, \
    SortOptionsSelector


class SortConfig(SortOptionsSelector):
    """Sort options for the search configuration."""

    def map_option(self, key, option):
        """Generate a RSK search option."""
        return {
            "sortBy": key,
            "text": option['title']
        }


class FacetsConfig(OptionsSelector):
    """Facets options for the search configuration."""

    def map_option(self, key, option):
        """Generate an RSK aggregation option."""
        title = option.get('title', option['facet']._label)

        ui = deepcopy(option['ui'])
        ui.update({
            'aggName': key,
            'title': title,
        })

        # Nested facets
        if 'childAgg' in ui:
            ui['childAgg'].setdefault('aggName', 'inner')
            ui['childAgg'].setdefault('title', title)

        return ui


class SearchAppConfig:
    """Configuration generator for React-SearchKit."""

    default_options = dict(
        endpoint=None,
        hidden_params=None,
        app_id='rdm-search',
        headers=None,
        list_view=True,
        grid_view=False,
        pagination_options=(10, 20, 50),
        default_size=10,
        default_page=1,
        facets=None,
        sort=None,
    )

    def __init__(self, configuration_options):
        """Initialize the search configuration.

        :param endpoint: The URL path to the REST API.
        :param hidden_params: Nested arrays containing any additional query
            parameters to be used in the search.
        :param app_id: The string ID of the Search Application.
        :param headers: Dictionary containing additional headers to be included
             in the request.
        :param list_view: Boolean enabling the list view of the results.
        :param grid_view: Boolean enabling the grid view of the results.
        :param pagination_options: An integer array providing the results per
            page options.
        :param default_size: An integer setting the default number of results
            per page.
        :param default_page: An integer setting the default page.
        """
        options = deepcopy(self.default_options)
        options.update(configuration_options)
        for key, value in options.items():
            setattr(self, key, value)

    @property
    def appId(self):
        """The React appplication id."""
        return self.app_id

    @property
    def initialQueryState(self):
        """Generate initialQueryState."""
        return {
            'hiddenParams': self.hidden_params,
            'layout': 'list' if self.list_view else 'grid',
            "size": self.default_size,
            "sortBy": self.sort.default,
            "page": self.default_page,
        }

    @property
    def searchApi(self):
        """Generate searchAPI configuration."""
        return {
            "axios": {
                "url": self.endpoint,
                "withCredentials": True,
                "headers": self.headers,
            },
            "invenio": {
                "requestSerializer":
                    "InvenioRecordsResourcesRequestSerializer",
            }
        }

    @property
    def layoutOptions(self):
        """Generate the Layout Options.

        :returns: A dict with the options for React-SearchKit JS.
        """
        return {
            'listView': self.list_view,
            'gridView': self.grid_view
        }

    @property
    def sortOptions(self):
        """Format sort options to be used in React-SearchKit JS.

        :returns: A list of dicts with sorting options for React-SearchKit JS.
        """
        return list(self.sort) if self.sort is not None else []

    @property
    def aggs(self):
        """Format the aggs configuration to be used in React-SearchKit JS.

        :returns: A list of dicts for React-SearchKit JS.
        """
        return list(self.facets) if self.facets is not None else []

    @property
    def paginationOptions(self):
        """Format the pagination options to be used in React-SearchKit JS."""
        if not getattr(self, 'default_size') or \
                self.default_size not in self.pagination_options:
            raise ValueError(
                'Parameter default_size should be part of pagination_options')
        return {
                "resultsPerPage": [
                    {"text": str(option), "value": option}
                    for option in self.pagination_options
                ],
                "defaultValue": self.default_size,
            }

    @property
    def defaultSortingOnEmptyQueryString(self):
        """Defines the default sorting options when there is no query."""
        return {
            "sortBy": self.sort.default_no_query,
        }

    @classmethod
    def generate(cls, options, **kwargs):
        """Create JSON config for React-Searchkit."""
        generator_object = cls(options)
        config = {
            "appId": generator_object.appId,
            "initialQueryState": generator_object.initialQueryState,
            "searchApi": generator_object.searchApi,
            "sortOptions": generator_object.sortOptions,
            "aggs": generator_object.aggs,
            "layoutOptions": generator_object.layoutOptions,
            "sortOrderDisabled": True,
            "paginationOptions": generator_object.paginationOptions,
            "defaultSortingOnEmptyQueryString":
                generator_object.defaultSortingOnEmptyQueryString

        }
        config.update(kwargs)
        return config


#
# Application state context processors
#
def sort_config(config_name):
    """Sort configuration."""
    return SortConfig(
        current_app.config['RDM_SORT_OPTIONS'],
        current_app.config[config_name].get('sort', []),
        current_app.config[config_name].get('sort_default', None),
        current_app.config[config_name].get('sort_default_no_query'),
    )


def facets_config(config_name):
    """Facets configuration."""
    return FacetsConfig(
        current_app.config['RDM_FACETS'],
        current_app.config[config_name].get('facets', [])
    )


def search_app_config(config_name, endpoint, overrides=None, **kwargs):
    """Search app config."""
    opts = dict(
        endpoint=endpoint,
        headers={"Accept": "application/vnd.inveniordm.v1+json"},
        grid_view=False,
        sort=sort_config(config_name),
        facets=facets_config(config_name),
    )
    opts.update(kwargs)
    overrides = overrides or {}
    return SearchAppConfig.generate(opts, **overrides)


def search_app_context():
    """Search app context processor."""
    return {
        'search_app_config': partial(
            search_app_config, 'RDM_SEARCH', '/api/records'),
        'search_drafts_app_config': partial(
            search_app_config, 'RDM_SEARCH_DRAFTS', '/api/user/records')
    }
