let searchIndex, pagesIndex;

const getSearchQuery = () => document.getElementById("search").value.trim().toLowerCase();
const clearSearchInput = () => { document.getElementById("search").value = ""; }
const setQueryLabel = query => { document.getElementById("query").innerHTML = query; }

async function initSearchIndex() {
  try {
    const response = await fetch("/index.json");
    pagesIndex = await response.json();
    searchIndex = lunr(function() {
      this.field("title");
      this.field("categories");
      this.field("content");
      this.ref("href");
      pagesIndex.forEach(page => this.add(page))
    });
  } catch (e) {
    console.log(e);
  }
}

function interceptSearchInput(event) {
  if (event.keyCode == 13) {
    handleSearchButtonClicked();
  }
}

function handleSearchButtonClicked() {
  event.preventDefault();
  const query = getSearchQuery();
  if (!query) {
    displayErrorMessage("Please enter a search term");
    return;
  }
  const searchResults = searchSite(query);
  if (!searchResults.length) {
    displayErrorMessage("Your search returned no results");
    return;
  }
  setQueryLabel(query);
  renderResults(query, searchResults);
}

function displayErrorMessage(message) {
  document.querySelector("#search-form .search-error-message").innerHTML = message;
  document.querySelector("#search-form .search-error").classList.remove("hide-element");
  document.querySelector("#search-form .search-error").classList.add("fade");
}

function searchSite(queryString) {
  return searchIndex.search(queryString).map(function(result) {
    return pagesIndex.filter(function(page) {
      return page.href === result.ref;
    })[0];
  });
}

function renderResults(query, searchResults) {
  clearSearchResults();
  updateSearchResults(query, searchResults);
  showSearchResults();
  scrollToTop();
}

function clearSearchResults() {
  const results = document.querySelector(".search-results ul");
  while (results.firstChild) results.removeChild(results.firstChild);
}

function updateSearchResults(query, searchResults) {
  searchResults.slice(0, 10).forEach(function(hit) {
    result = createSearchResult(query, hit)
    document.querySelector(".search-results ul").appendChild(result);
  });
}

function createSearchResult(query, hit) {
  const resultTitle = document.createElement("a");
  resultTitle.setAttribute("href", hit.href);
  resultTitle.innerHTML = hit.title;
  const resultContent = document.createElement("p");
  resultContent.innerHTML = createSearchResultContent(query, hit.content);
  const result = document.createElement("li");
  result.appendChild(resultTitle);
  result.appendChild(resultContent);
  return result
}

function createSearchResultContent(query, content) {
  const regex = /\b\./gm
  const periodLocations = Array.from(content.matchAll(regex), m => m.index)
  const queryLocations = Array.from(content.matchAll(query), m => m.index)
  let resultContent = ""
  for (const hitLocation of queryLocations) {
    for (let i = 0; i < periodLocations.length; i++) {
      if (periodLocations[i] > hitLocation) {
        const start = periodLocations[i - 1] + 1
        const end = periodLocations[i]
        const result = content.slice(start, end).trim()
        resultContent+=result.replace(query, '<span class="search-hit">$&</span>') + " ... "
        break
      }
    }
    if (resultContent.length > 500) {
      break
    }
  }
  return resultContent
}

function showSearchResults() {
  document.querySelector(".primary").classList.add("hide-element");
  document.querySelector(".search-results").classList.remove("hide-element");
}

function scrollToTop() {
  const toTopInterval = setInterval(function() {
    const supportedScrollTop =
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

function handleClearSearchButtonClicked() {
  hideSearchResults();
  clearSearchResults();
  clearSearchInput();
}

function hideSearchResults() {
  document.querySelector(".search-results").classList.add("hide-element");
  document.querySelector(".primary").classList.remove("hide-element");
}

initSearchIndex();
document.addEventListener("DOMContentLoaded", function() {
  if (document.getElementById("search-form") != null) {
    document.getElementById("search").addEventListener(
      "keydown", event => interceptSearchInput(event)
    );
    document.getElementById("search-button").addEventListener(
      "click", () => handleSearchButtonClicked()
    );
    document.getElementById("clear-search-results").addEventListener(
      "click", () => handleClearSearchButtonClicked()
    );
    document.querySelector(".search-error").addEventListener(
      "animationend", removeAnimation
    );
  }
});
