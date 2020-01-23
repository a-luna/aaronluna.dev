function addLinksToHeaderElement(h) {
  h.insertAdjacentHTML(
    "beforeend",
    `<a href="#${h.id}" class="hanchor hanchor-self hide-element" ariaLabel="Anchor" title="Link to this section"><i class="fa fa-link"></i></a></a>`
  );
  h.insertAdjacentHTML(
    "beforeend",
    `<a href="#menu" class="hanchor hanchor-top hide-element" title="Return to top of page"><i class="fa fa-angle-double-up"></i></a></a>`
  );
  h.addEventListener("mouseover", showHeaderLinks);
};

function showHeaderLinks(event) {
  this.querySelectorAll('.hanchor')
    .forEach(link => link.classList.remove('hide-element'));
  this.addEventListener('mouseleave', hideHeaderLinks);
}

function hideHeaderLinks(event) {
  this.querySelectorAll('.hanchor')
    .forEach(link => link.classList.add('hide-element'));
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
  .querySelectorAll("article h2[id], article h3[id], article h4[id], article h5[id]")
  .forEach(h => addLinksToHeaderElement(h));
document
  .querySelectorAll(".note a, .alert a")
  .forEach(a => addTargetBlankToExternalLinks(a));
document
  .querySelectorAll(".accordion")
  .forEach(accordion => createToggle(accordion));
