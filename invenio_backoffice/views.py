import os
from functools import wraps

import marshmallow_utils
from flask import Blueprint, url_for, render_template, abort
from flask_babelex import lazy_gettext as _
from marshmallow import fields
from marshmallow_utils.fields import SanitizedUnicode

from invenio_backoffice.decorators import expose


def _wrap_view(f):
    # Avoid wrapping view method twice
    if hasattr(f, '_wrapped'):
        return f

    @wraps(f)
    def inner(self, *args, **kwargs):

        # Check if administrative piece is accessible
        abort = self._handle_view(f.__name__, **kwargs)
        if abort is not None:
            return abort

        return self._run_view(f, *args, **kwargs)

    inner._wrapped = True

    return inner


class BackofficeViewMeta(type):
    """
        View metaclass.
        Does some pre-calculations (like getting list of view methods from the class)
        to avoid calculating them for each view class instance.
    """

    def __init__(cls, classname, bases, fields):
        type.__init__(cls, classname, bases, fields)

        # Gather exposed views
        cls._urls = []
        cls._default_view = None
        for p in dir(cls):
            attr = getattr(cls, p)
            # import ipdb;ipdb.set_trace()
            if hasattr(attr, '_urls'):
                # Collect methods
                for url, methods in attr._urls:
                    cls._urls.append((url, p, methods))

                    if url == '/':
                        # adds the default view automatically
                        cls._default_view = p

                # Wrap views
                setattr(cls, p, _wrap_view(attr))


class BackofficeBaseView(metaclass=BackofficeViewMeta):
    name = None

    def __init__(self, name=__name__, category=None, endpoint=None, url=None):

        if self.name is None:
            self.name = name

        self.category = category
        self.endpoint = self._get_endpoint(endpoint)
        self.url = url

        self.blueprint = None
        self.backoffice = None

        # Default view
        if self._default_view is None:
            raise Exception(
                f'Cannot instanciate backoffice view {self.__class__.__name__} '
                f'without a default view')

    def _get_endpoint(self, endpoint=None):
        """
            Generate Flask endpoint name. Defaults to class name if not provided.
        """
        if endpoint:
            return endpoint

        return self.name.lower()

    def _get_view_url(self, backoffice, url):
        """
            Generate URL for the view. Override to change default behavior.
        """
        if url is None:
            if backoffice.url != '/':
                url = '%s/%s' % (backoffice.url, self.endpoint)
            else:
                if self == backoffice.dashboard_view:
                    url = '/'
                else:
                    url = '/%s' % self.endpoint
        else:
            if not url.startswith('/'):
                url = '%s/%s' % (backoffice.url, url)

        return url

    def create_blueprint(self, backoffice):
        """
            Create Flask blueprint.
        """
        # Store admin instance
        self.backoffice = backoffice

        # Generate URL
        self.url = self._get_view_url(backoffice, self.url)

        # If we're working from the root of the site, set prefix to None
        if self.url == '/':
            self.url = None

        # Create blueprint and register rules
        self.blueprint = Blueprint(
            self.endpoint,
            __name__,
            url_prefix=self.url,
            template_folder="templates",
            static_folder="static",
        )
        # import ipdb;ipdb.set_trace()
        for url, name, methods in self._urls:
            self.blueprint.add_url_rule(url,
                                        name,
                                        getattr(self, name),
                                        methods=methods)

        return self.blueprint

    def render(self, template, **kwargs):
        """
            Render template
            :param template:
                Template path to render
            :param kwargs:
                Template arguments
        """
        kwargs['backoffice_base_template'] = self.backoffice.base_template

        return render_template(template, **kwargs)

    def _run_view(self, fn, *args, **kwargs):
        """
            This method will run actual view function.
            While it is similar to _handle_view, can be used to change
            arguments that are passed to the view.
            :param fn:
                View function
            :param kwargs:
                Arguments
        """
        return fn(self, *args, **kwargs)

    def is_accessible(self):
        """
            Override this method to add permission checks.
            Flask-Admin does not make any assumptions about the authentication system used in your application, so it is
            up to you to implement it.
            By default, it will allow access for everyone.
        """
        return True

    def inaccessible_callback(self, name, **kwargs):
        """
            Handle the response to inaccessible views.
            By default, it throw HTTP 403 error. Override this method to
            customize the behaviour.
        """
        return abort(403)

    def _handle_view(self, name, **kwargs):
        """
            This method will be executed before calling any view method.
            It will execute the ``inaccessible_callback`` if the view is not
            accessible.
            :param name:
                View function name
            :param kwargs:
                View function arguments
        """
        if not self.is_accessible():
            return self.inaccessible_callback(name, **kwargs)


