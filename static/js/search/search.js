let searchIndex, pagesIndex;

async function initSearchIndex() {
  try {
    let response = await fetch("/index.json");
    pagesIndex = await response.json();
    searchIndex = lunr(function() {
      this.field("title");
      this.field("categories");
      this.field("content");
      this.ref("href");
      for (var i = 0; i < pagesIndex.length; ++i) {
        this.add(pagesIndex[i]);
      }
    });
  } catch (e) {
    console.log(e);
  }
}

function handleSearchButtonClicked(event) {
  event.preventDefault();
  const results = document.querySelector(".primary");
  while (results.firstChild) results.removeChild(results.firstChild);
  const form = document.getElementById("search-form");
  const search = form.elements["search"];
  renderResults(searchSite(search.value));
}

function searchSite(queryString) {
  const searchResults = searchIndex
    .query(function(q) {
      // look for an exact match and give that a massive positive boost
      q.term(queryString, { usePipeline: true, boost: 100 });
      // prefix matches should not use stemming, and lower positive boost
      q.term(queryString, {
        usePipeline: false,
        boost: 10,
        wildcard: lunr.Query.wildcard.TRAILING
      });
    })
    .map(function(result) {
      return pagesIndex.filter(function(page) {
        return page.href === result.ref;
      })[0];
    });
  return searchResults;
}

function renderResults(searchResults) {
  if (!searchResults.length) {
    return;
  }
  searchResults.slice(0, 10).forEach(function(hit) {
    let resultTitle = document.createElement("a");
    resultTitle.setAttribute("href", hit.href);
    resultTitle.innerHTML = "» " + hit.title;

    let resultContent = document.createElement("p");
    resultContent.innerHTML = hit.content.slice(0, 100) + "...";

    let result = document.createElement("li");
    result.appendChild(resultTitle);
    result.appendChild(resultContent);

    const results = document.querySelector(".primary");
    results.appendChild(result);
  });
}

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

const toggleActiveMenuLink = function(link) {
  if (location.href == link.href) {
    link.classList.add("active");
  }
};

initSearchIndex();

document.addEventListener('DOMContentLoaded', function() {
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
  const searchForm = document.getElementById("search-form");
  searchForm.addEventListener("submit", (event) => { event.preventDefault(); });
  const searchButton = document.getElementById("search-button");
  searchButton.addEventListener("click", handleSearchButtonClicked);
});
