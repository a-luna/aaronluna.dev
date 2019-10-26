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

function handleSearchButtonHeaderClicked() {
  event.preventDefault();
  const form = document.getElementById("search-form-header");
  const query = form.elements["search"].value;
  if (query === "") {
    const errorDiv = document.getElementById('search-form-header').querySelector('.search-error');
    const errorMessage = document.getElementById('search-form-header').querySelector('.search-error-message');
    errorMessage.innerHTML = "Enter a search term";
    errorDiv.classList.remove("hide-element");
    errorDiv.classList.add("fade");
    return;
  }
  document.querySelector(".search-query").innerHTML = `Search Results for ${query}`;
  const searchResults = searchSite(query);
  if (!searchResults.length) {
    const errorDiv = document.getElementById('search-form-header').querySelector('.search-error');
    const errorMessage = document.getElementById('search-form-header').querySelector('.search-error-message');
    errorMessage.innerHTML = "Your search returned no results";
    errorDiv.classList.remove("hide-element");
    errorDiv.classList.add("fade");
    return;
  }
  renderResults(searchResults);
}

function handleSearchButtonSidebarClicked() {
  event.preventDefault();
  const form = document.getElementById("search-form-sidebar");
  const query = form.elements["search"].value;
  if (query === "") {
    const errorDiv = document.getElementById('search-form-sidebar').querySelector('.search-error');
    const errorMessage = document.getElementById('search-form-sidebar').querySelector('.search-error-message');
    errorMessage.innerHTML = "Please enter a search term";
    errorDiv.classList.remove("hide-element");
    errorDiv.classList.add("fade");
    return;
  }
  document.querySelector(".search-query").innerHTML = `Search Results for ${query}`;
  const searchResults = searchSite(query);
  if (!searchResults.length) {
    const errorDiv = document.getElementById('search-form-sidebar').querySelector('.search-error');
    const errorMessage = document.getElementById('search-form-sidebar').querySelector('.search-error-message');
    errorMessage.innerHTML = "Your search returned no results";
    errorDiv.classList.remove("hide-element");
    errorDiv.classList.add("fade");
    return;
  }
  renderResults(searchResults);
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
  searchResults.slice(0, 10).forEach(function(hit) {
    let resultTitle = document.createElement("a");
    resultTitle.setAttribute("href", hit.href);
    resultTitle.innerHTML = hit.title;
    let resultContent = document.createElement("p");
    resultContent.innerHTML = hit.content.slice(0, 250) + "...";
    let result = document.createElement("li");
    const results = document.querySelector(".search-results ul");
    result.appendChild(resultTitle);
    result.appendChild(resultContent);
    results.appendChild(result);
  });
  const primary = document.querySelector(".primary");
  primary.classList.add("hide-element");
  const search = document.querySelector(".search-results");
  search.classList.remove("hide-element");
}

function removeAnimation() {
  this.classList.remove('fade');
  this.classList.add('hide-element');
}

initSearchIndex();
document.addEventListener("DOMContentLoaded", function() {
  const searchButtonSidebar = document.getElementById("search-button-sidebar");
  if (searchButtonSidebar != null) {
    searchButtonSidebar.addEventListener("click", handleSearchButtonSidebarClicked);
  }
  const searchButtonHeader = document.getElementById("search-button-header");
  if (searchButtonHeader != null) {
    searchButtonHeader.addEventListener("click", handleSearchButtonHeaderClicked);
  }
  document.querySelectorAll('.search-error')
    .forEach(div => div.addEventListener("animationend", removeAnimation))
});
