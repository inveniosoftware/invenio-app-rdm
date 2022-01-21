/*
 * This file is part of Invenio.
 * Copyright (C) 2020-2021 CERN.
 * Copyright (C) 2020-2021 Northwestern University.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { SearchApp } from "@js/invenio_search_ui/components";
import _camelCase from "lodash/camelCase";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { overrideStore } from "react-overridable";
import { Container, Tab } from "semantic-ui-react";
// import { defaultComponents as CommunitiesDefaultComponents } from "./components/communities";
import { defaultComponents as UploadsDefaultComponents } from "./components/uploads";
// import { defaultComponents as RequestsDefaultComponents } from "./components/requests";

const rootElement = document.getElementById("invenio-user-dashboard");

const TAB_PANES = [
  {
    configDataAttribute: "invenio-search-user-uploads-config",
    label: "Uploads",
    pathname: "uploads",
  },
  // {
  //   configDataAttribute: "invenio-search-user-communities-config",
  //   label: "Communities",
  //   pathname: "communities",
  // },
  // {
  //   configDataAttribute: "invenio-search-user-requests-config",
  //   label: "Requests",
  //   pathname: "requests",
  // },
];

const replaceURLPathname = (newPathname) =>
  window.history.replaceState({}, "", newPathname);

class DashboardTabs extends Component {
  constructor(props) {
    super(props);

    // replace URL with the first pathname when not defined
    const activeTabName = rootElement.dataset[_camelCase("active-tab-name")];
    if (window.location.pathname.endsWith("/" + activeTabName) === false) {
      replaceURLPathname(window.location.pathname + "/" + activeTabName);
    }

    for (const [componentId, component] of Object.entries({
      ...UploadsDefaultComponents,
      // ...CommunitiesDefaultComponents,
      // ...RequestsDefaultComponents,
    })) {
      overrideStore.add(componentId, component);
    }

    this.panes = TAB_PANES.map((pane, index) => {
      return {
        menuItem: pane.label,
        render: () => (
          <Tab.Pane>
            <SearchApp
              key={index}
              config={JSON.parse(
                rootElement.dataset[_camelCase(pane.configDataAttribute)]
              )}
            />
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
          panes={this.panes}
          onTabChange={this.onTabChange}
          renderActiveOnly={true}
        />
      </Container>
    );
  }
}

ReactDOM.render(<DashboardTabs />, rootElement);
