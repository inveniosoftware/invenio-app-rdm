// This file is part of InvenioRDM
// Copyright (C) 2019 CERN.
// Copyright (C) 2019 Northwestern University.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import angular from "angular";
import "angular-loading-bar";
import "invenio-search-js/dist/invenio-search-js";

function striptags() {
    return function(text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
}

angular.module('invenioRDM', [])
  .filter('striptags', striptags);


// When the DOM is ready bootstrap the `invenio-serach-js`
angular.element(document).ready(function() {
  angular.bootstrap(document.getElementById("invenio-search"), [
    "invenioRDM",
    "angular-loading-bar",
    "invenioSearch"
  ]);
});
