from invenio_app_rdm.records_ui.views.filters import get_scheme_label


def test_get_scheme_label(app):
    # just test a couple of schemes
    assert 'PMID' == get_scheme_label('pmid')

    assert 'arXiv' == get_scheme_label('arxiv')

    assert 'Bibcode' == get_scheme_label('bibcode')
