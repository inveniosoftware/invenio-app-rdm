# -*- coding: utf-8 -*-
#
# Copyright (C) 2022-2024 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Command-line tools for invenio app rdm."""

import click
from flask.cli import with_appcontext
from invenio_access.permissions import system_identity
from invenio_records_resources.proxies import current_service_registry

from .fixtures import FixturesEngine, Pages


@click.group()
def rdm():
    """Invenio app rdm commands."""


@rdm.group()
def pages():
    """Static pages."""


@pages.command("create")
@click.option(
    "-f",
    "--force",
    "force",
    default=False,
    is_flag=True,
    show_default=True,
    help="Creates static pages.",
)
@with_appcontext
def create_static_pages(force):
    """Create static pages."""
    click.secho("Creating static pages...", fg="green")

    Pages().run(force=force)

    click.secho("Created static pages!", fg="green")


@rdm.command("fixtures")
@with_appcontext
def create_fixtures():
    """Create the fixtures."""
    click.secho("Creating required fixtures...", fg="green")

    FixturesEngine().run()

    click.secho("Created required fixtures!", fg="green")


@rdm.command("rebuild-all-indices")
@click.option("-o", "--order", default="")
@with_appcontext
def rebuild_all_indices(order):
    """Schedule reindexing of (all) items for search with optional selecting and ordering."""
    services = current_service_registry._services
    service_names = services.keys()
    services_to_reindex = order.split(",") if order else service_names

    for service_to_reindex in services_to_reindex:
        if service_to_reindex not in service_names:
            click.secho(
                f"Service: '{service_to_reindex}' is not part of available services that can be reindexed",  # noqa
                fg="red",
            )
            click.secho(
                f"You can chose out of these services: {' , '.join(service_names)}",
                fg="red",
            )
            return

    click.secho("Scheduling bulk indexing.", fg="yellow")
    for service_to_reindex in services_to_reindex:
        service = services[service_to_reindex]
        if hasattr(service, "rebuild_index"):
            click.echo(f"Reindexing {service_to_reindex}... ", nl=False)
            try:
                service.rebuild_index(system_identity)
            except NotImplementedError:
                click.secho(
                    f"{service_to_reindex} does not use the search cluster, skipping.",
                    fg="green",
                )
                continue
            else:
                # success
                click.secho("Done.", fg="green")
