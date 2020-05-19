// This file is part of React-Invenio-Deposit
// Copyright (C) 2020 CERN.
// Copyright (C) 2020 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { getIn, Field } from "formik";
import { Button, Form, Grid, Icon } from "semantic-ui-react";

import { ArrayField, SelectField, TextField } from "../../react_invenio_forms";
import { AffiliationField } from "./AffiliationField";
import { IdentifierField } from "./IdentifierField";

// NOTE: We push formik Field as low as possible in the component hierarchy
// i.e. as long as you can don't need the Formik form, don't use
// <Field ... />

const _CreatorOrContributorField = ({ field, form, ...props }) => {
  /** Creator or Contributor Formik + Semantic-UI Field Component
   *
   * field: current Formik field (CreatorField instance)
   * form: current Formik form (holds formik state that drives the UI)
   * props: all props passed to the component
  */

  const {
    fieldPath,
    typeSegment,
    familyNameSegment,
    givenNameSegment,
    nameSegment,
    affiliationsSegment,
    affiliationsNameSegment,
    affiliationsIdentifierSegment,
    affiliationsSchemeSegment,
    identifiersSegment,
    identifiersIdentifierSegment,
    identifiersSchemeSegment,
    isContributor,
    options,
    roleSegment,
  } = props;

  const typeFieldPath = `${fieldPath}.${typeSegment}`;
  const familyNameFieldPath = `${fieldPath}.${familyNameSegment}`;
  const givenNameFieldPath = `${fieldPath}.${givenNameSegment}`;
  const nameFieldPath = `${fieldPath}.${nameSegment}`;
  const identifiersFieldPath = `${fieldPath}.${identifiersSegment}`;
  const affiliationsFieldPath = `${fieldPath}.${affiliationsSegment}`;
  const roleFieldPath = `${fieldPath}.${roleSegment}`;

  const handleGivenOrFamilyNameChange = (event, data) => {
    /**
     * Fills nameFieldPath in form with combination of given and
     * family names.
     * */
    form.setFieldValue(data.name, data.value);
    const givenName = (
      data.name === givenNameFieldPath
        ? data.value
        : getIn(form.values, givenNameFieldPath, "")
    );
    const familyName = (
      data.name === familyNameFieldPath
        ? data.value
        : getIn(form.values, familyNameFieldPath, "")
    );
    form.setFieldValue(
      nameFieldPath, `${givenName} ${familyName}`
    );

  };

  const personValue = "Personal";

  return (
    // TODO: pass labels as props
    <>
      <SelectField
        fieldPath={typeFieldPath}
        label={"Type"}
        options={props.options.type}
        placeholder="Select type of creator"
      />

      {
        getIn(form.values, typeFieldPath, null) === personValue ? (
          <>
            <TextField
              fieldPath={familyNameFieldPath}
              onChange={handleGivenOrFamilyNameChange}
              label={"Family Name"}
            />
            <TextField
              fieldPath={givenNameFieldPath}
              onChange={handleGivenOrFamilyNameChange}
              label={"Given Name"}
            />
            {
              isContributor && (
                <SelectField
                  fieldPath={roleFieldPath}
                  label={"Role"}
                  options={options.role}
                  placeholder="Select contributor role"
                />
              )
            }
            <ArrayField
              addButtonLabel={"Add affiliation"}
              defaultNewValue={{ [affiliationsNameSegment]: "", [affiliationsIdentifierSegment]: "", [affiliationsSchemeSegment]: "" }}
              fieldPath={affiliationsFieldPath}
              label={"Affiliation(s)"}
            >
              {
                ({ array, arrayHelpers, indexPath, key }) => (
                  <Form.Group inline>
                    <AffiliationField
                      nameFieldPath={`${key}.${affiliationsNameSegment}`}
                      identifierFieldPath={`${key}.${affiliationsIdentifierSegment}`}
                      schemeFieldPath={`${key}.${affiliationsSchemeSegment}`}
                    />
                    {
                      array.length !== 1 && (
                        <Form.Field>
                          <Form.Field>
                            <label>&nbsp;</label>
                            <Button icon>
                              <Icon name="close" size="large" onClick={() => arrayHelpers.remove(indexPath)} />
                            </Button>
                          </Form.Field>
                        </Form.Field>
                      )
                    }
                  </Form.Group>
                )
              }
            </ArrayField>
          </>
        )
        : (
          <>
            <TextField
              fieldPath={nameFieldPath}
              label={"Name"}
            />
            {
              isContributor && (
                <SelectField
                  fieldPath={roleFieldPath}
                  label={"Role"}
                  options={options.role}
                  placeholder="Select contributor role"
                />
              )
            }
          </>
        )
      }

      <ArrayField
        addButtonLabel={"Add identifiers"}
        defaultNewValue={{ [identifiersIdentifierSegment]: "", [identifiersSchemeSegment]: "" }}
        fieldPath={identifiersFieldPath}
        label={"Identifier(s)"}
      >
        {
          ({ array, arrayHelpers, indexPath, key }) => (
            <Form.Group>
              {/*
                NOTE: These are people or organizations' identifiers
                TODO: Differentiate this kind of IdentifierField with
                      identifiers from the related identifier field.
              */}
              <IdentifierField
                identifierFieldPath={`${key}.${identifiersIdentifierSegment}`}
                schemeFieldPath={`${key}.${identifiersSchemeSegment}`}
              />
              {
                array.length === 1
                  ? null
                  :
                  <Form.Field>
                    <Form.Field>
                      <label>&nbsp;</label>
                      <Button icon>
                        <Icon name="close" size="large" onClick={() => arrayHelpers.remove(indexPath)} />
                      </Button>
                    </Form.Field>
                  </Form.Field>
              }
            </Form.Group>
          )
        }
      </ArrayField>
    </>
  );
};

export class CreatorOrContributorField extends Component {
  /** Creator Component */

  render() {
    return (
      <Field
        component={_CreatorOrContributorField}
        {...this.props}
      />
    );
  }
}

CreatorOrContributorField.propTypes = {
  isContributor: PropTypes.bool,
  fieldPath: PropTypes.string.isRequired,
  options: PropTypes.shape({
    // NOTE: It is fine for the interface to ask for 'type', because it doesn't
    //       presuppose the knowledge of the data model. It simply defines
    //       what it expects.
    //       Other requirement: one of these options must have value "personal"
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
  // as it passes the names of its fields that correspond to this functionality.
  typeSegment: PropTypes.string.isRequired,
  familyNameSegment: PropTypes.string.isRequired,
  givenNameSegment: PropTypes.string.isRequired,
  nameSegment: PropTypes.string.isRequired,
  identifiersSegment: PropTypes.string.isRequired,
  affiliationsSegment: PropTypes.string.isRequired,
  roleSegment: PropTypes.string,
  // TODO: pass labels as props
};

CreatorOrContributorField.defaultProps = {
  isContributor: false,
  roleSegment: "",
};
