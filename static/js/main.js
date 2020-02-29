function wrapHeaderElement(h, headerLevel) {
  const range = document.createRange();
  const headerText = document.createElement('span');
  headerText.classList.add("header-text");
  headerText.classList.add(`${headerLevel}`);
  range.selectNode(h);
  range.surroundContents(headerText);
}

function addLinksToHeaderElement(headerWrapper) {
  h = headerWrapper.querySelector("h2[id], h3[id], h4[id], h5[id]");
  headerWrapper.insertAdjacentHTML(
    "afterbegin",
    `<a href="#${h.id}" class="hanchor hanchor-self" ariaLabel="Anchor" title="Link to this section"><i class="fa fa-hashtag"></i></a></a>`
  );
  headerWrapper.insertAdjacentHTML(
    "beforeend",
    `<a href="#menu" class="hanchor hanchor-top" title="Return to top of page"><i class="fa fa-arrow-up"></i></a></a>`
  );
};

function showReturnToTopText() {
  this.querySelectorAll('.hanchor-text')
    .forEach(h => h.classList.remove('hide-element'));
  this.addEventListener('mouseleave', hideReturnToTopText);
}

function hideReturnToTopText() {
  this.querySelectorAll('.hanchor-text')
    .forEach(h => h.classList.add('hide-element'));
  this.onmouseleave = null;
}

function addTargetBlankToExternalLinks(a) {
  if (!a.getAttribute("href").startsWith("/")) {
    a.setAttribute("target", "_blank");
  }
}

function createToggle(accordion) {
  const accordianSection = accordion.querySelector("section");
  const button = accordion.querySelector(".accordion-button");
  button.addEventListener("click", () => toggleAccordion(accordianSection))
}

function toggleAccordion(accordianSection) {
  event.stopPropagation();
  accordianSection.classList.toggle("ac_hidden");
}

document
  .querySelectorAll("article h2[id]")
  .forEach(h => wrapHeaderElement(h, "level1"));
document
  .querySelectorAll("article h3[id]")
  .forEach(h => wrapHeaderElement(h, "level2"));
document
  .querySelectorAll("article h4[id]")
  .forEach(h => wrapHeaderElement(h, "level3"));
document
  .querySelectorAll("article h5[id]")
  .forEach(h => wrapHeaderElement(h, "level4"));
document
  .querySelectorAll(".header-text")
  .forEach(h => addLinksToHeaderElement(h));
// document
//   .querySelectorAll(".hanchor-top")
//   .forEach(h => h.addEventListener("mouseover", showReturnToTopText));
document
  .querySelectorAll(".note a, .alert a")
  .forEach(a => addTargetBlankToExternalLinks(a));
document
  .querySelectorAll(".accordion")
  .forEach(accordion => createToggle(accordion));
