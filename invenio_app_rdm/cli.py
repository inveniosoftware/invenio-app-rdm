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
from invenio_accounts.cli import users as cli_users
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


@cli_users.command("delete")
@click.argument("user_id")
def user_delete(user_id):
    """Delete a user, checking first the existence of RDM records."""
    from invenio_accounts.proxies import current_datastore

    user = current_datastore.get_user(user_id)
    if not user:
        click.secho(f"User {user_id} not found.", fg="red")
        return

    if not click.confirm(
        f'Are you sure you want to delete user "{user.id}/{user.username}/{user.email}"?'
    ):
        click.secho("Aborted.", fg="red")
        return

    from invenio_access.utils import get_identity

    idty = get_identity(user)

    from invenio_rdm_records.proxies import current_rdm_records_service

    drafts = current_rdm_records_service.search_drafts(idty)
    if drafts.total:
        click.secho(f"Aborted. User still has {drafts.total} drafts", fg="red")
        return

    records = current_rdm_records_service.search(idty)
    if records.total:
        click.secho(f"Aborted. User still has {records.total} records", fg="red")
        return

    from invenio_communities.proxies import current_communities

    communities = current_communities.service.members.read_memberships(idty)[
        "memberships"
    ]
    if communities:
        click.secho(f"Aborted. User part of communities: {communities}", fg="red")
        return

    from invenio_requests import current_requests_service

    requests = current_requests_service.search_user_requests(idty)
    if requests:
        click.secho(f"Aborted. User part of communities: {communities}", fg="red")
        return

    from invenio_accounts.models import (
        LoginInformation,
        SessionActivity,
        User,
        userrole,
    )
    from invenio_db import db
    from invenio_oauthclient.models import RemoteAccount, RemoteToken, UserIdentity
    from invenio_users_resources.proxies import current_users_service

    with db.session.begin_nested():
        d = db.session.query(userrole).filter(userrole.c.user_id == user_id)
        d.delete(synchronize_session=False)
        SessionActivity.query.filter(SessionActivity.user_id == user_id).delete()
        UserIdentity.query.filter(UserIdentity.id_user == user_id).delete()
        ra = RemoteAccount.query.filter(RemoteAccount.user_id == user_id).one_or_none()
        if ra:
            RemoteToken.query.filter(RemoteToken.id_remote_account == ra.id).delete()
            ra.delete()

        LoginInformation.query.filter(LoginInformation.user_id == user_id).delete()
        User.query.filter(User.id == user_id).delete()

    db.session.commit()
    current_users_service.indexer.delete_by_id(user_id)
    click.secho(f"Successfully deleted user.", fg="green")
