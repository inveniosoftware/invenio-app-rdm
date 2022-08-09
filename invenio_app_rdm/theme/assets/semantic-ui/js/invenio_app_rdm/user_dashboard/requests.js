// This file is part of InvenioRDM
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
// Copyright (C) 2021 New York University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { createSearchAppInit } from "@js/invenio_search_ui";
import {
  SearchAppFacets,
  SearchAppResultsPane,
  InvenioSearchPagination,
} from "@js/invenio_search_ui/components";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import _get from "lodash/get";
import _truncate from "lodash/truncate";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { GridResponsiveSidebarColumn } from "react-invenio-forms";
import {
  BucketAggregation,
  Count,
  ResultsList,
  SearchBar,
  Sort,
  withState,
} from "react-searchkit";
import { parametrize } from "react-overridable";
import {
  LabelTypeInvitation,
  LabelTypeSubmission,
  LabelStatusSubmit,
  LabelStatusDelete,
  LabelStatusAccept,
  LabelStatusDecline,
  LabelStatusCancel,
  LabelStatusExpire,
} from "@js/invenio_requests/request";
import {
  RequestAcceptButton,
  RequestCancelButton,
  RequestDeclineButton,
  RequestCancelButtonModal,
} from "@js/invenio_requests/components/Buttons";
import {
  Button,
  Card,
  Container,
  Grid,
  Header,
  Icon,
  Segment,
} from "semantic-ui-react";
import {
  RDMBucketAggregationElement,
  RDMRecordFacetsValues,
  RDMRecordSearchBarElement,
  SearchHelpLinks,
} from "../search/components";
import { timestampToRelativeTime } from "../utils";
import { ComputerTabletRequestsItem } from "./requests_items/ComputerTabletRequestsItem";
import { MobileRequestsItem } from "./requests_items/MobileRequestsItem";

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
                  className="small pt-5 pb-5 highlight-background"
                >
                  <Grid.Column
                    mobile={16}
                    tablet={4}
                    computer={4}
                    className="mt-5 mb-5"
                  >
                    <Count
                      label={() => (
                        <>
                          {total} {i18next.t("result(s) found")}
                        </>
                      )}
                    />
                  </Grid.Column>
                  <Grid.Column
                    mobile={16}
                    tablet={12}
                    computer={12}
                    className="text-align-right-tablet text-align-right-computer"
                  >
                    {sortOptions && (
                      <Sort
                        values={sortOptions}
                        label={(cmp) => (
                          <>
                            <label className="mr-10">{i18next.t("Sort by")}</label>
                            {cmp}
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
        <InvenioSearchPagination paginationOptions={paginationOptions} />
      </Grid>
    )
  );
};

RequestsResults.propTypes = {
  sortOptions: PropTypes.array.isRequired,
  paginationOptions: PropTypes.object.isRequired,
  currentResultsState: PropTypes.object.isRequired,
};

export function RequestsResultsGridItemTemplate({ result, index }) {
  return (
    <Card fluid key={index} href={`/me/requests/${result.metadata.id}`}>
      <Card.Content>
        <Card.Header>{result.metadata.title}</Card.Header>
        <Card.Description>
          <div dangerouslySetInnerHTML={{ __html: result.metadata.description }} />
        </Card.Description>
      </Card.Content>
    </Card>
  );
}

RequestsResultsGridItemTemplate.propTypes = {
  result: PropTypes.object.isRequired,
  index: PropTypes.string.isRequired,
};

export function RequestsResultsItemTemplateDashboard({ result, index }) {
  const createdDate = new Date(result.created);
  const differenceInDays = timestampToRelativeTime(createdDate.toISOString());
  const createdBy = result.created_by;
  const isCreatorUser = "user" in createdBy;
  const isCreatorCommunity = "community" in createdBy;
  let creatorName = "";
  if (isCreatorUser) {
    creatorName =
      result.expanded?.created_by.profile?.full_name ||
      result.expanded?.created_by.username ||
      createdBy.user;
  } else if (isCreatorCommunity) {
    creatorName = result.expanded?.created_by.metadata?.title || createdBy.community;
  }
  const ComputerTabletRequestsItemWithState = withState(ComputerTabletRequestsItem);
  const MobileRequestsItemWithState = withState(MobileRequestsItem);
  return (
    <>
      <ComputerTabletRequestsItemWithState
        result={result}
        index={index}
        differenceInDays={differenceInDays}
        isCreatorCommunity={isCreatorCommunity}
        creatorName={creatorName}
      />
      <MobileRequestsItemWithState
        result={result}
        index={index}
        differenceInDays={differenceInDays}
        isCreatorCommunity={isCreatorCommunity}
        creatorName={creatorName}
      />
    </>
  );
}

RequestsResultsItemTemplateDashboard.propTypes = {
  result: PropTypes.object.isRequired,
  index: PropTypes.string,
};

RequestsResultsItemTemplateDashboard.defaultProps = {
  index: null,
};

// FIXME: Keeping ResultsGrid.item and SearchBar.element because otherwise
// these components in RDM result broken.

export const RDMRecordResultsGridItem = ({ result, index }) => {
  const descriptionStripped = _get(result, "ui.description_stripped", "No description");
  return (
    <Card fluid key={index} href={`/me/requests/${result.id}`}>
      <Card.Content>
        <Card.Header>{result.metadata.title}</Card.Header>
        <Card.Description>
          {_truncate(descriptionStripped, { length: 200 })}
        </Card.Description>
      </Card.Content>
    </Card>
  );
};

RDMRecordResultsGridItem.propTypes = {
  result: PropTypes.object.isRequired,
  index: PropTypes.string.isRequired,
};

export class RequestStatusFilterComponent extends Component {
  constructor(props) {
    super(props);
    const { currentQueryState } = this.props;
    const userSelectionFilters = currentQueryState.filters;
    const openFilter = userSelectionFilters.find((obj) => obj.includes("is_open"));
    this.state = {
      open: openFilter ? openFilter.includes("true") : undefined,
    };
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
  const [sidebarVisible, setSidebarVisible] = React.useState(false);
  const { config } = props;
  console.log("HEY");
  return (
    <Container>
      <Grid>
        <Grid.Row>
          <Grid.Column only="mobile tablet" mobile={3} tablet={1}>
            <Button
              basic
              size="medium"
              icon="sliders"
              onClick={() => setSidebarVisible(true)}
              aria-label={i18next.t("Filter results")}
              className="rel-mb-1"
            />
          </Grid.Column>

          <Grid.Column
            mobile={13}
            tablet={4}
            computer={3}
            floated="right"
            className="text-align-right-mobile"
          >
            <RequestStatusFilter className="rel-mb-1" />
          </Grid.Column>

          <Grid.Column mobile={16} tablet={11} computer={9}>
            <SearchBar placeholder={i18next.t("Search in my requests...")} />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <GridResponsiveSidebarColumn
            width={4}
            open={sidebarVisible}
            onHideClick={() => setSidebarVisible(false)}
          >
            <SearchAppFacets aggs={config.aggs} />
          </GridResponsiveSidebarColumn>
          <Grid.Column mobile={16} tablet={16} computer={12}>
            <SearchAppResultsPane layoutOptions={config.layoutOptions} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

RDMRequestsSearchLayout.propTypes = {
  config: PropTypes.object.isRequired,
};

export const RequestsFacets = ({ aggs }) => {
  return (
    <aside aria-label={i18next.t("filters")} id="search-filters">
      {aggs.map((agg) => {
        return (
          <div className="rdm-facet-container" key={agg.title}>
            <BucketAggregation title={agg.title} agg={agg} />
          </div>
        );
      })}

      <Card className="borderless facet mt-0">
        <Card.Content>
          <Card.Header as="h2">{i18next.t("Help")}</Card.Header>
          <SearchHelpLinks />
        </Card.Content>
      </Card>
    </aside>
  );
};

RequestsFacets.propTypes = {
  aggs: PropTypes.array.isRequired,
};

export const RDMRequestsEmptyResults = (props) => {
  const { queryString, userSelectionFilters, updateQueryState } = props;
  const isOpen = userSelectionFilters.some(
    (obj) => obj.includes("is_open") && obj.includes("true")
  );
  const filtersToNotReset = userSelectionFilters.find((obj) => obj.includes("is_open"));
  const elementsToReset = {
    queryString: "",
    page: 1,
    filters: [filtersToNotReset],
  };

  const AllDone = () => {
    return (
      <Header as="h1" icon>
        {i18next.t("All done!")}
        <Header.Subheader>
          {i18next.t("You've caught up with all open requests.")}
        </Header.Subheader>
      </Header>
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
          <Button primary onClick={() => updateQueryState(elementsToReset)}>
            {i18next.t("Reset search")}
          </Button>
        )}
      </>
    );
  };

  const allRequestsDone = isOpen && !queryString;
  return (
    <Segment placeholder textAlign="center">
      {allRequestsDone ? <AllDone /> : <NoResults />}
    </Segment>
  );
};

RDMRequestsEmptyResults.propTypes = {
  queryString: PropTypes.string.isRequired,
  updateQueryState: PropTypes.func.isRequired,
  userSelectionFilters: PropTypes.array.isRequired,
};

export const RDMRequestsEmptyResultsWithState = withState(RDMRequestsEmptyResults);

const RequestAcceptButtonWithConfig = parametrize(RequestAcceptButton, {
  size: "mini",
  className: "ml-5",
});

const RequestDeclineButtonWithConfig = parametrize(RequestDeclineButton, {
  size: "mini",
  className: "ml-5",
});

const RequestCancelButtonWithConfig = parametrize(RequestCancelButton, {
  size: "mini",
  className: "ml-5",
});

const RequestAcceptButtonMobileWithConfig = parametrize(RequestAcceptButton, {
  size: "mini",
  className: "mt-10 fluid-responsive",
});

const RequestDeclineButtonMobileWithConfig = parametrize(RequestDeclineButton, {
  size: "mini",
  className: "mt-10 fluid-responsive",
});

const RequestCancelButtonMobileWithConfig = parametrize(RequestCancelButton, {
  size: "mini",
  className: "mt-10 fluid-responsive",
});

const CommunitySubmission = () => (
  <LabelTypeSubmission className="rel-mr-1 primary" size="small" />
);

const CommunityInvitation = () => (
  <LabelTypeInvitation className="rel-mr-1 primary" size="small" />
);

const Submitted = () => <LabelStatusSubmit className="rel-mr-1 primary" size="small" />;

const Deleted = () => <LabelStatusDelete className="rel-mr-1 negative" size="small" />;

const Accepted = () => <LabelStatusAccept className="rel-mr-1 positive" size="small" />;

const Declined = () => (
  <LabelStatusDecline className="rel-mr-1 negative" size="small" />
);

const Cancelled = () => <LabelStatusCancel className="rel-mr-1 neutral" size="small" />;

const Expired = () => <LabelStatusExpire className="rel-mr-1 expired" size="small" />;

export const defaultComponents = {
  "BucketAggregation.element": RDMBucketAggregationElement,
  "BucketAggregationValues.element": RDMRecordFacetsValues,
  "SearchApp.facets": RequestsFacets,
  "ResultsList.item": RequestsResultsItemTemplateDashboard,
  "ResultsGrid.item": RequestsResultsGridItemTemplate,
  "SearchApp.layout": RDMRequestsSearchLayout,
  "SearchApp.results": RequestsResults,
  "SearchBar.element": RDMRecordSearchBarElement,
  "EmptyResults.element": RDMRequestsEmptyResultsWithState,
  "RequestTypeLabel.layout.community-submission": CommunitySubmission,
  "RequestTypeLabel.layout.community-invitation": CommunityInvitation,
  "RequestStatusLabel.layout.submitted": Submitted,
  "RequestStatusLabel.layout.deleted": Deleted,
  "RequestStatusLabel.layout.accepted": Accepted,
  "RequestStatusLabel.layout.declined": Declined,
  "RequestStatusLabel.layout.cancelled": Cancelled,
  "RequestStatusLabel.layout.expired": Expired,
  "RequestActionModalTrigger.accept.computer-tablet": RequestAcceptButtonWithConfig,
  "RequestActionModalTrigger.decline.computer-tablet": RequestDeclineButtonWithConfig,
  "RequestActionModalTrigger.cancel.computer-tablet": RequestCancelButtonWithConfig,
  "RequestActionModalTrigger.accept.mobile": RequestAcceptButtonMobileWithConfig,
  "RequestActionModalTrigger.decline.mobile": RequestDeclineButtonMobileWithConfig,
  "RequestActionModalTrigger.cancel.mobile": RequestCancelButtonMobileWithConfig,
  "RequestActionButton.cancel": RequestCancelButtonModal,
  "RequestActionButton.decline": RequestDeclineButton,
  "RequestActionButton.accept": RequestAcceptButton,
};

createSearchAppInit(defaultComponents);
