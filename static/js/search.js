let searchIndex, pagesIndex
const MAX_SUMMARY_LENGTH = 150
const WORD_REGEX = /\b(\w*)[\W|\s|\b]?/gm
const JWT_REGEX = /[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gm
const getSearchQuery = () =>
  document.getElementById("search").value.trim().toLowerCase()
const clearSearchInput = () => {
  document.getElementById("search").value = ""
}
const setQueryLabel = (query) => {
  document.getElementById("query").innerHTML = query
}

async function initSearchIndex() {
  try {
    const response = await fetch("/index.json")
    pagesIndex = await response.json()
    searchIndex = lunr(function () {
      this.field("title")
      this.field("categories")
      this.field("content")
      this.ref("href")
      pagesIndex.forEach((page) => this.add(page))
    })
  } catch (e) {
    console.log(e)
  }
}

function interceptSearchInput(event) {
  if (event.keyCode == 13) {
    handleSearchButtonClicked()
  }
}

function handleSearchButtonClicked() {
  event.preventDefault()
  const query = getSearchQuery()
  if (!query) {
    displayErrorMessage("Please enter a search term")
    return
  }
  const searchResults = searchSite(query)
  if (!searchResults.length) {
    displayErrorMessage("Your search returned no results")
    return
  }
  setQueryLabel(query)
  renderResults(query, searchResults)
}

function displayErrorMessage(message) {
  document.querySelector(".search-container").classList.remove("focused")
  document.querySelector(
    "#search-form .search-error-message"
  ).innerHTML = message
  document
    .querySelector("#search-form .search-error")
    .classList.remove("hide-element")
  document.querySelector("#search-form .search-error").classList.add("fade")
}

function searchSite(query) {
  return searchIndex.search(getLunrSearchQuery(query)).map(function (result) {
    let page_match = pagesIndex.filter(function (page) {
      return page.href === result.ref
    })[0]
    page_match.score = result.score
    return page_match
  })
}

function getLunrSearchQuery(query) {
  const searchTerms = query.split(" ")
  if (searchTerms.length === 1) {
    return query
  }
  query = ""
  for (const term of searchTerms) {
    query += `+${term} `
  }
  return query.trim()
}

function renderResults(query, searchResults) {
  clearSearchResults()
  updateSearchResults(query, searchResults)
  showSearchResults()
  scrollToTop()
}

function clearSearchResults() {
  const results = document.querySelector(".search-results ul")
  while (results.firstChild) results.removeChild(results.firstChild)
}

function updateSearchResults(query, searchResults) {
  searchResults.forEach(function (hit) {
    document
      .querySelector(".search-results ul")
      .appendChild(createSearchResult(query, hit))
  })
  if (searchResults.length === 0) {
    displayErrorMessage("Your search returned no results")
    return
  }
  const totalSearchResults = document.querySelectorAll(".search-results ul li").length
  document.getElementById("results-count").innerHTML = totalSearchResults
  document.getElementById("results-count-text").innerHTML = totalSearchResults > 1 ? "results" : "result"
}

function createSearchResult(query, hit) {
  const resultTitle = document.createElement("a")
  resultTitle.setAttribute("href", hit.href)
  resultTitle.innerHTML = hit.title
  resultTitle.className = "search-result-page-title"
  const previewText = createSearchResultPreviewText(query, hit)
  const resultContent = document.createElement("p")
  resultContent.innerHTML = previewText
  const result = document.createElement("li")
  result.className = "search-result-item"
  result.dataset.score = hit.score.toFixed(2)
  result.appendChild(resultTitle)
  result.appendChild(resultContent)
  //return previewText.length === 0 ? { success: false, result: null } : { success: true, result: result }
  return result
}

function createSearchResultPreviewText(query, hit) {
  const queryRegex = new RegExp(getQueryHighlightRegex(query), "gmi")
  const searchHits = Array.from(
    hit.content.matchAll(queryRegex),
    (m) => m.index
  )
  const periodLocations = Array.from(
    hit.content.matchAll(/\b\.\s/gm),
    (m) => m.index
  )
  let previewText = ""
  let lastEndLocation = 0
  for (const hitLocation of searchHits) {
    if (hitLocation > lastEndLocation) {
      for (let i = 0; i < periodLocations.length; i++) {
        if (periodLocations[i] > hitLocation) {
          const start = periodLocations[i - 1] + 1
          const end = periodLocations[i]
          lastEndLocation = end
          previewText += hit.content.slice(start, end).trim() + " ... "
          break
        }
      }
    }
    const previewTextWords = tokenize(previewText)
    const pageBreakers = previewTextWords.filter(word => word.length > 50)
    if (pageBreakers.length > 0) {
      previewText = fixPageBreakers(previewText, pageBreakers)
    }
    if (previewTextWords.length > MAX_SUMMARY_LENGTH) break
  }
  return ellipsize(previewText, MAX_SUMMARY_LENGTH).replace(
    queryRegex,
    '<span class="search-hit">$&</span>'
  )
}

function tokenize(input) {
  const matches = input.matchAll(WORD_REGEX)
  const wordMatches = Array.from(matches, (m) => m)
  const words = []
  wordMatches.forEach((m) =>
    words.push({
      word: m[0],
      start: m.index,
      end: m.index + m[0].length,
      length: m[0].length,
    })
  )
  return words
}

function ellipsize(input, maxLength) {
  const words = tokenize(input)
  if (words.length <= maxLength) {
    return input
  }
  return input.slice(0, words[maxLength].end) + "..."
}

function getQueryHighlightRegex(query) {
  const searchTerms = query.split(" ")
  if (searchTerms.length == 1) {
    return query
  }
  query = ""
  for (const term of searchTerms) {
    query += `${term}|`
  }
  query = query.slice(0, -1)
  return `(${query})`
}

function fixPageBreakers(input, largeWords) {
  largeWords.forEach(word => {
    const chunked = chunkify(word.word, 20)
    input = input.replace(word.word, chunked)
  })
  return input
}

function chunkify(input, chunkSize) {
  let output = ""
  let totalChunks = (input.length / chunkSize) | 0
  let lastChunkIsUneven = input.length % chunkSize > 0
  if (lastChunkIsUneven) {
    totalChunks += 1
  }
  for (let i = 0; i < totalChunks; i++) {
    let start = i * chunkSize
    let end = start + chunkSize
    if (lastChunkIsUneven && i === totalChunks - 1) {
      end = input.length
    }
    output += input.slice(start, end) + " "
  }
  return output
}

function showSearchResults() {
  document.querySelector(".primary").classList.add("hide-element")
  document.querySelector(".search-results").classList.remove("hide-element")
  document.getElementById("site-search").classList.add("expanded")

  document
    .querySelectorAll(".clear-search-results-primary")
    .forEach((button) => button.classList.remove("hide-element"))
  document
    .getElementById("clear-search-results-side")
    .classList.remove("hide-element")
}

function scrollToTop() {
  const toTopInterval = setInterval(function () {
    const supportedScrollTop =
      document.body.scrollTop > 0 ? document.body : document.documentElement
    if (supportedScrollTop.scrollTop > 0) {
      supportedScrollTop.scrollTop = supportedScrollTop.scrollTop - 50
    }
    if (supportedScrollTop.scrollTop < 1) {
      clearInterval(toTopInterval)
    }
  }, 10)
}

function removeAnimation() {
  this.classList.remove("fade")
  this.classList.add("hide-element")
  document.querySelector(".search-container").classList.add("focused")
}

function handleClearSearchButtonClicked() {
  hideSearchResults()
  clearSearchResults()
  clearSearchInput()
}

function hideSearchResults() {
  document
    .querySelectorAll(".clear-search-results-primary")
    .forEach((button) => button.classList.add("hide-element"))
  document
    .getElementById("clear-search-results-side")
    .classList.add("hide-element")
  document.getElementById("site-search").classList.remove("expanded")
  document.querySelector(".search-results").classList.add("hide-element")
  document.querySelector(".primary").classList.remove("hide-element")
}

function searchBoxFocused() {
  const searchWrapper = document.querySelector(".search-container")
  const searchBox = document.getElementById("search")
  searchWrapper.classList.add("focused")
  searchBox.addEventListener("focusout", () => searchBoxFocusOut())
}

function searchBoxFocusOut() {
  const searchWrapper = document.querySelector(".search-container")
  searchWrapper.classList.remove("focused")
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
        match.index = localCopy.lastIndex - match[0].length;
        yield match;
      }
    }
    return matchAll(this, regex);
  };
}

initSearchIndex()
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("search-form") != null) {
    document
      .getElementById("search")
      .addEventListener("keydown", (event) => interceptSearchInput(event))
    document
      .getElementById("search")
      .addEventListener("focus", () => searchBoxFocused())
    document
      .querySelectorAll(".clear-search-results-primary")
      .forEach((button) =>
        button.addEventListener("click", () => handleClearSearchButtonClicked())
      );
    document
      .getElementById("clear-search-results-side")
      .addEventListener("click", () => handleClearSearchButtonClicked())
    document
      .querySelector(".search-error")
      .addEventListener("animationend", removeAnimation)
  }
})
