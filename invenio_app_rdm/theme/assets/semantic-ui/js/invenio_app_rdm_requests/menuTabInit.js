import $ from "jquery";

const tabElementSelector = "#request-community-submission-tab .item";
const $tabElement = $(tabElementSelector);

$tabElement.tab({
  onVisible: function (tab) {
    $(tabElementSelector).attr("aria-selected", false);
    $(`#${tab}-tab-menu`).attr("aria-selected", true);

    $('#request-community-submission-tab-container .tab.segment')
      .attr("hidden", true);
    $(`#${tab}-tab`).attr("hidden", false);
  },
});

// adding missing accessibility event (change tabs on enter keystroke)
$tabElement.on("keydown", function (event) {
  if (event.key === "Enter") {
    let dataTab = event.target.attributes["data-tab"];
    let tabName = dataTab && dataTab.value;
    $(event.target).tab("change tab", tabName);
  }
});
