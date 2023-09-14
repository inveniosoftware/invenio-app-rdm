import { UsersApi } from "../api/UsersApi";
import React, { Component } from "react";
import PropTypes from "prop-types";

class UserModerationBulkActions extends Component {
  constructor() {
    super();
    this.userApi = new UsersApi();
  }
}
