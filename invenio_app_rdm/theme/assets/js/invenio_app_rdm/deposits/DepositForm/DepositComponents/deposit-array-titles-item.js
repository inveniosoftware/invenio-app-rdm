import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getIn, FieldArray } from 'formik';
import { Form, Button, Icon } from 'semantic-ui-react';
import { DepositTextField } from './deposit-textfield';


export function DepositArrayTitlesItem(invenioArrayBag) {
    const {fieldPath, index } = invenioArrayBag;

    return <DepositTextField name={`${fieldPath}.${index}.title`} />;
    //TODO: Add <Dropdown options={[Main, alternative,...]}/> <Dropdown options={language} />
}
