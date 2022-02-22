/*
 * This file is part of Invenio.
 * Copyright (C) 2020-2021 CERN.
 * Copyright (C) 2020-2021 Northwestern University.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { SearchApp } from "@js/invenio_search_ui/components";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import _camelCase from "lodash/camelCase";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { overrideStore } from "react-overridable";
import { Container, Tab } from "semantic-ui-react";
import { defaultComponents as CommunitiesDefaultComponents } from "./components/communities";
import { defaultComponents as UploadsDefaultComponents } from "./components/uploads";
import { defaultComponents as RequestsDefaultComponents } from "./components/requests";

const rootElement = document.getElementById("invenio-user-dashboard");

const TAB_PANES = [
  {
    configDataAttribute: "invenio-search-user-uploads-config",
    label: i18next.t("Uploads"),
    pathname: "uploads",
  },
  {
    configDataAttribute: "invenio-search-user-communities-config",
    label: i18next.t("Communities"),
    pathname: "communities",
  },
  {
    configDataAttribute: "invenio-search-user-requests-config",
    label: i18next.t("Requests"),
    pathname: "requests",
  },
];

const replaceURLPathname = (newPathname) =>
  window.history.replaceState({}, "", newPathname);

class DashboardTabs extends Component {
  constructor(props) {
    super(props);
    const activeTabName = rootElement.dataset[_camelCase("active-tab-name")];
    const routes = TAB_PANES.map((pane) => pane.pathname);
    this.state = {
      defaultActiveTab: routes.indexOf(activeTabName),
    };

    // replace URL with the first pathname when not defined
    if (window.location.pathname.endsWith("/" + activeTabName) === false) {
      replaceURLPathname(window.location.pathname + "/" + activeTabName);
    }

    for (const [componentId, component] of Object.entries({
      ...UploadsDefaultComponents,
      ...CommunitiesDefaultComponents,
      ...RequestsDefaultComponents,
    })) {
      overrideStore.add(componentId, component);
    }

    this.panes = TAB_PANES.map((pane, index) => {
      const { appId, ...config } = JSON.parse(
        rootElement.dataset[_camelCase(pane.configDataAttribute)]
      );
      return {
        menuItem: pane.label,
        render: () => (
          <Tab.Pane>
            <SearchApp appName={appId} key={appId} config={config} />
          </Tab.Pane>
        ),
      };
    });
  }

  onTabChange = (e, data) => {
    const activePane = TAB_PANES[data.activeIndex];
    replaceURLPathname(activePane.pathname);
  };

  render() {
    return (
      <Container>
        <Tab
          defaultActiveIndex={this.state.defaultActiveTab}
          panes={this.panes}
          onTabChange={this.onTabChange}
          renderActiveOnly={true}
        />
      </Container>
    );
  }
}

ReactDOM.render(<DashboardTabs />, rootElement);
