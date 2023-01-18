# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# Invenio App RDM is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

from pathlib import Path

from invenio_access.permissions import system_identity
from invenio_pages.proxies import current_pages_service
from invenio_rdm_records.proxies import current_oaipmh_server_service

from invenio_app_rdm.fixtures import StaticPages
from invenio_app_rdm.fixtures.oai_sets import OAICustomSets


def test_load_oai_sets(app):
    dir_ = Path(__file__).parent
    service = current_oaipmh_server_service
    oai_sets = OAICustomSets(
        [dir_ / "app_data", dir_.parent.parent / "invenio_app_rdm/fixtures/data"],
        "oai_sets.yaml",
    )

    oai_sets.load()

    res_set = service.search(system_identity, params={"q": f"set1"})

    assert res_set.total == 1


def test_load_pages(app):
    dir_ = Path(__file__).parent
    StaticPages(
        [dir_ / "app_data", dir_.parent.parent / "invenio_app_rdm/fixtures/data"],
        "pages.yaml",
        [dir_ / "app_data/pages", dir_ / "pages"],
        force=True,
    ).load()

    pages = current_pages_service.search(system_identity)

    assert pages.total == 1

    assert pages.to_dict()["hits"]["hits"][0]["title"] == "About"
