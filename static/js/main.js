function addRelNoOpenerToExernalLinks(a) {
  if (a.getAttribute("target").startsWith("_blank")) {
    a.setAttribute("rel", "noopener");
  }
}

function addTargetBlankToExternalLinks(a) {
  if (!a.getAttribute("href").startsWith("/")) {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener");
  }
}

function createToggle(accordion) {
  const accordianSection = accordion.querySelector("section");
  const button = accordion.querySelector(".accordion-button");
  button.addEventListener("click", () => toggleAccordion(accordianSection));
}

function toggleAccordion(accordianSection) {
  event.stopPropagation();
  accordianSection.classList.toggle("ac_hidden");
}

document
  .querySelectorAll("a[target]")
  .forEach(a => addRelNoOpenerToExernalLinks(a));
document
  .querySelectorAll(".note a, .alert a")
  .forEach(a => addTargetBlankToExternalLinks(a));
document
  .querySelectorAll(".accordion")
  .forEach(accordion => createToggle(accordion));
