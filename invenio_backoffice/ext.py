# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2016-2021 CERN.
# Copyright (C) 2022 Northwestern University.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.

"""Invenio backoffice extension."""
import importlib_metadata

from . import config
from .backoffice import Backoffice


class InvenioBackoffice(object):
    """Invenio extension."""

    def __init__(self, app=None, entry_point_group="invenio_backoffice.views"):
        """Extension initialization."""
        self.entry_point_group = entry_point_group

        self.backoffice = None
        if app:
            self.init_app(app)

    def init_app(self, app):
        self.init_config(app)
        self.backoffice = Backoffice(app, name=app.config["BACKOFFICE_APPNAME"])
        if self.entry_point_group:
            self.load_entry_point_group()
        app.extensions["invenio-backoffice"] = self

    def load_entry_point_group(self):
        """Load backoffice interface views from entry point group."""
        for ep in set(importlib_metadata.entry_points(group=self.entry_point_group)):
            backoffice_ep = ep.load()
            #import ipdb;ipdb.set_trace()
            self.register_view(backoffice_ep)

    def register_view(self, view_class, *args, **kwargs):
        """Register an admin view on this admin instance.
        :param view_class: The view class name passed to the view factory.
        :param args: Positional arguments for view class.
        :param kwargs: Keyword arguments to view class.
        """
        view_instance = view_class(*args, **kwargs)
        if "endpoint" not in kwargs:
            kwargs["endpoint"] = view_instance.endpoint
        self.backoffice.add_view(view_instance, *args, **kwargs)

    @staticmethod
    def init_config(app):
        """Initialize configuration.
        :param app: The Flask application.
        """
        # Set default configuration
        for k in dir(config):
            if k.startswith("BACKOFFICE_"):
                app.config.setdefault(k, getattr(config, k))
