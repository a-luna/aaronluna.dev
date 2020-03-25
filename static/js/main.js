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

function setSelectedCategory(pathname) {
  const categorySelect = document.querySelector(".select-css-wrapper select")
  if (categorySelect === null) return
  for (let i = 0; i < categorySelect.options.length; i++) {
    let thisOption = categorySelect.options[i]
    if (thisOption.value !== pathname) continue
    thisOption.selected = true
  }
}

document.addEventListener("DOMContentLoaded", function() {
  document
    .querySelectorAll("a[target]")
    .forEach(a => addRelNoOpenerToExternalLinks(a))
  document
    .querySelectorAll(".note a, .alert a")
    .forEach(a => addTargetBlankToExternalLinks(a))
  document
    .querySelectorAll(".accordion")
    .forEach(accordion => createToggle(accordion))
  setSelectedCategory(window.location.pathname)
});
