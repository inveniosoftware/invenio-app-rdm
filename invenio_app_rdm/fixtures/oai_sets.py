# SPDX-FileCopyrightText: 2022 CERN.
# SPDX-License-Identifier: MIT

"""OAI-PMH custom sets."""

from invenio_access.permissions import system_identity
from invenio_rdm_records.fixtures.fixture import FixtureMixin
from invenio_rdm_records.proxies import current_oaipmh_server_service


class OAICustomSets(FixtureMixin):
    """OAI-PMH custom sets."""

    def create(self, entry):
        """Create an OAI set."""
        current_oaipmh_server_service.create(system_identity, entry)
