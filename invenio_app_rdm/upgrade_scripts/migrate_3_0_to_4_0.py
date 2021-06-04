# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# Invenio-RDM-Records is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 3.0 to 4.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 3.0 to 4.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!
"""

from invenio_db import db
from invenio_rdm_records.records.api import RDMDraft, RDMParent, RDMRecord


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 3.0 to 4.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    """

    def remove_duplicate_languages(record):
        """Remove duplicate languages."""
        if "languages" in record["metadata"]:
            serialized_languages = map(
                tuple,
                map(sorted, map(dict.items, record["metadata"]["languages"])),
            )
            unique_languages = set(serialized_languages)
            languages_list = list(map(dict, unique_languages))
            record["metadata"]["languages"] = languages_list

    def update_vocabularies(record):
        """Updates languages and resource_type to become vocabularies."""

        def get_res_type_vocabulary(data):
            """Returns the id value of the resource type vocabulary."""
            if "subtype" in data["resource_type"]:
                return data["resource_type"]["subtype"]
            elif "type" in data["resource_type"]:
                return data["resource_type"]["type"]

        def get_language_vocabulary(data):
            """Returns the language as vocabulary."""
            return dict(id=data)

        def migrate_language(field):
            """Migrates language field."""
            for idx, val in enumerate(record["metadata"].get(field, [])):
                if "lang" in val:
                    language_vocab = get_language_vocabulary(val["lang"])
                    record["metadata"][field][idx]["lang"] = language_vocab

        # Migrate resource_type
        if "resource_type" in record["metadata"]:
            res_type_vocab = get_res_type_vocabulary(record["metadata"])
            record["metadata"]["resource_type"] = dict(id=res_type_vocab)

        # Migrate resource_type of related_identifiers
        for idx, val in enumerate(
            record["metadata"].get("related_identifiers", [])
        ):
            if "resource_type" in val:
                res_type_vocab = get_res_type_vocabulary(val)
                record["metadata"]["related_identifiers"][idx][
                    "resource_type"
                ] = dict(id=res_type_vocab)

        # Migrate languages from additional_descriptions
        migrate_language("additional_descriptions")
        # Migrate languages from additional_titles
        migrate_language("additional_titles")

        record.commit()

    for record_metadata in RDMRecord.model_cls.query.all():
        record = RDMRecord(record_metadata.data, model=record_metadata)

        remove_duplicate_languages(record)

        # Updating to new $schema when eventually saved
        record.pop("$schema", None)

        # Adding empty pids
        if record.pids is None:
            record.pids = {}

        record.commit()

    for draft_metadata in RDMDraft.model_cls.query.all():
        # Skipping deleted drafts because can't be committed
        if draft_metadata.is_deleted:
            continue

        draft = RDMDraft(draft_metadata.data, model=draft_metadata)

        remove_duplicate_languages(draft)

        # Updating to new $schema when eventually saved
        draft.pop("$schema", None)

        # Adding empty pids
        if draft.pids is None:
            draft.pids = {}

        draft.commit()

    db.session.commit()

    # Need to loop again to update the resource type once the scheme is updated
    for record_metadata in RDMRecord.model_cls.query.all():
        record = RDMRecord(record_metadata.data, model=record_metadata)

        update_vocabularies(record)

    for draft_metadata in RDMDraft.model_cls.query.all():
        # Skipping deleted drafts because can't be committed
        if draft_metadata.is_deleted:
            continue

        draft = RDMDraft(draft_metadata.data, model=draft_metadata)

        update_vocabularies(draft)

    for parent_metadata in RDMParent.model_cls.query.all():
        parent = RDMParent(parent_metadata.data, model=parent_metadata)

        # Updating to new $schema when eventually saved
        parent.pop("$schema", None)

        parent.commit()

    db.session.commit()


if __name__ == "__main__":
    execute_upgrade()
