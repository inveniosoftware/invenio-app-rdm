/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2025 CERN.
 * // Copyright (C) 2025 Graz University of Technology.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Grid, Dropdown, Button } from "semantic-ui-react";

export const CompareRevisionsDropdown = ({
  loading,
  options,
  onCompare,
  srcRevision: srcOption,
  targetRevision: targetOption,
}) => {
  // Local state for selected revisions
  const [srcRevision, setSrcRevision] = useState(srcOption);
  const [targetRevision, setTargetRevision] = useState(targetOption);

  const handleCompare = () => {
    onCompare(srcRevision, targetRevision);
  };

  return (
    <Grid>
      <Grid.Column mobile={16} computer={6} tablet={16} largeScreen={6} widescreen={6}>
        <label htmlFor="source-revision">From</label>
        <Dropdown
          id="source-revision"
          loading={loading}
          placeholder="Source revision..."
          fluid
          selection
          value={srcRevision}
          onChange={(e, { value }) => setSrcRevision(value)}
          options={options}
          scrolling
        />
      </Grid.Column>
      <Grid.Column mobile={16} computer={6} tablet={16} largeScreen={6} widescreen={6}>
        <label htmlFor="target-revision">To</label>
        <Dropdown
          id="target-revision"
          loading={loading}
          placeholder="Target revision..."
          fluid
          selection
          value={targetRevision}
          onChange={(e, { value }) => setTargetRevision(value)}
          options={options}
          scrolling
        />
      </Grid.Column>
      <Grid.Column
        verticalAlign="bottom"
        mobile={16}
        computer={2}
        tablet={16}
        largeScreen={2}
        widescreen={2}
      >
        <Button
          onClick={handleCompare}
          disabled={loading || !srcRevision || !targetRevision}
        >
          Compare
        </Button>
      </Grid.Column>
    </Grid>
  );
};

CompareRevisionsDropdown.propTypes = {
  loading: PropTypes.bool.isRequired,
  options: PropTypes.array.isRequired,
  onCompare: PropTypes.func.isRequired,
  srcRevision: PropTypes.object,
  targetRevision: PropTypes.object,
};

CompareRevisionsDropdown.defaultProps = {
  srcRevision: 0,
  targetRevision: 0,
};
