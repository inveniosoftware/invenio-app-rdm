// This file is part of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2021 New York University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import {
  SearchAppFacets,
  SearchAppResultsPane,
} from "@js/invenio_search_ui/components";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  BucketAggregation,
  Count,
  Pagination,
  ResultsList,
  ResultsPerPage,
  SearchBar,
  Sort,
  withState,
} from "react-searchkit";
import {
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  Item,
  Label,
  Segment,
} from "semantic-ui-react";
import {
  RDMBucketAggregationElement,
  RDMRecordFacetsValues,
  RDMRecordSearchBarElement,
  SearchHelpLinks,
} from "../../search/components";
import { timestampToRelativeTime } from "../../utils";

export const RequestsResults = ({
  sortOptions,
  paginationOptions,
  currentResultsState,
}) => {
  const { total } = currentResultsState.data;
  return (
    total && (
      <Grid>
        <Grid.Row>
          <Grid.Column width={16}>
            <Segment>
              <Grid>
                <Grid.Row
                  verticalAlign="middle"
                  className="small padding-tb-5 deposit-result-header"
                >
                  <Grid.Column width={4}>
                    <Count
                      label={() => (
                        <>
                          {total} {i18next.t("result(s) found")}
                        </>
                      )}
                    />
                  </Grid.Column>
                  <Grid.Column
                    width={12}
                    textAlign="right"
                    className="padding-r-5"
                  >
                    {sortOptions && (
                      <Sort
                        values={sortOptions}
                        label={(cmp) => (
                          <>
                            {i18next.t("Sort by")} {cmp}
                          </>
                        )}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column>
                    <ResultsList />
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Segment>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row verticalAlign="middle">
          <Grid.Column width={4}></Grid.Column>
          <Grid.Column width={8} textAlign="center">
            <Pagination
              options={{
                size: "mini",
                showFirst: false,
                showLast: false,
              }}
            />
          </Grid.Column>
          <Grid.Column textAlign="right" width={4}>
            <ResultsPerPage
              values={paginationOptions.resultsPerPage}
              label={(cmp) => (
                <>
                  {" "}
                  {cmp} {i18next.t("results per page")}
                </>
              )}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  );
};

export function RequestsResultsGridItemTemplate({ result, index }) {
  return (
    <Card fluid key={index} href={`/me/requests/${result.metadata.id}`}>
      <Card.Content>
        <Card.Header>{result.metadata.title}</Card.Header>
        <Card.Description>
          <div
            dangerouslySetInnerHTML={{ __html: result.metadata.description }}
          />
        </Card.Description>
      </Card.Content>
    </Card>
  );
}

export function RequestsResultsItemTemplate({ result, index }) {
  const createdDate = new Date(result.created);
  const differenceInDays = timestampToRelativeTime(createdDate.toISOString());
  return (
    <Item key={index}>
      <Item.Content>
        <Item.Header>
          {result.type && (
            <span className="mr-5">
              <Label size="large">{result.type}</Label>
            </span>
          )}
          <a href={`/me/requests/${result.id}`}>{result.title}</a>
        </Item.Header>

        <Item.Meta className="mt-10">
          <span className="mr-15">
            {/* TODO: Replace by resolved user */}
            {/* {i18next.t(`opened {{difference}} by {{user}}`, {
              difference: differenceInDays,
              user: result.created_by.user,
            })} */}
            {`opened ${differenceInDays} by you`}
          </span>
          {result.receiver.community && (
            <>
              <Icon className="default-margin" name="users" />
              <span className="ml-5">
                {/* TODO: Replace by resolved receiver */}
                {/* {result.receiver.community} */}
                Biodiversity Literature Repository
              </span>
            </>
          )}
        </Item.Meta>
      </Item.Content>
    </Item>
  );
}
// FIXME: Keeping ResultsGrid.item and SearchBar.element because otherwise
// these components in RDM result broken.

export const RDMRecordResultsGridItem = ({ result, index }) => {
  const description_stripped = _get(
    result,
    "ui.description_stripped",
    "No description"
  );
  return (
    <Card fluid key={index} href={`/me/requests/${result.id}`}>
      <Card.Content>
        <Card.Header>{result.metadata.title}</Card.Header>
        <Card.Description>
          {_truncate(description_stripped, { length: 200 })}
        </Card.Description>
      </Card.Content>
    </Card>
  );
};

export class RequestStatusFilterComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: undefined,
    };
  }

  componentDidMount() {
    const { currentQueryState } = this.props;
    const userSelectionFilters = currentQueryState.filters;
    const openFilter = userSelectionFilters.find((obj) =>
      obj.includes("is_open")
    );
    if (openFilter) {
      this.setState({
        open: openFilter.includes("true"),
      });
    }
  }

  /**
   * Updates queryFilters based on selection and removing previous filters
   * @param {string} OpenStatus true if open requests and false if closed requests
   */
  retrieveRequests = (OpenStatus) => {
    const { currentQueryState, updateQueryState } = this.props;
    const { open } = this.state;

    if (open === OpenStatus) {
      return;
    }
    this.setState({
      open: OpenStatus,
    });
    currentQueryState.filters = [];
    currentQueryState.filters.push(["is_open", OpenStatus]);
    updateQueryState(currentQueryState);
  };

  retrieveOpenRequests = () => {
    this.retrieveRequests(true);
  };

  retrieveClosedRequests = () => {
    this.retrieveRequests(false);
  };

  render() {
    const { open } = this.state;
    return (
      <Button.Group basic>
        <Button
          className="request-search-filter"
          onClick={this.retrieveOpenRequests}
          active={open === true}
        >
          {i18next.t("Open")}
        </Button>
        <Button
          className="request-search-filter"
          onClick={this.retrieveClosedRequests}
          active={open === false}
        >
          {i18next.t("Closed")}
        </Button>
      </Button.Group>
    );
  }
}

