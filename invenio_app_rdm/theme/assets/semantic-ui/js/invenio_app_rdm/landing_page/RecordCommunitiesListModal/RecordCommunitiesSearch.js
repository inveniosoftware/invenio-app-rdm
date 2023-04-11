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
import { Container } from "semantic-ui-react";

const appName = "InvenioAppRdm.RecordCommunitiesSearch";

export class RecordCommunitiesSearch extends Component {
  handleSuccessCallback = (data) => {
    const { successActionCallback } = this.props;
    successActionCallback(data, i18next.t("Success"));
  };

  render() {
    const { recordCommunityEndpoint } = this.props;
    const overriddenComponents = {
      [`${appName}.ResultsList.item`]: parametrize(RecordCommunitiesSearchItem, {
        recordCommunityEndpoint: recordCommunityEndpoint,
        successCallback: this.handleSuccessCallback,
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
          <Container fluid>
            <Container fluid>
              <SearchBar
                autofocus
                actionProps={{
                  icon: "search",
                  content: null,
                  className: "search",
                }}
                placeholder={i18next.t("Search for community...")}
              />
            </Container>
            <Container className="rel-pt-2 rel-pb-2">
              <ResultsLoader>
                <EmptyResults />
                <Error />
                <ResultsList />
              </ResultsLoader>
            </Container>
            <Container align="center">
              <Pagination />
            </Container>
          </Container>
        </ReactSearchKit>
      </OverridableContext.Provider>
    );
  }
}

RecordCommunitiesSearch.propTypes = {
  recordCommunityEndpoint: PropTypes.string.isRequired,
  successActionCallback: PropTypes.func.isRequired,
};
