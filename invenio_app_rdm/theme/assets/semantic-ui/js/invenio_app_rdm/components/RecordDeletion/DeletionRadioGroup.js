/*
 * SPDX-FileCopyrightText: 2025 CERN
 * SPDX-License-Identifier: MIT
 */

import React from "react";
import PropTypes from "prop-types";
import { Radio, FormField, TableRow, TableCell } from "semantic-ui-react";

const DeletionRadioGroup = ({ index, row, state, onStateChange }) => {
  return (
    <TableRow key={row.name}>
      <TableCell>{row.label}</TableCell>
      <TableCell>
        <FormField>
          <Radio
            value="Yes"
            checked={state[index] === true}
            onChange={() => onStateChange(index, true)}
          />
        </FormField>
      </TableCell>
      <TableCell>
        <FormField>
          <Radio
            value="No"
            checked={state[index] === false}
            onChange={() => onStateChange(index, false)}
          />
        </FormField>
      </TableCell>
    </TableRow>
  );
};

DeletionRadioGroup.propTypes = {
  index: PropTypes.number.isRequired,
  row: PropTypes.object.isRequired,
  state: PropTypes.array.isRequired,
  onStateChange: PropTypes.func.isRequired,
};

export default DeletionRadioGroup;
