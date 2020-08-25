import React from "react";
import { Item, Label, Button } from "semantic-ui-react";
import _ from "lodash";
import _truncate from "lodash/truncate";

const RDMRecordResultsListItem = ({ result, index }) => {
  const description = _.get(
    result,
    "metadata.descriptions[0].description",
    "No description"
  );
  const startDate = _.get(
    result,
    "metadata.dates[0].start",
    "No metadata"
  );
  const status = _.get(
    result,
    "metadata.resource_type.type",
    "No resource type"
  );
  const access = _.get(
    result,
    "metadata._default_preview",
    "No default preview"
  );
  const creatorName = _.get(
    result,
    "metadata.creators[0].name",
    "No creator"
  );
  const updatedDate = _.get(
    result,
    "metadata.embargo_date",
    "No updated date"
  );
  const title = _.get(
    result,
    "metadata.titles[0].title",
    "No title"
  );

  return (
    <Item key={index}>
      <Item.Content>
        <Item.Extra>
          <div>
            <Label size="tiny" color="blue">{startDate}</Label>
            <Label size="tiny" color="grey">{status}</Label>
            <Label size="tiny" color="green">{access}</Label>
            <Button basic floated='right' href={`/records/${result.id}`}>View</Button>
          </div>
        </Item.Extra>
        <Item.Header>{title}</Item.Header>
        <Item.Meta>{creatorName}</Item.Meta>
        <Item.Description>
          {_truncate(description, { length: 350 })}
        </Item.Description>
        <Item.Extra>
          <div>Updated on <span>{updatedDate}</span></div>
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};

export default RDMRecordResultsListItem;
