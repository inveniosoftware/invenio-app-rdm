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

/* User profile dropdown */
$('#user-profile-dropdown.ui.dropdown')
  .dropdown({
    showOnFocus: false,
    selectOnKeydown: false,
    action: (text, value, element) => {
      // needed to trigger navigation on keyboard interaction
      let path = element.attr('href');
      window.location.pathname=path;
    },
    onShow: () => {
      $('#user-profile-dropdown-btn').attr('aria-expanded', true)
    },
    onHide: () => {
      $('#user-profile-dropdown-btn').attr('aria-expanded', false)
    }
  });

/* Burger menu */
const $burgerIcon = $('#rdm-burger-menu-icon');
const $closeBurgerIcon = $('#rdm-close-burger-menu-icon');

const handleBurgerClick = () => {
  $burgerIcon.attr('aria-expanded', true);
  $('#invenio-nav').addClass('active');
  $closeBurgerIcon.trigger("focus");
  $burgerIcon.css('display', 'none');
}

const handleBurgerCloseClick = () => {
  $burgerIcon.css('display', 'block');
  $burgerIcon.attr('aria-expanded', false);
  $('#invenio-nav').removeClass('active');
  $burgerIcon.trigger("focus");
}

$burgerIcon.on({ "click" : handleBurgerClick });
$closeBurgerIcon.on({ "click" : handleBurgerCloseClick });

const $invenioMenu = $('#invenio-menu');

$invenioMenu.on('keydown', (event) => {
  if(event.key === "Escape"){
    handleBurgerCloseClick();
  }
})
