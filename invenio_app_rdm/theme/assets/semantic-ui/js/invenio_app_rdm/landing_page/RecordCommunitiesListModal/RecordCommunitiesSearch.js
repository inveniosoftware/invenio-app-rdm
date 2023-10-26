// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// InvenioRDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/invenio_app_rdm/i18next";
import { RecordCommunitiesSearchItem } from "./RecordCommunitiesSearchItem";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { OverridableContext, parametrize } from "react-overridable";
import {
  EmptyResults,
  Error,
  InvenioSearchApi,
  ReactSearchKit,
  ResultsList,
  ResultsLoader,
  SearchBar,
  Pagination,
} from "react-searchkit";
import { Modal } from "semantic-ui-react";

const appName = "InvenioAppRdm.RecordCommunitiesSearch";

export class RecordCommunitiesSearch extends Component {
  handleSuccessCallback = (data) => {
    const { successActionCallback } = this.props;
    successActionCallback(data, i18next.t("Success"));
  };

  render() {
    const { recordCommunityEndpoint, permissions, recordParent, updateRecordCallback } =
      this.props;
    const overriddenComponents = {
      [`${appName}.ResultsList.item`]: parametrize(RecordCommunitiesSearchItem, {
        recordCommunityEndpoint: recordCommunityEndpoint,
        successCallback: this.handleSuccessCallback,
        updateRecordCallback: updateRecordCallback,
        permissions: permissions,
        recordParent: recordParent,
      }),
    };

    const searchApi = new InvenioSearchApi({
      axios: {
        url: recordCommunityEndpoint,
        headers: { Accept: "application/vnd.inveniordm.v1+json" },
      },
    });

    return (
      <OverridableContext.Provider value={overriddenComponents}>
        <ReactSearchKit
          appName={appName}
          urlHandlerApi={{ enabled: false }}
          searchApi={searchApi}
          initialQueryState={{ size: 5, page: 1 }}
        >
          <>
            <Modal.Content>
              <SearchBar
                autofocus
                actionProps={{
                  "icon": "search",
                  "content": null,
                  "className": "search",
                  "aria-label": i18next.t("Search"),
                }}
                placeholder={i18next.t("Search for community...")}
              />
            </Modal.Content>

            <Modal.Content scrolling className="community-list-results">
              <ResultsLoader>
                <EmptyResults />
                <Error />
                <ResultsList />
              </ResultsLoader>
            </Modal.Content>

            <Modal.Content className="text-align-center">
              <Pagination />
            </Modal.Content>
          </>
        </ReactSearchKit>
      </OverridableContext.Provider>
    );
  }
}

RecordCommunitiesSearch.propTypes = {
  recordCommunityEndpoint: PropTypes.string.isRequired,
  successActionCallback: PropTypes.func.isRequired,
  updateRecordCallback: PropTypes.func.isRequired,
  permissions: PropTypes.object.isRequired,
  recordParent: PropTypes.object.isRequired,
};
