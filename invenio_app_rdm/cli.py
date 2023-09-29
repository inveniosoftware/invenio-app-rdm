# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
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
@click.option(
    "-o",
    "--order",
    default=""
    )
@with_appcontext
def rebuild_all_indices(order):
    """Extracting ordering info if it exists."""
    ordered_indices_to_rebuild = order.split(",")
    available_services = current_service_registry._services
    for index_to_rebuild in ordered_indices_to_rebuild:
        if index_to_rebuild not in available_services:
            click.secho(f"{index_to_rebuild} is not part of available indices that can be rebuilt", fg="red")
            click.secho(f"You can chose out of these services: {' , '.join(available_services.keys())}", fg="red")
            return
    """Schedule reindexing of items for search."""
    if order == "":
        click.secho("Scheduling bulk indexing for all items.", fg="yellow")
        for name, service in current_service_registry._services.items():
            if hasattr(service, "rebuild_index"):
                click.echo(f"{name}... ", nl=False)
                service.rebuild_index(system_identity)
                click.secho("Done.", fg="green")
    else:
        click.secho("Scheduling bulk indexing for specified items in specified order.", fg="yellow")
        for index_to_rebuild in ordered_indices_to_rebuild:
            if hasattr(current_service_registry._services[index_to_rebuild], "rebuild_index"):
                click.echo(f"{index_to_rebuild}... ", nl=False)
                current_service_registry._services[index_to_rebuild].rebuild_index(system_identity)
                click.secho("Done.", fg="green")

