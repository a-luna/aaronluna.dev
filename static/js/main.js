const toggleActiveMenuLink = function(link) {
  if (location.href == link.href) {
    link.classList.add("active");
  }
};

const addAnchorLinkToDocumentHeader = function(h) {
  h.insertAdjacentHTML(
    "beforeend",
    `<a href="#${h.id}" class="hanchor hanchor-self" ariaLabel="Anchor" title="Link to this section"><i class="fa fa-link"></i></a></a>`
  );
};

const addNavLinkToDocumentHeader = function(h) {
  h.insertAdjacentHTML(
    "beforeend",
    `<a href="#menu" class="hanchor hanchor-top" title="Return to top of page"><i class="fa fa-angle-double-up"></i></a></a>`
  );
};

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

const menuLinks = document.querySelectorAll(".site-menu-link");
menuLinks.forEach(link => toggleActiveMenuLink(link));
const headings = document.querySelectorAll(
    "article h2[id], article h3[id], article h4[id]"
);
headings.forEach(h => addAnchorLinkToDocumentHeader(h));
headings.forEach(h => addNavLinkToDocumentHeader(h));
document
    .querySelectorAll(".series-accordian-button")
    .forEach(button => button.addEventListener("click", toggleSeriesAccordian));
document
    .querySelectorAll(".toc-accordian-button")
    .forEach(button => button.addEventListener("click", toggleTocAccordian));
