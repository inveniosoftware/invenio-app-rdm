# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio-App-RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Command-line tools for invenio app rdm."""
import click
from flask.cli import with_appcontext

from invenio_app_rdm.fixtures import FixturesEngine, Pages


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
