// This file is part of InvenioRDM
// Copyright (C) 2022 CERN.
//
// Invenio RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { withCancel, http } from "react-invenio-forms";
import { Loader, Container, Header, Item, Button, Message } from "semantic-ui-react";
import Overridable from "react-overridable";
import RecordsResultsListItem from "@js/invenio_app_rdm/components/RecordsResultsListItem";
import isEmpty from "lodash/isEmpty";

class RecordsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: { hits: [] },
      isLoading: false,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    this.cancellableFetch && this.cancellableFetch.cancel();
  }

  fetchData = async () => {
    const { fetchUrl } = this.props;
    this.setState({ isLoading: true });

    this.cancellableFetch = withCancel(
      http.get(fetchUrl, {
        headers: {
          Accept: "application/vnd.inveniordm.v1+json",
        },
      })
    );

    try {
      const response = await this.cancellableFetch.promise;
      this.setState({ data: response.data.hits, isLoading: false });
    } catch (error) {
      console.error(error);
      this.setState({ error: error.response.data.message, isLoading: false });
    }
  };

  render() {
    const { isLoading, data, error } = this.state;
    const { title } = this.props;

    const listItems = data.hits?.map((record) => {
      return <RecordsResultsListItem result={record} key={record.id} />;
    });

    return (
      <Overridable
        id="InvenioAppRdm.RecordsList.layout"
        isLoading={isLoading}
        error={error}
        title={title}
        listItems={listItems}
      >
        {!isEmpty(listItems) && (
          <Container>
            {isLoading && <Loader active inline="centered" />}

            {!isLoading && !error && (
              <>
                <Header as="h2">{title}</Header>
                <Item.Group relaxed link divided>
                  {listItems}
                </Item.Group>
                <Container textAlign="center">
                  <Button href="/search">{i18next.t("More")}</Button>
                </Container>
              </>
            )}

            {error && <Message content={error} error icon="warning sign" />}
          </Container>
        )}
      </Overridable>
    );
  }
}

RecordsList.propTypes = {
  title: PropTypes.string.isRequired,
  fetchUrl: PropTypes.string.isRequired,
};

export default Overridable.component("RecordsList", RecordsList);
