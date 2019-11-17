const toggleActiveMenuLink = function(link) {
  if (location.href == link.href) {
    link.classList.add("active");
  }
};

const addLinksToHeaderElement = function(h) {
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

const toggleSeriesAccordian = function(event) {
  event.stopPropagation();
  document
    .querySelector(".series-accordian-section")
    .classList.toggle("ac_hidden");
};

const toggleTocAccordian = function(event) {
  event.stopPropagation();
  document
    .querySelector(".toc-accordian-section")
    .classList.toggle("ac_hidden");
};

document
  .querySelectorAll(".menu-link")
  .forEach(link => toggleActiveMenuLink(link));
document
  .querySelectorAll("article h2[id], article h3[id], article h4[id], article h5[id]")
  .forEach(h => addLinksToHeaderElement(h));
document
  .querySelectorAll(".series-accordian-button")
  .forEach(button => button.addEventListener("click", toggleSeriesAccordian));
document
  .querySelectorAll(".toc-accordian-button")
  .forEach(button => button.addEventListener("click", toggleTocAccordian));
