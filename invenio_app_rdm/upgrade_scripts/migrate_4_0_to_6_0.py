# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# Invenio-RDM-Records is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Record migration script from InvenioRDM 4.0 to 6.0.

Disclaimer: This script is intended to be executed *only once*, namely when
upgrading from InvenioRDM 4.0 to 6.0!
If this script is executed at any other time, probably the best case scenario
is that nothing happens!
"""

import yaml
from flask import current_app
from invenio_access.permissions import system_identity
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier
from invenio_rdm_records.records.api import RDMDraft, RDMRecord
from invenio_vocabularies.records.api import Vocabulary
from invenio_vocabularies.records.models import VocabularyScheme, VocabularyType
from sqlalchemy.orm.exc import NoResultFound


def migrate_vocabularies():
    """Migrate old vocabularies."""
    print("Migrating old vocabularies...")
    # remove resource types
    try:
        # DO NOT DO THIS KIND OF QUERY FOR LARGE SETS
        rsrcts = PersistentIdentifier.query.filter_by(pid_type="rsrct")
        for rsrct in rsrcts:
            Vocabulary.get_record(id_=rsrct.object_uuid).delete(force=True)
        rsrcts.delete()  # delete from pidstore
        db.session.commit()
        print("resource_types vocabularies removed: OK.")
    except NoResultFound:
        print("No resource_types vocabularies found: OK.")
    try:
        rsrct = VocabularyType.query.filter_by(id="resource_types").one()
        db.session.delete(rsrct)
        db.session.commit()
        print("resource_types vocabulary type removed: OK.")
    except NoResultFound:
        print("No resource_types vocabulary found: OK.")

    # remove old affiliations
    try:
        schemes = VocabularyScheme.query.filter_by(parent_id="affiliations").all()
        for scheme in schemes:
            db.session.delete(scheme)
        db.session.commit()
        print("Affiliations schemes removed: OK.")
    except NoResultFound:
        print("No affiliations scheme not found: OK.")
    try:
        db.session.delete(VocabularyType.query.filter_by(id="affiliations").one())
        db.session.commit()
        print("Affiliations vocabulary type removed: OK.")
    except NoResultFound:
        print("No parent affiliations not found: OK.")

    print("Old vocabularies migrated.")


def check_affiliations():
    """Checks the migration readiness of creatibutor affiliations."""

    def _should_be_vocabulary(creatibutors, total, needs_ror):
        """Checks the schema of the affiliation.

        If an affiliation has identifiers but no ROR, it is not valid.
        """
        vocab_affs = []
        for creatibutor in creatibutors:
            affiliations = creatibutor.get("affiliations", [])
            for aff in affiliations:
                ids = aff.get("identifiers", [])
                ror = None
                for id_ in ids:
                    if id_.get("scheme") == "ror":
                        needs_ror = needs_ror or True
                        ror = id_["identifier"]
                        break
                if not ror and ids:
                    total += 1
                    vocab_affs.append(aff["name"])

        return vocab_affs, total, needs_ror

    print("Checking for affiliations migration readiness...")
    invalid_affiliations_rec, total, needs_ror = {}, 0, False

    for record_metadata in RDMRecord.model_cls.query.all():
        record = RDMRecord(record_metadata.data, model=record_metadata)
        # publish record subjects take presedence if id is repeated
        # | operator is only available from py 3.9 on
        inv_affs_creators, total, needs_ror = _should_be_vocabulary(
            record.get("metadata").get("creators", []), total, needs_ror
        )
        inv_affs_contributors, total, needs_ror = _should_be_vocabulary(
            record.get("metadata").get("contributors", []), total, needs_ror
        )

        if inv_affs_creators or inv_affs_contributors:
            invalid_affiliations_rec[record["id"]] = {
                "creators": inv_affs_creators,
                "contributors": inv_affs_contributors,
            }

    invalid_affiliations_draft = {}
    for draft_metadata in RDMDraft.model_cls.query.all():
        # Skipping deleted drafts because can't be committed
        if draft_metadata.is_deleted:
            continue

        draft = RDMDraft(draft_metadata.data, model=draft_metadata)
        inv_affs_creators, total, needs_ror = _should_be_vocabulary(
            draft.get("metadata").get("creators", []), total, needs_ror
        )
        inv_affs_contributors, total, needs_ror = _should_be_vocabulary(
            draft.get("metadata").get("contributors", []), total, needs_ror
        )
        if inv_affs_creators or inv_affs_contributors:
            invalid_affiliations_draft[draft["id"]] = {
                "type": "draft",
                "creators": inv_affs_creators,
                "contributors": inv_affs_contributors,
            }

    invalid_affiliations = {}
    if invalid_affiliations_rec:
        invalid_affiliations["record"] = invalid_affiliations_rec
    if invalid_affiliations_draft:
        invalid_affiliations["draft"] = invalid_affiliations_draft

    if invalid_affiliations:
        print(
            f"Your instance has {total} affiliations that need to be "
            + "fixed. Check the invalid_affiliation.yaml file for more details."
        )
        with open("invalid_affiliations.yaml", "w") as f:
            yaml.dump(list(invalid_affiliations), f)
    else:
        print(f"All your instance's affiliations are valid.")
    if needs_ror:
        print(
            "You have affiliations with ROR identifiers, you need to "
            + "add its vocabulary. Instructions to do so are available in "
            "https://inveniordm.docs.cern.ch/customize/vocabularies/affiliations/"  # noqa
        )


def check_subjects():
    """Checks the migration readiness of subjects."""

    def _should_be_vocabulary(record):
        """Checks the schema of the subject."""
        subjects = record.get("metadata").get("subjects", [])
        vocab_subjects = {}

        for subject in subjects:
            id_ = subject.get("identifier")
            if id_:
                vocab_subjects[id_] = {
                    "id": id_,
                    "scheme": subject["scheme"],
                    "subject": subject["subject"],
                }

        return vocab_subjects

    print("Checking for subject migration readiness...")
    subjects_to_dump = {}
    for draft_metadata in RDMDraft.model_cls.query.all():
        # Skipping deleted drafts because can't be committed
        if draft_metadata.is_deleted:
            continue

        draft = RDMDraft(draft_metadata.data, model=draft_metadata)
        subjects_to_dump = _should_be_vocabulary(draft)

    for record_metadata in RDMRecord.model_cls.query.all():
        record = RDMRecord(record_metadata.data, model=record_metadata)
        # publish record subjects take presedence if id is repeated
        # | operator is only available from py 3.9 on
        subjects_to_dump = {**subjects_to_dump, **_should_be_vocabulary(record)}

    total = len(subjects_to_dump)
    if subjects_to_dump:
        print(
            f"Your instance has {total} subjects that "
            + "should be custom vocabularies."
        )
        with open("custom_subjects.yaml", "w") as f:
            yaml.dump(list(subjects_to_dump.values()), f)
    else:
        print(f"All your instance's subjects are valid.")


def execute_upgrade():
    """Execute the upgrade from InvenioRDM 4.0 to 5.0.

    Please read the disclaimer on this module before thinking about executing
    this function!
    """

    def update_roles(creatibutors):
        """Update roles."""
        for creatibutor in creatibutors:
            role = creatibutor.get("role")
            if role:
                creatibutor["role"] = {"id": role}

        return creatibutors

    def update_creators_roles(record):
        """Update creator roles."""
        creators = record.get("metadata").get("creators", [])
        if creators:
            record["metadata"]["creators"] = update_roles(creators)

    def update_contributors_roles(record):
        """Update contributors roles."""
        contributors = record.get("metadata").get("contributors", [])
        if contributors:
            record["metadata"]["contributors"] = update_roles(contributors)

    def update_additional_titles(record):
        """Update additional titles type."""
        add_titles = record.get("metadata").get("additional_titles", [])
        for add_title in add_titles:
            type_ = add_title.get("type")
            # any other type either stays with the previous value or is not
            # supported and should fail
            if type_ == "alternativetitle":
                add_title["type"] = {"id": "alternative-title"}
            elif type_ == "translatedtitle":
                add_title["type"] = {"id": "translated-title"}
            else:
                add_title["type"] = {"id": type_}

            lang = add_title.get("lang")
            if lang:
                add_title["lang"] = {"id": lang}

    def update_additional_descriptions(record):
        """Update additional descriptions type."""
        metadata = record.get("metadata")
        add_descriptions = metadata.get("additional_descriptions", [])
        for add_desc in add_descriptions:
            type_ = add_desc.get("type")
            # any other type either stays with the previous value or is not
            # supported and should fail
            if type_ == "seriesinformation":
                add_desc["type"] = {"id": "series-information"}
            elif type_ == "tableofcontents":
                add_desc["type"] = {"id": "table-of-contentse"}
            elif type_ == "technicalinfo":
                add_desc["type"] = {"id": "technical-info"}
            else:
                add_desc["type"] = {"id": type_}

            lang = add_desc.get("lang")
            if lang:
                add_desc["lang"] = {"id": lang}

    def update_list_field_vocabulary(record, parent, field):
        """Update related identifiers relation type."""
        obj_list = record.get("metadata").get(parent, [])
        for obj in obj_list:
            obj[field] = {"id": obj[field]}

    def update_subjects(record):
        """Updates subjects and keywords."""
        subjects = record.get("metadata").get("subjects", [])
        vocab_subjects = []
        vocab_subjects_ids = []

        for subject in subjects:
            id_ = subject.get("identifier")
            if id_:
                if id_ not in vocab_subjects_ids:
                    vocab_subjects.append({"id": id_})
                    vocab_subjects_ids.append(id_)
            else:
                vocab_subjects.append({"subject": subject["subject"]})

        if vocab_subjects:
            record["metadata"]["subjects"] = vocab_subjects

    def update_affiliations(creatibutors):
        """Updates subjects and keywords."""
        for idx, creatibutor in enumerate(creatibutors):
            affiliations = creatibutor.get("affiliations", [])
            vocab_affs = []
            for aff in affiliations:
                ids = aff.get("identifiers", [])
                ror = None
                for id_ in ids:
                    if id_.get("scheme") == "ror":
                        ror = id_["identifier"]
                        break
                if ror:
                    vocab_affs.append({"id": ror, "name": aff["name"]})
                else:
                    vocab_affs.append({"name": aff["name"]})

            if vocab_affs:
                creatibutors[idx]["affiliations"] = vocab_affs

        return creatibutors

    def update_creators_affiliations(record):
        """Update creator roles."""
        creators = record.get("metadata").get("creators", [])
        if creators:
            record["metadata"]["creators"] = update_affiliations(creators)

    def update_contributors_affiliations(record):
        """Update contributors roles."""
        contributors = record.get("metadata").get("contributors", [])
        if contributors:
            record["metadata"]["contributors"] = update_affiliations(contributors)

    def update_rights(record):
        """Update record rights."""
        rights = record.get("metadata").get("rights", [])
        for right in rights:
            locale = current_app.config.get("BABEL_DEFAULT_LOCALE", "en")
            right["title"] = {locale: right["title"]}
            right["description"] = {locale: right["description"]}

    def migrate_record(record):
        """Migrates a record/draft to the new schema's values."""
        # Force the new jsonschema
        record["$schema"] = "local://records/record-v4.0.0.json"
        update_creators_roles(record)
        update_contributors_roles(record)
        update_additional_titles(record)
        update_additional_descriptions(record)
        update_list_field_vocabulary(record, "related_identifiers", "relation_type")
        update_list_field_vocabulary(record, "dates", "type")
        update_subjects(record)
        update_creators_affiliations(record)
        update_contributors_affiliations(record)
        update_rights(record)

        return record

    print("Migrating records...")
    for record_metadata in RDMRecord.model_cls.query.all():
        record = RDMRecord(record_metadata.data, model=record_metadata)
        record = migrate_record(record)
        record.commit()

    print("Migrating drafts...")
    for draft_metadata in RDMDraft.model_cls.query.all():
        # Skipping deleted drafts because can't be committed
        if draft_metadata.is_deleted:
            continue

        draft = RDMDraft(draft_metadata.data, model=draft_metadata)
        migrate_record(draft)
        draft.commit()

    db.session.commit()
    print("Records and drafts migrated.")


if __name__ == "__main__":
    print(
        "Choose a step:\n"
        + "[1] Migrate old vocabularies\n"
        + "[2] Check record's subjects\n"
        + "[3] Check creators/contributors affiliations\n"
        + "[4] Migrate records\n"
        + ">> ",
        end="",
    )
    try:
        choice = int(input())
        if choice == 1:
            migrate_vocabularies()
        elif choice == 2:
            check_subjects()
        elif choice == 3:
            check_affiliations()
        elif choice == 4:
            execute_upgrade()
        else:
            raise ValueError
    except ValueError:
        print("Invalid value, choose one of 1, 2, 3 or 4.")
