let searchIndex, pagesIndex;
const MAX_SUMMARY_LENGTH = 600;
const getSearchQuery = () =>
  document.getElementById("search").value.trim().toLowerCase();
const clearSearchInput = () => {
  document.getElementById("search").value = "";
};
const setQueryLabel = (query) => {
  document.getElementById("query").innerHTML = query;
};

async function initSearchIndex() {
  try {
    const response = await fetch("/index.json");
    pagesIndex = await response.json();
    searchIndex = lunr(function () {
      this.field("title");
      this.field("categories");
      this.field("content");
      this.ref("href");
      this.metadataWhitelist = ["position"];
      pagesIndex.forEach((page) => this.add(page));
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
  document.querySelector(".search-container").classList.remove("focused");
  document.querySelector(
    "#search-form .search-error-message"
  ).innerHTML = message;
  document
    .querySelector("#search-form .search-error")
    .classList.remove("hide-element");
  document.querySelector("#search-form .search-error").classList.add("fade");
}

function searchSite(queryString) {
  const queryWordCount = queryString.split(" ").length;
  let searchResults = searchIndex.search(queryString).map(function (result) {
    let page_match = pagesIndex.filter(function (page) {
      return page.href === result.ref;
    })[0];
    const resultMetadata = Object.entries(result.matchData.metadata);
    page_match.queryWordCount = queryWordCount;
    page_match.queryWordCountInResult = resultMetadata.length;
    page_match.score = result.score;
    page_match.hitLocations = [];
    resultMetadata.forEach(([_, searchTerm]) => {
      if (searchTerm.content) {
        searchTerm.content.position.forEach((pos) =>
          page_match.hitLocations.push(pos[0])
        );
      }
    });
    return page_match;
  });
  return searchResults.filter(
    (result) => result.queryWordCount === result.queryWordCountInResult
  );
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
  searchResults.slice(0, 100).forEach(function (hit) {
    const { success, result } = createSearchResult(query, hit);
    if (success) {
      document.querySelector(".search-results ul").appendChild(result);
    }
  });
  if (searchResults.length == 0) {
    displayErrorMessage("Your search returned no results");
    return;
  }
  const resultListItems = document.querySelectorAll(".search-results ul li");
  const resultsCount = document.getElementById("results-count");
  const resultsCountText = document.getElementById("results-count-text");
  resultsCount.innerHTML = resultListItems.length;
  resultsCountText.innerHTML =
    resultListItems.length > 1 ? "results" : "result";
}

function createSearchResult(query, hit) {
  const resultTitle = document.createElement("a");
  resultTitle.setAttribute("href", hit.href);
  resultTitle.innerHTML = hit.title;
  resultTitle.className = "search-result-page-title";
  const resultContent = document.createElement("p");
  const { success, results } = createSearchResultContent(query, hit);
  if (success) {
    resultContent.innerHTML = results;
    const result = document.createElement("li");
    result.className = "search-result-item";
    result.dataset.score = hit.score.toFixed(2);
    result.appendChild(resultTitle);
    result.appendChild(resultContent);
    return { success: true, result: result };
  }
  return { success: false, result: null };
}

function createSearchResultContent(query, hit) {
  const regex = /\b\.\s/gm;
  const periodLocations = Array.from(
    hit.content.matchAll(regex),
    (m) => m.index
  );
  let results = "";
  let lastResultIndex = 0;
  for (const hitLocation of hit.hitLocations) {
    if (hitLocation > lastResultIndex) {
      for (let i = 0; i < periodLocations.length; i++) {
        if (periodLocations[i] > hitLocation) {
          const start = periodLocations[i - 1] + 1;
          const end = periodLocations[i];
          lastResultIndex = end;
          results = hit.content.slice(start, end).trim() + " ... ";
          break;
        }
      }
    }
    if (results.length > MAX_SUMMARY_LENGTH) {
      break;
    }
  }
  if (results.length == 0) {
    return { success: false, results: "" };
  }
  if (results.length > MAX_SUMMARY_LENGTH) {
    const periodLocations = Array.from(
      results.matchAll(/\b\./gm),
      (m) => m.index
    );
    for (let i = 0; i < periodLocations.length; i++) {
      if (periodLocations[i] > MAX_SUMMARY_LENGTH) {
        const newEnd = periodLocations[i - 1] + 1;
        results = results.slice(0, newEnd).trim() + " ...";
        break;
      }
    }
  }
  const queryRegex = new RegExp(query, "gmi");
  results = results.replace(queryRegex, '<span class="search-hit">$&</span>');
  return { success: true, results: results };
}

function showSearchResults() {
  document.querySelector(".primary").classList.add("hide-element");
  document.querySelector(".search-results").classList.remove("hide-element");
  document.getElementById("site-search").classList.add("expanded");

  document
    .querySelectorAll(".clear-search-results-primary")
    .forEach((button) => button.classList.remove("hide-element"));
  document
    .getElementById("clear-search-results-side")
    .classList.remove("hide-element");
}

function scrollToTop() {
  const toTopInterval = setInterval(function () {
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
  document.querySelector(".search-container").classList.add("focused");
}

function handleClearSearchButtonClicked() {
  hideSearchResults();
  clearSearchResults();
  clearSearchInput();
}

function hideSearchResults() {
  document
    .querySelectorAll(".clear-search-results-primary")
    .forEach((button) => button.classList.add("hide-element"));
  document
    .getElementById("clear-search-results-side")
    .classList.add("hide-element");
  document.getElementById("site-search").classList.remove("expanded");
  document.querySelector(".search-results").classList.add("hide-element");
  document.querySelector(".primary").classList.remove("hide-element");
}

function searchBoxFocused() {
  const searchWrapper = document.querySelector(".search-container");
  const searchBox = document.getElementById("search");
  searchWrapper.classList.add("focused");
  searchBox.addEventListener("focusout", () => searchBoxFocusOut());
}

function searchBoxFocusOut() {
  const searchWrapper = document.querySelector(".search-container");
  searchWrapper.classList.remove("focused");
}

// polyfill String.prototype.matchAll()
if (!String.prototype.matchAll) {
  String.prototype.matchAll = function (regex) {
    "use strict";
    function ensureFlag(flags, flag) {
      return flags.includes(flag) ? flags : flags + flag;
    }
    function* matchAll(str, regex) {
      const localCopy = new RegExp(regex, ensureFlag(regex.flags, "g"));
      let match;
      while ((match = localCopy.exec(str))) {
        yield { index: localCopy.lastIndex - 1 };
      }
    }
    return matchAll(this, regex);
  };
}

initSearchIndex();
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("search-form") != null) {
    document
      .getElementById("search")
      .addEventListener("keydown", (event) => interceptSearchInput(event));
    document
      .getElementById("search")
      .addEventListener("focus", () => searchBoxFocused());
    document
      .querySelectorAll(".clear-search-results-primary")
      .forEach((button) =>
        button.addEventListener("click", () => handleClearSearchButtonClicked())
      );
    document
      .getElementById("clear-search-results-side")
      .addEventListener("click", () => handleClearSearchButtonClicked());
    document
      .querySelector(".search-error")
      .addEventListener("animationend", removeAnimation);
  }
});
