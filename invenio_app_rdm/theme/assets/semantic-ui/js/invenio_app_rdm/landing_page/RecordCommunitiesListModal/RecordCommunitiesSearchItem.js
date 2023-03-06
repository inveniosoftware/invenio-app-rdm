import React from "react";
import { CommunityCompactItem } from "@js/invenio_communities/community";
import { Button } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";

export const RecordCommunitiesSearchItem = ({ result }) => {
  const action = (
    <Button
      disabled
      size="tiny"
      negative
      labelPosition="left"
      icon="trash"
      floated="right"
      content={i18next.t("Remove")}
    />
  );
  return <CommunityCompactItem actions={action} result={result} />;
};

RecordCommunitiesSearchItem.propTypes = {
  result: PropTypes.object.isRequired,
};