RequestStatusFilterComponent.propTypes = {
  updateQueryState: PropTypes.func.isRequired,
  currentQueryState: PropTypes.object.isRequired,
};

export const RequestStatusFilter = withState(RequestStatusFilterComponent);

export const RDMRequestsSearchLayout = (props) => {
  return (
    <Container>
      <Grid>
        <Grid.Row columns={3}>
          <Grid.Column width={4} />
          <Grid.Column width={3}>
            <RequestStatusFilter />
          </Grid.Column>
          <Grid.Column width={9}>
            <SearchBar placeholder={i18next.t("Search requests...")} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={4}>
            <SearchAppFacets aggs={props.config.aggs} />
          </Grid.Column>
          <Grid.Column width={12}>
            <SearchAppResultsPane layoutOptions={props.config.layoutOptions} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export const RequestsFacets = ({ aggs, currentResultsState }) => {
  return (
    <aside aria-label={i18next.t("filters")} id="search-filters">
      {aggs.map((agg) => {
        return (
          <div className="ui accordion" key={agg.title}>
            <BucketAggregation title={agg.title} agg={agg} />
          </div>
        );
      })}
      <SearchHelpLinks />
    </aside>
  );
};

export const RDMRequestsEmptyResults = (props) => {
  const { queryString, userSelectionFilters } = props;
  const is_open = userSelectionFilters.some(
    (obj) => obj.includes("is_open") && obj.includes("true")
  );
  const filtersToNotReset = userSelectionFilters.find((obj) =>
    obj.includes("is_open")
  );
  const elementsToReset = {
    queryString: "",
    page: 1,
    filters: [filtersToNotReset],
  };

  const AllDone = () => {
    return (
      <>
        <Header as="h1" icon>
          {i18next.t("All done!")}
          <Header.Subheader>
            {i18next.t("You've caught up with all open requests.")}
          </Header.Subheader>
        </Header>
      </>
    );
  };

  const NoResults = () => {
    return (
      <>
          <Header icon>
            <Icon name="search" />
            {i18next.t("No requests found!")}
          </Header>
          {queryString && (
            <Button
              primary
              onClick={() => props.updateQueryState(elementsToReset)}
            >
              {i18next.t("Reset search")}
            </Button>
          )}
      </>
    );
  };

  const allRequestsDone = is_open && !queryString;
  return (
    <>
      <Segment placeholder textAlign="center">
        {allRequestsDone ? <AllDone /> : <NoResults />}
      </Segment>
    </>
  );
};

export const RDMRequestsEmptyResultsWithState = withState(
  RDMRequestsEmptyResults
);

export const defaultComponents = {
  "user-requests-search.BucketAggregation.element": RDMBucketAggregationElement,
  "user-requests-search.BucketAggregationValues.element": RDMRecordFacetsValues,
  "user-requests-search.SearchApp.facets": RequestsFacets,
  "user-requests-search.ResultsList.item": RequestsResultsItemTemplate,
  "user-requests-search.ResultsGrid.item": RequestsResultsGridItemTemplate,
  "user-requests-search.SearchApp.layout": RDMRequestsSearchLayout,
  "user-requests-search.SearchApp.results": RequestsResults,
  "user-requests-search.SearchBar.element": RDMRecordSearchBarElement,
  "user-requests-search.EmptyResults.element": RDMRequestsEmptyResultsWithState,
};
