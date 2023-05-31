import { http } from "react-invenio-forms";
import $ from "jquery";

$(function () {
  var form = $("#access-request-form");
  var submitButton = $('button[type="submit"]');
  var emailInput = $("#access-request-email-address");
  var fullNameInput = $("#access-request-full-name");
  var messageInput = $("#access-request-message");
  var checkbox = $("#access-request-checkbox");
  var isGuest = $("#is-guest").val().toLowerCase() === "true";
  // Function to check if all fields are filled
  function checkFormValidity() {
    const guestValidation =
      isGuest && emailInput.val() !== "" && fullNameInput.val() !== "";

    if (
      (guestValidation || !isGuest) &&
      messageInput.val() !== "" &&
      checkbox.prop("checked")
    ) {
      submitButton.prop("disabled", false);
    } else {
      submitButton.prop("disabled", true);
    }
  }

  // Add event listeners to each input field and checkbox
  emailInput.on("input", checkFormValidity);
  fullNameInput.on("input", checkFormValidity);
  messageInput.on("input", checkFormValidity);
  checkbox.on("change", checkFormValidity);

  // Override form submission behavior
  form.on("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const payload = {
      email: emailInput.val(),
      full_name: fullNameInput.val(),
      message: messageInput.val(),
    };
    var url = form.attr("action");
    try {
      let res = await http.post(url, payload);
      if (!isGuest) {
        const redirectUrl = res.data.links.self_html;
        window.location.href = redirectUrl;
      } else {
        $(".ui.modal").modal("show");
      }
      // Reset form
      emailInput.val("");
      fullNameInput.val("");
      messageInput.val("");
      checkbox.prop("checked", false);
      submitButton.prop("disabled", true);
    } catch (error) {
      if (error.response.data.status === 409 && error.response.data.duplicates) {
        // If request already created redirect to details page
        window.location.href = `/me/requests/${error.response.data.duplicates[0]}`;
      }
      console.error(error);
    }
  });
});
