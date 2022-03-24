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
import _lowerCase from "lodash/lowerCase";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { overrideStore } from "react-overridable";
import { Container, Segment, Menu } from "semantic-ui-react";
import { defaultComponents as CommunitiesDefaultComponents } from "./components/communities";
import { defaultComponents as UploadsDefaultComponents } from "./components/uploads";
import { defaultComponents as RequestsDefaultComponents } from "./components/requests";

const rootElement = document.getElementById("invenio-user-dashboard");
const getConfigFromDataAttribute = (_, attr) => {
  const dataValue = rootElement.dataset[attr];
  return JSON.parse(dataValue);
};

const replaceURLPathname = (newPathname) =>
  window.history.replaceState({}, "", `/me/${newPathname}`);

const MENU_ITEMS = {
  uploads: {
    configDataAttribute: "invenio-search-user-uploads-config",
    label: i18next.t("Uploads"),
  },
  communities: {
    configDataAttribute: "invenio-search-user-communities-config",
    label: i18next.t("Communities"),
  },
  requests: {
    configDataAttribute: "invenio-search-user-requests-config",
    label: i18next.t("Requests"),
  },
};

class DashboardMenu extends Component {
  constructor(props) {
    super(props);
    const activeMenuName = getConfigFromDataAttribute(
      rootElement,
      _camelCase("active-menu-element")
    );

    const activeMenuElement = activeMenuName;
    this.state = {
      currentActiveMenuElement: activeMenuElement,
    };
    // replace URL with the first pathname when not defined
    if (window.location.pathname.endsWith(`/${activeMenuName}`) === false) {
      replaceURLPathname(activeMenuName);
    }

    for (const [componentId, component] of Object.entries({
      ...UploadsDefaultComponents,
      ...CommunitiesDefaultComponents,
      ...RequestsDefaultComponents,
    })) {
      overrideStore.add(componentId, component);
    }

    this.menuItems = {};
    for (const [key, menuItem] of Object.entries(MENU_ITEMS)) {
      const { appId, ...config } = getConfigFromDataAttribute(
        rootElement,
        _camelCase(menuItem.configDataAttribute)
      );
      this.menuItems[key] = {
        menuLabel: menuItem.label,
        appId: appId,
        config: config,
      };
    }
  }

  handleItemClick = (e, { name }) => {
    const activeMenuElement = _lowerCase(name);
    this.setState({
      currentActiveMenuElement: activeMenuElement,
    });
    replaceURLPathname(_lowerCase(name));
  };

  render() {
    const { currentActiveMenuElement } = this.state;
    const items = this.menuItems;

    const activeContent = items[currentActiveMenuElement];
    const menus = Object.entries(items).map(([key, value]) => {
      const { menuLabel } = value;
      return (
        <Menu.Item
          name={menuLabel}
          key={key}
          active={key === currentActiveMenuElement}
          onClick={this.handleItemClick}
        />
      );
    });

    return (
      <>
        <Container
          id="dashboard-menu-container"
          fluid
          className="page-subheader-outer with-submenu rel-pt-2"
        >
          <Container id="dashboard-menu">
            <Menu pointing secondary className="page-subheader">
              {menus}
            </Menu>
          </Container>
        </Container>
        <Container>
          <Segment className="borderless shadowless">
            <div className="rel-pt-2">
              <SearchApp
                appName={activeContent.appId}
                key={activeContent.appId}
                config={activeContent.config}
              />
            </div>
          </Segment>
        </Container>
      </>
    );
  }
}

ReactDOM.render(<DashboardMenu />, rootElement);
