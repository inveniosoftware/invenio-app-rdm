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
            log_id,
            timestamp,
            event: { action, status },
            resource: { type, id: resourceId },
        } = result;

        return (
            <Table.Row>
                <Table.Cell data-label={i18next.t("Log ID")}>{log_id}</Table.Cell>
                <Table.Cell data-label={i18next.t("Status")}>
                    <BoolFormatter
                        value={status === "submitted"}
                        icon="hourglass"
                        color="yellow"
                    />
                    <BoolFormatter value={status === "declined"} icon="ban" color="red" />
                    <BoolFormatter
                        value={status === "accepted"}
                        icon="check"
                        color="green"
                    />
                </Table.Cell>
                <Table.Cell data-label={i18next.t("Resource")}>{type}</Table.Cell>
                <Table.Cell data-label={i18next.t("Resource ID")}>{resourceId}</Table.Cell>
                <Table.Cell data-label={i18next.t("Action")}>{action}</Table.Cell>
                <Table.Cell data-label={i18next.t("Date")}>{timestamp}</Table.Cell>
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
