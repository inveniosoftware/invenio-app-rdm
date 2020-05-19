// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Grid } from "semantic-ui-react";

import { ArrayField } from "../../react_invenio_forms";
import { CreatorOrContributorField } from "./CreatorOrContributorField";

export class CreatorsField extends Component {
  /** Top-level Creators Component */

  render() {
    const { fieldPath, label, labelIcon, ...itemProps } = this.props;

    const {
      familyNameSegment,
      givenNameSegment,
      nameSegment,
      affiliationsSegment,
      affiliationsIdentifierSegment,
      affiliationsNameSegment,
      affiliationsSchemeSegment,
      identifiersSegment,
      identifiersIdentifierSegment,
      identifiersSchemeSegment,
      typeSegment,
    } = itemProps;

    const defaultNewValue = {
      [affiliationsSegment]: [
        {
          [affiliationsIdentifierSegment]: "",
          [affiliationsNameSegment]: "",
          [affiliationsSchemeSegment]: "",
        },
      ],
      [familyNameSegment]: "",
      [givenNameSegment]: "",
      [identifiersSegment]: [
        {
          [identifiersIdentifierSegment]: "",
          [identifiersSchemeSegment]: "",
        },
      ],
      [nameSegment]: "",
      [typeSegment]: "Personal",
    };

    return (
      // TODO: Replace by arrayProps
      <ArrayField
        addButtonLabel={"Add creator"} // TODO: Pass by prop
        defaultNewValue={defaultNewValue}
        fieldPath={fieldPath}
        label={label}
        labelIcon={labelIcon}
      >
        {({ array, arrayHelpers, indexPath, key }) => (
          <>
            <CreatorOrContributorField fieldPath={key} {...itemProps} />
            <Grid>
              <Grid.Column></Grid.Column>
              <Grid.Column floated="right">
                {array.length === 1 ? null : (
                  <Button
                    color="red"
                    floated="right"
                    onClick={() => arrayHelpers.remove(indexPath)}
                  >
                    Remove
                  </Button>
                )}
              </Grid.Column>
            </Grid>
          </>
        )}
      </ArrayField>
    );
  }
}

CreatorsField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  labelIcon: PropTypes.string,
  options: PropTypes.shape({
    // NOTE: It is fine for the interface to ask for 'type', because it doesn't
    //       presuppose the knowledge of the data model. It simply defines
    //       what it expects.
    //       Other requirement: one of these options must have value "Personal"
    //       Alternative is to pass the "person-equivalent" option as a prop
    type: PropTypes.arrayOf(
      PropTypes.shape({
        icon: PropTypes.string,
        text: PropTypes.string,
        value: PropTypes.string,
      })
    ),
  }),

  // **EXPERIMENTAL**
  // NOTE: We decouple the name of the fields with their functionality.
  // This allows a different data model to re-use this component, as long
  // as it passes the name of its fields that correspond to this functionality.
  typeSegment: PropTypes.string.isRequired,
  familyNameSegment: PropTypes.string.isRequired,
  givenNameSegment: PropTypes.string.isRequired,
  nameSegment: PropTypes.string.isRequired,
  identifiersSegment: PropTypes.string.isRequired,
  affiliationsSegment: PropTypes.string.isRequired,
  // TODO: pass labels as props
};