class BackofficeDashboardView(BackofficeBaseView):
    """
        Default administrative interface index page when visiting the ``/admin/`` URL.
        It can be overridden by passing your own view class to the ``Admin`` constructor::

            class MyHomeView(BackofficeDashboardView):
                @expose('/')
                def index(self):
                    arg1 = 'Hello'
                    return self.render('mybackoffice/myhome.html', arg1=arg1)
            backoffice = Backoffice(dashboard_view=MyHomeView())
        Also, you can change the root url from /admin to / with the following::
            admin = Admin(
                app,
                dashboard_view=BackofficeDashboardView(
                    name='Home',
                    template='invenio_backoffice/myhome.html',
                    url='/'
                )
            )
        Default values for the index page are:
        * If a name is not provided, 'Home' will be used.
        * If an endpoint is not provided, will default to ``backoffice``
        * Default URL route is ``/backoffice``.
        * Default template is ``invenio_backoffice/index.html``
    """

    def __init__(self, name=None, category=None,
                 endpoint=None, url=None,
                 template='invenio_backoffice/index.html',
                 ):
        super(BackofficeDashboardView, self).__init__(
            name or 'Home',
            category,
            endpoint or 'backoffice',
            '/backoffice' if url is None else url,
        )
        self._template = template

    @expose()
    def index(self):
        return self.render(self._template)


def jsonify_schema(schema):
    schema_dict = {}
    mapping = schema.TYPE_MAPPING

    custom_mapping = {
        fields.Str: str,
        fields.Integer: int,
        marshmallow_utils.fields.SanitizedUnicode: str,
        marshmallow_utils.fields.links.Links: list,
        marshmallow_utils.fields.links.Link: str,
        marshmallow_utils.fields.tzdatetime.TZDateTime: str,
        marshmallow_utils.fields.sanitizedhtml.SanitizedHTML: str,
        fields.List: list,
        fields.Dict: dict,
        fields.Url: str,
    }

    for field, field_type in schema.fields.items():
        field_type_name = field_type.__class__

        if isinstance(field_type, fields.Nested):
            schema_dict[field] = jsonify_schema(field_type.schema)
        elif isinstance(field_type, fields.List):
            # TODO
            pass
        else:
            try:
                schema_dict[field] = list(mapping.keys())[
                    list(mapping.values()).index(field_type_name)]
            except ValueError:
                pass
            try:
                schema_dict[field] = custom_mapping[field_type_name]
            except ValueError:
                raise Exception(f"Unrecognised schema field {field}: {field_type_name}")

    return schema_dict


class BackofficeResourceBaseView(BackofficeBaseView):
    resource = None

    def get_service_schema(self):
        if self.resource is None:
            raise Exception(
                f'Cannot instanciate resource view {self.__class__.__name__} '
                f'without a resource.')
        from flask import current_app
        schema = current_app.extensions[
            "invenio-communities"].communities_resource.service.schema.schema()

        print(schema)

    def jsonify(self):
        pass


class BackofficeResourceDetailView(BackofficeResourceBaseView):
    """Details view based on given config."""

    display_edit = False
    display_delete = False

    actions = None

    item_field_exclude_list = None
    item_field_list = None


class BackofficeResourceListView(BackofficeResourceBaseView):
    """List view based on provided resource."""

    display_create = False

    # decides if there is a detail view
    display_read = True
    display_edit = False
    display_delete = False

    actions = None

    sort_options = None
    available_filters = None
    column_exclude_list = None
    column_list = None

    def init_search_config(self):
        """Build search view config."""


class BackofficeResourceViewSet:
    """View set based on resource.

        Provides a list view and a details view given the provided configuration
    """

    resource = None
    display_create = False

    # decides if there is a detail view
    display_read = True
    display_edit = False
    display_delete = False

    actions = None

    sort_options = ()
    available_filters = None
    column_exclude_list = None
    column_list = None

    item_field_exclude_list = None
    item_field_list = None
