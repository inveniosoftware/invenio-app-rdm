/*
 * // This file is part of Invenio-App-Rdm
 * // Copyright (C) 2025 CERN.
 * //
 * // Invenio-App-Rdm is free software; you can redistribute it and/or modify it
 * // under the terms of the MIT License; see LICENSE file for more details.
 */

import React from "react";
import PropTypes from "prop-types";
import { Grid, Dropdown, Button } from "semantic-ui-react";

export const CompareRevisionsDropdown = ({
  loading,
  options,
  srcRevision,
  targetRevision,
  onSrcChange,
  onTargetChange,
  onCompare,
}) => {
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
          onChange={(e, { value }) => onSrcChange(value)}
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
          onChange={(e, { value }) => onTargetChange(value)}
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
        <Button onClick={onCompare}>Compare</Button>
      </Grid.Column>
    </Grid>
  );
};

CompareRevisionsDropdown.propTypes = {
  loading: PropTypes.bool.isRequired,
  options: PropTypes.array.isRequired,
  srcRevision: PropTypes.object,
  targetRevision: PropTypes.object,
  onSrcChange: PropTypes.func.isRequired,
  onTargetChange: PropTypes.func.isRequired,
  onCompare: PropTypes.func.isRequired,
};
