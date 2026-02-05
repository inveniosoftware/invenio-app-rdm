# -*- coding: utf-8 -*-
#
# Copyright (C) 2023-2024 CERN.
# Copyright (C) 2024 KTH Royal Institute of Technology.
#
# Invenio App RDM is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio administration users view module."""

from functools import partial

from flask import abort, current_app, flash, redirect, url_for
from flask_security import current_user
from flask_wtf import FlaskForm
from invenio_access.utils import get_identity
from invenio_accounts.proxies import current_datastore
from invenio_administration.views.base import (
    AdminResourceDetailView,
    AdminResourceEditView,
    AdminResourceListView,
)
from invenio_i18n import lazy_gettext as _
from invenio_records_resources.services.errors import PermissionDeniedError
from invenio_search_ui.searchconfig import search_app_config
from invenio_users_resources.proxies import current_user_resources
from marshmallow import ValidationError
from wtforms import SelectMultipleField, SubmitField
from wtforms.validators import Optional

USERS_ITEM_LIST = {
    "user": {"text": _("User"), "order": 2, "width": 3},
    "username": {"text": _("Username"), "order": 3, "width": 2},
    "email": {"text": _("Email"), "order": 4, "width": 2},
    "status": {"text": _("Status"), "order": 5, "width": 1},
    "created": {"text": _("Created"), "order": 6, "width": 1},
    "updated": {"text": _("Updated"), "order": 6, "width": 1},
    "links": {"text": "", "order": 7, "width": 1},
}

USERS_ITEM_DETAIL = {
    "id": {"text": _("ID"), "order": 1, "width": 1},
    "username": {"text": _("Username"), "order": 3, "width": 2},
    "email": {"text": _("Email"), "order": 4, "width": 1},
    "domain": {"text": _("Domain "), "order": 5, "width": 1},
    "status": {"text": _("Status"), "order": 6, "width": 1},
    "visibility": {"text": _("Visibility"), "order": 7, "width": 1},
    "active": {"text": _("Active"), "order": 8, "width": 1},
    "roles": {"text": _("Roles"), "order": 9, "width": 2},
    "confirmed_at": {"text": _("Confirmed at"), "order": 10, "width": 1},
    "verified_at": {"text": _("Verified at"), "order": 11, "width": 1},
    "blocked_at": {"text": _("Blocked at"), "order": 12, "width": 1},
    "created": {"text": _("Created"), "order": 13, "width": 2},
    "updated": {"text": _("Updated"), "order": 14, "width": 2},
}


class UserRolesForm(FlaskForm):
    """Simple form allowing admins to pick zero or more roles."""

    roles = SelectMultipleField(label=_("Roles"), validators=[Optional()], coerce=str)
    submit = SubmitField(_("Save changes"))


class UsersListView(AdminResourceListView):
    """Configuration for users sets list view."""

    api_endpoint = "/users/all"
    extension_name = "invenio-users-resources"
    name = "users"
    resource_config = "users_resource"
    title = _("User management")
    menu_label = _("Users")
    category = _("User management")
    pid_path = "id"
    icon = "users"

    display_search = True
    display_delete = False
    display_edit = False
    display_create = False

    item_field_list = USERS_ITEM_LIST

    search_config_name = "USERS_RESOURCES_SEARCH"
    search_sort_config_name = "USERS_RESOURCES_SORT_OPTIONS"
    search_facets_config_name = "USERS_RESOURCES_SEARCH_FACETS"
    template = "invenio_app_rdm/administration/users_search.html"

    # These actions are not connected on the frontend -
    # TODO: missing permission based links in resource
    actions = {
        "approve": {
            "text": _("Approve"),
            "payload_schema": None,
            "order": 1,
        },
        "restore": {
            "text": _("Restore"),
            "payload_schema": None,
            "order": 2,
        },
        "block": {
            "text": _("Block"),
            "payload_schema": None,
            "order": 2,
        },
        "Deactivate": {
            "text": _("Suspend"),
            "payload_schema": None,
            "order": 2,
        },
    }

    def init_search_config(self):
        """Build search view config."""
        return partial(
            search_app_config,
            config_name=self.get_search_app_name(),
            available_facets=current_app.config.get(self.search_facets_config_name),
            sort_options=current_app.config[self.search_sort_config_name],
            endpoint=self.get_api_endpoint(),
            headers=self.get_search_request_headers(),
            initial_filters=[["is_active", 1]],
            hidden_params=[],
            pagination_options=(20, 50),
            default_size=20,
        )


