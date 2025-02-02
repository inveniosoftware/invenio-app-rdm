from invenio_app_rdm.records_ui.views.filters import get_scheme_label, namespace_url


def test_get_scheme_label(app):
    # just test a couple of schemes
    assert "PMID" == get_scheme_label("pmid")

    assert "arXiv" == get_scheme_label("arxiv")

    assert "Bibcode" == get_scheme_label("ads")


def test_namespace_url(app):
    """Test namespace URL filters."""
    assert namespace_url("no_namespaced_field") is None
    assert namespace_url("empty:field_name") is None
    assert namespace_url("test:field_name") == "https://example.com/terms/#field_name"
