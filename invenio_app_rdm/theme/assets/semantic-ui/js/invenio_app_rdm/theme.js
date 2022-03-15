
/* Expand and collapse navbar  */
const toggle = document.querySelector(".menu-icon");
const menu = document.querySelector("#invenio-nav");

/* Toggle mobile menu */
function toggleMenu() {
  if (menu.classList.contains("active")) {
    menu.classList.remove("active");
  } else {
    menu.classList.add("active");
  }
}
toggle && toggle.addEventListener("click", toggleMenu, false);
