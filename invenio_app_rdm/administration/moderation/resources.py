# SPDX-FileCopyrightText: 2026 Northwestern University.
# SPDX-License-Identifier: MIT

"""Administration Moderation Resources."""

from flask import g
from flask_resources import Resource, resource_requestctx, response_handler, route
from invenio_rdm_records.requests import RecordDeletion
from invenio_records_resources.resources.errors import ErrorHandlersMixin
from invenio_records_resources.resources.records.resource import (
    request_extra_args,
    request_search_args,
)
from invenio_records_resources.resources.records.utils import search_preference
from invenio_records_resources.services import LinksTemplate, pagination_endpoint_links
from invenio_requests import current_requests_service
from invenio_requests.resources.requests.config import RequestsResourceConfig
from invenio_search.engine import dsl


#
# Resource config
#
class AdministrationModerationRequestsResourceConfig(RequestsResourceConfig):
    """Administration moderation requests resource configuration."""

    blueprint_name = "invenio_app_rdm_administration_moderation_requests"
    url_prefix = "/administration/moderation/requests"
    routes = {"list": ""}
    request_view_args = {}


#
# Resource
#
class AdministrationModerationRequestsResource(ErrorHandlersMixin, Resource):
    """Administration moderation requests resource.

    This resource was created for the sole purpose of correctly filtering+aggregating
    requests that need to be moderated by an administrator (have the facets count
    reflect the displayed requests). The regular requests service is used and all
    functionality/responsibilities beyond that filtering is/are left to it.
    """

    def create_url_rules(self):
        """Create the URL rules for the resource."""
        routes = self.config.routes
        url_rules = [
            route("GET", routes["list"], self.search),
        ]
        return url_rules

    @request_extra_args
    @request_search_args
    @response_handler(many=True)
    def search(self):
        """Search for administration moderation requests.

        GET /administration/moderation/requests
        """
        moderation_requests_filter = dsl.Q(
            "bool",
            filter=[
                # terms in case other types come along
                dsl.Q("terms", **{"type": [RecordDeletion.type_id]}),
            ],
        )

        items = current_requests_service.search(
            identity=g.identity,
            params=resource_requestctx.args,
            search_preference=search_preference(),
            expand=resource_requestctx.args.get("expand", False),
            extra_filter=moderation_requests_filter,
        )

        # We need to overwrite the "self" links to keep this resource's URL being used
        # instead of the generic requests URLs.
        # Overwriting it is the most expedient way to do so
        items_dict = items.to_dict()
        links_dict = pagination_endpoint_links(
            "invenio_app_rdm_administration_moderation_requests.search"
        )
        links_tpl = LinksTemplate(
            links_dict, context={"args": resource_requestctx.args}
        )
        items_dict["links"] = links_tpl.expand(g.identity, items.pagination)
        return items_dict, 200
