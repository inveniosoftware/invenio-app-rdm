import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getIn, FieldArray } from 'formik';
import { Form, Button, Icon } from 'semantic-ui-react';

export class ArrayField extends Component {
  renderFormField = props => {
    const {
      form: { values },
      ...arrayHelpers
    } = props;
    const {
      fieldPath,
      addButtonLabel,
      defaultNewValue,
      label,
      renderArrayItem,
      ...uiProps
    } = this.props;
    return (
      <Form.Field {...uiProps}>
        <label>{label}</label>
        {getIn(values, fieldPath, []).map((value, index) => {
          const arrayPath = fieldPath;
          const indexPath = index;
          const key = `${arrayPath}.${indexPath}`;
          return (
            <div key={key}>
              {renderArrayItem({ arrayPath, indexPath, key, ...props })}
            </div>
          );
        })}
        <Button
          basic
          secondary
          type="button"
          onClick={() => arrayHelpers.push(defaultNewValue)}
        >
          <Icon name="add" />
          {addButtonLabel}
        </Button>
      </Form.Field>
    );
  };

  render() {
    return (
      <FieldArray
        name={this.props.fieldPath}
        component={this.renderFormField}
      />
    );
  }
}

ArrayField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  addButtonLabel: PropTypes.string,
  defaultNewValue: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    .isRequired,
  renderArrayItem: PropTypes.func.isRequired,
};

ArrayField.defaultProps = {
  label: '',
  addButtonLabel: 'Add new row',
  placeholder: '',
};
