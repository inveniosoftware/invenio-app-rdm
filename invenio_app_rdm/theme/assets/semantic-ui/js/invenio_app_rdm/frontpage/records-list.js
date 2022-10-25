// This file is part of InvenioRDM
// Copyright (C) 2022 CERN.
//
// Invenio RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import { withCancel } from "react-invenio-forms";
import { Loader, Container, Header, Item, Button, Message } from "semantic-ui-react";
import { RDMRecordResultsListItem } from "../search/components";
import axios from "axios";

export default class RecordsList extends Component {
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
      axios.get(fetchUrl, {
        headers: {
          Accept: "application/vnd.inveniordm.v1+json",
        },
        withCredentials: true,
      })
    );

    try {
      const response = await this.cancellableFetch.promise;
      this.setState({ data: response.data.hits, isLoading: false });
    } catch (error) {
      console.error(error);
      this.setState({ error: i18next.t("Unable to load records"), isLoading: false });
    }
  };

  render() {
    const { isLoading, data, error } = this.state;
    const { title } = this.props;

    const listItems = data.hits?.map((record) => {
      return <RDMRecordResultsListItem result={record} key={record.id} />;
    });

    return (
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

        {error && <Message content={error} error icon="info" />}
      </Container>
    );
  }
}

RecordsList.propTypes = {
  title: PropTypes.string.isRequired,
  fetchUrl: PropTypes.string.isRequired,
};
