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

function interceptSearchInput(event, dom) {
  if (event.keyCode == 13) {
    handleSearchButtonClicked(dom);
  }
}

function handleSearchButtonClicked(dom) {
  event.preventDefault();
  const query = dom.getSearchQuery();
  if (query === "") {
    displayErrorMessage(dom, "Please enter a search term");
    return;
  }
  dom.searchQueryLabel().innerHTML = query;
  const searchResults = searchSite(query);
  if (!searchResults.length) {
    displayErrorMessage(dom, "Your search returned no results");
    return;
  }
  renderResults(dom, searchResults);
}

function displayErrorMessage(dom, message) {
  dom.errorLabel().innerHTML = message;
  dom.errorDiv().classList.remove("hide-element");
  dom.errorDiv().classList.add("fade");
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

function renderResults(dom, searchResults) {
  clearSearchResults(dom);
  searchResults.slice(0, 10).forEach(function(hit) {
    let resultTitle = document.createElement("a");
    resultTitle.setAttribute("href", hit.href);
    resultTitle.innerHTML = hit.title;
    let resultContent = document.createElement("p");
    resultContent.innerHTML = hit.content.slice(0, 250) + "...";
    let result = document.createElement("li");
    result.appendChild(resultTitle);
    result.appendChild(resultContent);
    dom.searchResultsList().appendChild(result);
  });
  dom.primaryDiv().classList.add("hide-element");
  dom.searchResultsDiv().classList.remove("hide-element");
  scrollToTop();
}

function clearSearchResults(dom) {
  const results = dom.searchResultsList();
  while (results.firstChild) results.removeChild(results.firstChild);
}

function scrollToTop() {
  var toTopInterval = setInterval(function() {
    var supportedScrollTop =
      document.body.scrollTop > 0 ? document.body : document.documentElement;
    if (supportedScrollTop.scrollTop > 0) {
      supportedScrollTop.scrollTop = supportedScrollTop.scrollTop - 50;
    }
    if (supportedScrollTop.scrollTop < 1) {
      clearInterval(toTopInterval);
    }
  }, 10);
}

function removeAnimation() {
  this.classList.remove("fade");
  this.classList.add("hide-element");
}

function handleClearSearchResultsButtonClicked(dom) {
  dom.searchResultsDiv().classList.add("hide-element");
  dom.primaryDiv().classList.remove("hide-element");
  dom.searchInput().value = "";
  clearSearchResults(dom);
}

initSearchIndex();
document.addEventListener("DOMContentLoaded", function() {
  const DomElements = {
    searchButton() { return document.getElementById("search-button"); },
    searchInput() { return document.getElementById("search"); },
    getSearchQuery() { return this.searchInput().value.trim().toLowerCase(); },
    searchResultsDiv() { return document.querySelector(".search-results"); },
    searchQueryLabel() { return document.getElementById("query"); },
    searchResultsList() { return document.querySelector(".search-results ul"); },
    clearSearchResultsButton() { return document.getElementById("clear-search-results"); },
    primaryDiv() { return document.querySelector(".primary"); },
    errorLabel() { return document.querySelector("#search-form .search-error-message"); },
    errorDiv() { return document.querySelector("#search-form .search-error"); },
  }

  const searchInput = DomElements.searchInput();
  const searchButton = DomElements.searchButton();

  if (searchInput != null) {
    searchInput.addEventListener("keydown", event => interceptSearchInput(event, DomElements));
  }
  if (searchButton != null) {
    searchButton.addEventListener(
      "click", () => handleSearchButtonClicked(DomElements)
    );
  }
  DomElements.clearSearchResultsButton().addEventListener(
    "click", () => handleClearSearchResultsButtonClicked(DomElements)
  );
  DomElements.errorDiv().addEventListener("animationend", removeAnimation)
});
