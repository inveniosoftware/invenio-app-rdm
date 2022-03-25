import React, { Component } from "react";
import PropTypes from "prop-types";
import { Grid, Dropdown, Button } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";

export class ExportDropdown extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedFormatUrl: this.props.formats[0]?.export_url
    }
  }
  render() {
    const { formats } = this.props;
    const exportOptions = formats.map((option, index) => {
      return {
        key: `option-${index}`,
        text: option.name,
        value: option.export_url
      }
    })

    return (
      <Grid>
        <Grid.Column width={11}>
          <Dropdown
            selection fluid
            selectOnNavigation={false}
            options={exportOptions}
            onChange={(event, data) => this.setState({selectedFormatUrl: data.value})}
            defaultValue={this.state.selectedFormatUrl}
          />
        </Grid.Column>
        <Grid.Column width={5} className="pl-0">
          <Button
             as="a"
             role="button"
             fluid
             href={this.state.selectedFormatUrl}
             title={i18next.t(("Download file"))}
          >
            { i18next.t("Export") }
          </Button>
        </Grid.Column>
      </Grid>
    )
  }
}

ExportDropdown.propTypes = {
  formats: PropTypes.array.isRequired
};
