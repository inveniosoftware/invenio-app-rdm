from invenio_backoffice.views import BackofficeDashboardView


class Backoffice:
    """Backoffice views core manager."""

    def __init__(self, app=None, name=None, url=None, dashboard_view=None,
                 ui_endpoint=None, base_template=None):
        """Constructor.

        :param app: flask application
        :param name: application name, defaults to "Backoffice"
        :param url: base backoffice url to register the dashboard view and subviews
        :param dashboard_view: home page view
        :param ui_endpoint: base UI endpoint,
                         leaves flexibility to implement two different backoffice apps,
                         or to provide custom endpoint.
        :param base_template: base backoffice template. Defaults to "backoffice/base.html"
        """
        super().__init__()

        self.app = app

        self._views = []
        self._menu = []
        self._menu_categories = dict()
        self._menu_links = []

        if name is None:
            name = 'Backoffice'
        self.name = name

        self.dashboard_view = dashboard_view or BackofficeDashboardView(
            endpoint=ui_endpoint, url=url)
        # self.ui_endpoint = ui_endpoint or self.dashboard_view.endpoint
        self.ui_endpoint = ui_endpoint or "backoffice"
        self.url = url or self.dashboard_view.url
        self.url = url or "/backoffice"
        self.base_template = base_template or "invenio_backoffice/base.html"

        if self.dashboard_view is not None:

            self._add_dashboard_view(
                dashboard_view=self.dashboard_view,
                endpoint=ui_endpoint,
                url=url
            )
        # import ipdb;ipdb.set_trace()
        # if app is not None:
        #     self._init_extension()

    def _init_extension(self):
        if not hasattr(self.app, 'extensions'):
            self.app.extensions = dict()

        backoffice_apps = self.app.extensions.get('invenio-backoffice', [])

        for p in backoffice_apps:
            if p.ui_endpoint == self.ui_endpoint:
                raise Exception('Cannot have two Backoffice app instances with same'
                                ' endpoint name.')

            if p.url == self.url:
                raise Exception("Cannot assign two Backoffice app instances with same"
                                ' URL')

        backoffice_apps.append(self)
        self.app.extensions['invenio-backoffice'] = backoffice_apps

    def add_view(self, view, *args, **kwargs):
        """
            Add a view to the collection.
            :param view:
                View to add.
        """
        # Add to views
        self._views.append(view)

        # If app was provided in constructor, register view with Flask app
        if self.app is not None:
            self.app.register_blueprint(view.create_blueprint(self))

        # self._add_view_to_menu(view)

    def add_views(self, *args):
        """Add multiple views."""
        for view in args:
            self.add_view(view)

    def init_app(self, app, dashboard_view=None,
                 endpoint=None, url=None):
        """
            Register all views with the Flask application.
            :param app: Flask application instance
        """
        self.app = app

        self._init_extension()

        # # Register Index view
        if dashboard_view is not None:
            self._add_dashboard_view(
                dashboard_view=dashboard_view,
                endpoint=endpoint,
                url=url
            )

        # Register views
        for view in self._views:
            app.register_blueprint(view.create_blueprint(self))

    def _add_dashboard_view(self, dashboard_view=None,
                            endpoint=None, url=None):
        """
            Add the admin index view.
          :param index_view:
               Home page view to use. Defaults to `AdminIndexView`.
           :param url:
               Base URL
          :param endpoint:
               Base endpoint name for index view. If you use multiple instances of the `Admin` class with
               a single Flask application, you have to set a unique endpoint name for each instance.
        """
        from invenio_backoffice.views import BackofficeDashboardView
        self.dashboard_view = dashboard_view or BackofficeDashboardView(
            endpoint=endpoint, url=url)
        self.endpoint = endpoint or self.dashboard_view.endpoint
        self.url = url or self.dashboard_view.url

        # Add predefined index view
        # assume index view is always the first element of views.
        if len(self._views) > 0:
            self._views[0] = self.dashboard_view
            ## TODO menus
            # self._menu[0] = MenuView(self.dashboard_view.name, self.index_view)
        else:
            self.add_view(self.dashboard_view)
