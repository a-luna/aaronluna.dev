function addRelNoOpenerToExternalLinks(a) {
  if (a.getAttribute("target").startsWith("_blank")) {
    a.setAttribute("rel", "noopener")
  }
}

function addTargetBlankToExternalLinks(a) {
  if (!a.getAttribute("href").startsWith("/")) {
    a.setAttribute("target", "_blank")
    a.setAttribute("rel", "noopener")
  }
}

function createToggle(accordion) {
  const accordianSection = accordion.querySelector("section")
  const button = accordion.querySelector(".accordion-button")
  button.addEventListener("click", () => toggleAccordion(accordianSection))
}

function toggleAccordion(accordianSection) {
  event.stopPropagation()
  accordianSection.classList.toggle("ac_hidden")
}

function categorySelectorFocused() {
  const selectWrapper = document.querySelector(".select-css-wrapper")
  const categorySelect = document.getElementById("category-select")
  selectWrapper.classList.add("focused")
  categorySelect.addEventListener("focusout", () => categorySelectorFocusOut())
}

function categorySelectorFocusOut() {
  const selectWrapper = document.querySelector(".select-css-wrapper")
  selectWrapper.classList.remove("focused")
}

function setSelectedCategory() {
  const categorySelect = document.getElementById("category-select")
  if (categorySelect === null) return
  for (const option of categorySelect.options) {
    if (option.value !== window.location.pathname) continue
    option.selected = true
    break
  }
}

document.addEventListener("DOMContentLoaded", function() {
  document
    .querySelectorAll("a[target]")
    .forEach(a => addRelNoOpenerToExternalLinks(a))
  document
    .querySelectorAll(".note a, .alert a, .content p a")
    .forEach(a => addTargetBlankToExternalLinks(a))
  document
    .querySelectorAll(".accordion")
    .forEach(accordion => createToggle(accordion))
  const categorySelect = document.getElementById("category-select")
  if (categorySelect != null) {
    categorySelect.addEventListener("focus", () => categorySelectorFocused())
    setSelectedCategory()
  }
});
