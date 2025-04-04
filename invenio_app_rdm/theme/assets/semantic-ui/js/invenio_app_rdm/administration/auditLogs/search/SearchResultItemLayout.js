/*
 * This file is part of Invenio.
 * Copyright (C) 2025 CERN.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { BoolFormatter, Actions } from "@js/invenio_administration";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Table } from "semantic-ui-react";
import { withState } from "react-searchkit";
import { AdminUIRoutes } from "@js/invenio_administration/src/routes";
import { i18next } from "@translations/invenio_app_rdm/i18next";

class SearchResultItemComponent extends Component {
    componentDidMount() {
        console.error("result", this.props.result);
    }

    refreshAfterAction = () => {
        const { updateQueryState, currentQueryState } = this.props;
        updateQueryState(currentQueryState);
    };

    render() {
        const {
            result,
            idKeyPath,
            listUIEndpoint,
            resourceHasActions,
            resourceName,
            displayEdit,
            displayDelete,
            actions,
        } = this.props;

        const {
            id,
            created,
            action,
            json: { resource_id, user: { name } },
            resource_type,
            user_id,
        } = result;

        return (
            <Table.Row>
                <Table.Cell data-label={i18next.t("Log ID")}>
                    <a target="_blank" rel="noreferrer noopener" href={result.links.self}>
                        {id}
                    </a>
                </Table.Cell>
                <Table.Cell data-label={i18next.t("Resource")}>{resource_type}</Table.Cell>
                <Table.Cell data-label={i18next.t("Resource ID")}>
                <a href={`/administration/${resource_type}s?q=id:${resource_id}`}>
                    {resource_id}
                </a>
                </Table.Cell>
                <Table.Cell data-label={i18next.t("Action")}>{action}</Table.Cell>
                <Table.Cell data-label={i18next.t("User ID")}>
                <a href={`/administration/users?q=id:${user_id}`}>
                    {name}
                </a>
                </Table.Cell>
                <Table.Cell data-label={i18next.t("Date")}>{created}</Table.Cell>
            </Table.Row>
        );
    }
}

SearchResultItemComponent.propTypes = {
    result: PropTypes.object.isRequired,
    idKeyPath: PropTypes.string.isRequired,
    listUIEndpoint: PropTypes.string.isRequired,
    resourceHasActions: PropTypes.bool,
    resourceName: PropTypes.string.isRequired,
    displayEdit: PropTypes.bool,
    displayDelete: PropTypes.bool,
    actions: PropTypes.object,
    updateQueryState: PropTypes.func.isRequired,
    currentQueryState: PropTypes.object.isRequired,
};

SearchResultItemComponent.defaultProps = {
    displayEdit: true,
    displayDelete: true,
    actions: {},
    resourceHasActions: false,
};

export const SearchResultItemLayout = withState(SearchResultItemComponent);
