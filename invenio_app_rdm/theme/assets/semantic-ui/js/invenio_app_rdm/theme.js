import $ from "jquery";

/* Expand and collapse navbar  */
const toggleIcon = $("#rdm-burger-menu-icon");
const menu = $("#invenio-nav");

toggleIcon.on("click", function(e){
  menu.toggleClass("active");
})


$(".jump-to-top").on("click", function (event) {
  document.documentElement.scrollTop = 0;
});

const tabElementSelector = ".invenio-tab-menu .item";
const $tabElement = $(tabElementSelector);


$tabElement.tab({
  onVisible: function (tab) {
    $(tabElementSelector).attr("aria-selected", false);
    $(`#${tab}-tab-menu`).attr("aria-selected", true);

    $('.invenio-tab-container .tab.segment')
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


$(".ui.accordion.affiliations").accordion({
  selector: {
    trigger: ".title .affiliations-button",
  },
});


$(".ui.accordion .title").on("keydown", function (event) {
  const $target = $(event.target);
  if ($target.is(".title") && event.key === "Enter") {
    let classList = Array.from(event.target.classList);

    if (classList.indexOf("active") > -1) {
      $target.accordion("close");
    } else {
      $target.accordion("open");
    }
  }
});

