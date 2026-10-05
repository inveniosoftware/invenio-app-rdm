# SPDX-FileCopyrightText: 2026 CERN.
# SPDX-License-Identifier: MIT

"""Test the sandboxing of file previews."""

from html.parser import HTMLParser

import pytest
from flask import render_template_string, url_for


@pytest.fixture()
def txt_sandbox(app, monkeypatch):
    """Set whether the text previewer supports sandboxing."""
    # the module reads the app's config when imported
    with app.app_context():
        from invenio_previewer.extensions import txt

    def _set(sandbox):
        monkeypatch.setattr(txt, "sandbox", sandbox, raising=False)

    return _set


class PreviewElementsParser(HTMLParser):
    """Collect the attributes of the preview iframe and preview links."""

    def __init__(self):
        """Initialize the parser."""
        super().__init__()
        self.iframe = None
        self.links = []

    def handle_starttag(self, tag, attrs):
        """Store the preview iframe and preview links attributes."""
        attrs = dict(attrs)
        if tag == "iframe" and attrs.get("id") == "preview-iframe":
            self.iframe = attrs
        elif "preview-link" in (attrs.get("class") or "").split():
            self.links.append(attrs)


def get_preview(client, record):
    """Request the preview of the record's text file."""
    return client.get(
        url_for(
            "invenio_app_rdm_records.record_file_preview",
            pid_value=record.id,
            filename="article.txt",
        )
    )


def test_preview_sandboxed(app, client, record_with_file, txt_sandbox):
    """Test that previews of sandboxable previewers are sandboxed."""
    txt_sandbox(True)

    res = get_preview(client, record_with_file)

    assert res.status_code == 200
    policy = res.headers["Content-Security-Policy"]
    assert f"sandbox {app.config['PREVIEWER_SANDBOX']}" in policy
    # the application's own policy is kept
    assert policy.startswith("default-src")
    # other Talisman headers are still set
    assert "X-Frame-Options" in res.headers


def test_preview_not_sandboxed(client, record_with_file, txt_sandbox):
    """Test that previews of other previewers are not sandboxed."""
    txt_sandbox(False)

    res = get_preview(client, record_with_file)

    assert res.status_code == 200
    assert "sandbox" not in res.headers.get("Content-Security-Policy", "")


def test_preview_sandbox_disabled(
    app, client, record_with_file, txt_sandbox, monkeypatch
):
    """Test that sandboxing can be disabled."""
    txt_sandbox(True)
    monkeypatch.setitem(app.config, "PREVIEWER_SANDBOX", None)

    res = get_preview(client, record_with_file)

    assert res.status_code == 200
    assert "sandbox" not in res.headers.get("Content-Security-Policy", "")


def test_landing_page_preview_iframe_sandbox(
    app, client, record_with_file, txt_sandbox
):
    """Test that the preview iframe and links carry the sandbox."""
    txt_sandbox(True)
    sandbox = app.config["PREVIEWER_SANDBOX"]

    res = client.get(f"/records/{record_with_file.id}")

    assert res.status_code == 200
    parser = PreviewElementsParser()
    parser.feed(res.get_data(as_text=True))
    assert parser.iframe["sandbox"] == sandbox
    assert [link["data-sandbox"] for link in parser.links] == [sandbox]


def test_landing_page_preview_iframe_not_sandboxed(
    client, record_with_file, txt_sandbox
):
    """Test that the preview iframe has no sandbox for other previewers."""
    txt_sandbox(False)

    res = client.get(f"/records/{record_with_file.id}")

    assert res.status_code == 200
    parser = PreviewElementsParser()
    parser.feed(res.get_data(as_text=True))
    assert "sandbox" not in parser.iframe
    assert [link["data-sandbox"] for link in parser.links] == [""]


@pytest.mark.parametrize(
    "file, sandboxed",
    [
        ({"key": "article.txt"}, True),
        ({"key": "ARTICLE.TXT"}, True),
        ({"key": "article.pdf"}, False),
        ({"key": "article.txt", "metadata": None}, True),
        # the previewer set in the file's metadata takes precedence
        ({"key": "article.pdf", "metadata": {"previewer": "txt"}}, True),
        ({"key": "article.txt", "metadata": {"previewer": "pdfjs"}}, False),
    ],
)
def test_preview_iframe_sandbox_from_file(app, txt_sandbox, file, sandboxed):
    """Test the iframe sandbox for RDM files, as the files macros compute it."""
    txt_sandbox(True)
    # same two lines as in records/macros/files.html
    template = """
        {%- set previewer_name = (file.metadata or {}).get("previewer") -%}
        {{- previewer_iframe_sandbox(file.key, previewer_name) -}}
    """

    with app.test_request_context():
        expected = app.config["PREVIEWER_SANDBOX"] if sandboxed else ""
        assert render_template_string(template, file=file) == expected