class UsersDetailView(AdminResourceDetailView):
    """Configuration for users sets detail view."""

    url = "/users/<pid_value>"
    api_endpoint = "/users/"
    search_request_headers = {"Accept": "application/json"}
    extension_name = "invenio-users-resources"
    name = "users_details"
    resource_config = "users_resource"
    title = _("User details")
    list_view_name = "users"
    display_delete = False
    display_edit = True

    pid_path = "id"
    item_field_list = USERS_ITEM_DETAIL
    template = "invenio_app_rdm/administration/users_details.html"


class UsersEditView(AdminResourceEditView):
    """Server rendered view to edit a user's roles."""

    name = "users_edit"
    url = "/users/<pid_value>/edit"
    api_endpoint = "/users"
    resource_config = "users_resource"
    extension_name = "invenio-users-resources"
    template = "invenio_app_rdm/administration/users_edit.html"
    title = _("Edit user roles")
    list_view_name = "users"

    def _identity(self):
        """Resolve the current identity without relying on flask.g."""
        if not current_user.is_authenticated:
            abort(403)
        if not hasattr(self, "_cached_identity"):
            self._cached_identity = get_identity(current_user)
        return self._cached_identity

    def _service(self):
        return current_user_resources.users_service

    def _user_label(self, user):
        profile = user.get("profile") or {}
        return (
            profile.get("full_name")
            or user.get("email")
            or user.get("username")
            or str(user.get("id"))
        )

    def _load_user(self, pid_value):
        try:
            item = self._service().read(id_=pid_value, identity=self._identity())
        except PermissionDeniedError:
            abort(403)
        return item.to_dict()

    def _all_roles(self):
        role_model = current_datastore.role_model
        return list(role_model.query.order_by(role_model.name.asc()).all())

    def _role_choices(self, roles):
        choices = []
        for role in roles:
            if role.description:
                label = f"{role.name} — {role.description}"
            else:
                label = role.name
            choices.append((role.name, label))
        return choices

    def _role_entries(self, roles, selected_names):
        selected = set(selected_names or [])
        return [
            {
                "name": role.name,
                "description": role.description or "",
                "selected": role.name in selected,
            }
            for role in roles
        ]

    def _current_role_names(self, pid_value):
        try:
            groups = self._service().list_groups(
                id_=pid_value, identity=self._identity()
            )
        except PermissionDeniedError:
            abort(403)
        hits = groups.get("hits", {}).get("hits", [])
        return sorted(role.get("name") for role in hits if role.get("name"))

    def _assign_roles(self, pid_value, desired_roles, current_roles=None):
        """Assign roles to a user.

        Note: This method delegates to the service's add_group/remove_group methods
        which should handle permission checks. The service layer is responsible for
        enforcing access control policies.
        """
        current = set(current_roles or self._current_role_names(pid_value))
        desired = set(filter(None, desired_roles or []))
        to_add = sorted(desired - current)
        to_remove = sorted(current - desired)

        for role_name in to_add:
            self._add_role(pid_value, role_name)
        for role_name in to_remove:
            self._remove_role(pid_value, role_name)

        return to_add, to_remove

    def _add_role(self, pid_value, role_name):
        service = self._service()
        if hasattr(service, "add_group"):
            return service.add_group(
                identity=self._identity(), id_=pid_value, group_name=role_name
            )

        user = current_datastore.get_user_by_id(pid_value)
        role = current_datastore.find_role(role_name)
        if user is None or role is None:
            raise ValidationError(_("Unknown role %(role)s.", role=role_name))
        current_datastore.add_role_to_user(user, role)

    def _remove_role(self, pid_value, role_name):
        service = self._service()
        if hasattr(service, "remove_group"):
            return service.remove_group(
                identity=self._identity(), id_=pid_value, group_name=role_name
            )

        user = current_datastore.get_user_by_id(pid_value)
        role = current_datastore.find_role(role_name)
        if user is None or role is None:
            return
        current_datastore.remove_role_from_user(user, role)

    def _build_form(self, roles):
        form = UserRolesForm()
        form.roles.choices = self._role_choices(roles)
        size = max(4, min(10, len(roles) or 4))
        render_kw = {"size": size}
        if not roles:
            render_kw["disabled"] = True
        form.roles.render_kw = render_kw
        form.roles.description = _(
            "Hold Ctrl/Command (or Shift) to select multiple roles. Leave the field empty to remove all roles."
        )
        return form

    def _can_manage_roles(self, pid_value):
        """Check if current user has permission to manage roles for the target user.

        This includes both service-level permission checks and business logic
        to prevent users from modifying their own roles.
        """
        try:
            # Check service-level permissions by attempting to list groups
            self._service().list_groups(id_=pid_value, identity=self._identity())

            # Additional business rule: prevent self-modification of roles
            # This is a view-level safeguard in case the service doesn't enforce it
            if str(current_user.id) == str(pid_value):
                return False

            return True
        except PermissionDeniedError:
            return False

    def _render(self, pid_value, form, user, roles, can_manage=True):
        role_entries = self._role_entries(roles, form.roles.data)
        return self.render(
            form=form,
            user=user,
            user_label=self._user_label(user),
            role_entries=role_entries,
            has_roles=bool(roles),
            can_manage_roles=can_manage,
            detail_url=url_for("administration.users_details", pid_value=pid_value),
            list_endpoint=self.get_list_view_endpoint(),
            title=self.title,
        )

    def get(self, pid_value, **kwargs):
        """Display the roles form."""
        user = self._load_user(pid_value)
        can_manage = self._can_manage_roles(pid_value)
        roles = self._all_roles()
        form = self._build_form(roles)

        # Always load current roles to display correct state, even when disabled
        try:
            form.roles.data = self._current_role_names(pid_value)
        except PermissionDeniedError:
            # If we can't even read the roles, deny management too
            can_manage = False

        return self._render(pid_value, form, user, roles, can_manage=can_manage)

    def post(self, pid_value, **kwargs):
        """Persist updated roles."""
        user = self._load_user(pid_value)
        can_manage = self._can_manage_roles(pid_value)

        # Check permission before processing
        if not can_manage:
            flash(
                _("You do not have permission to manage roles for this user."),
                "error",
            )
            roles = self._all_roles()
            form = self._build_form(roles)
            return self._render(pid_value, form, user, roles, can_manage=can_manage)

        roles = self._all_roles()
        form = self._build_form(roles)
        current_roles = self._current_role_names(pid_value)

        if form.validate_on_submit():
            try:
                self._assign_roles(
                    pid_value, form.roles.data, current_roles=current_roles
                )
            except (ValidationError, PermissionDeniedError) as error:
                flash(
                    _("Could not update roles: %(message)s", message=str(error)),
                    "error",
                )
            else:
                flash(
                    _("Roles updated for %(user)s.", user=self._user_label(user)),
                    "success",
                )
                return redirect(
                    url_for("administration.users_details", pid_value=pid_value)
                )

        return self._render(pid_value, form, user, roles, can_manage=can_manage)


class UsersEditWithUsernameView(UsersEditView):
    """Alias route that includes the username slug in the URL."""

    name = "users_edit_username"
    url = "/users/<pid_value>/<username>/edit"
