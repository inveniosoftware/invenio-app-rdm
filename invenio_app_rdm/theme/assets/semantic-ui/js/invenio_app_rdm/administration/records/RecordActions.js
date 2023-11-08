/*
 * This file is part of Invenio.
 * Copyright (C) 2023 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import React from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { Actions } from "@js/invenio_administration";
import { SetQuotaAction } from "../components/SetQuotaAction";

export const RecordActions = ({
  title,
  resourceName,
  record,
  displayEdit,
  displayDelete,
  actions,
  idKeyPath,
  listUIEndpoint,
  successCallback,
  displayQuota,
  editUrl,
}) => {
  return (
    <>
      <Actions
        title={title}
        resourceName={resourceName}
        editUrl={editUrl}
        displayEdit={displayEdit}
        displayDelete={displayDelete}
        actions={actions}
        resource={record}
        idKeyPath={idKeyPath}
        successCallback={successCallback}
        listUIEndpoint={listUIEndpoint}
      />
      {displayQuota && (
        <SetQuotaAction
          headerText={i18next.t("Set quota for record {{recordId}}", {
            recordId: record.id,
          })}
          successCallback={successCallback}
          apiUrl={`/api/records/${record.id}/quota`}
          resource={record}
          isRecord
        />
      )}
    </>
  );
};

RecordActions.propTypes = {
  successCallback: PropTypes.func.isRequired,
  record: PropTypes.string.isRequired,
  idKeyPath: PropTypes.string.isRequired,
  listUIEndpoint: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  resourceName: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  editUrl: PropTypes.string.isRequired,
  displayQuota: PropTypes.bool,
  displayEdit: PropTypes.bool,
  displayDelete: PropTypes.bool,
};

RecordActions.defaultProps = {
  displayQuota: false,
  displayEdit: false,
  displayDelete: false,
};
