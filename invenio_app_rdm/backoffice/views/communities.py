from invenio_backoffice.decorators import expose
from invenio_backoffice.views import BackofficeBaseView, BackofficeResourceBaseView
from invenio_communities.communities.resources.resource import CommunityResource


class CommunitiesBackoffice(BackofficeResourceBaseView):

    name = "communities"
    category = "communities"
    template = 'invenio_backoffice/communities_index.html'
    resource = "communities_resource"

    @expose()
    def index(self):
        self.get_service_schema()
        return self.render(self.template)

