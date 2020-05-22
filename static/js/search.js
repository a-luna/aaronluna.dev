let searchIndex, pagesIndex
const MAX_SUMMARY_LENGTH = 70
const END_OF_SENTENCE_REGEX = /\b\.\s/gm
const WORD_REGEX = /\b(\w*)[\W|\s|\b]?/gm
const JWT_REGEX = /[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gm
const HSL_REGEX = /hsl\((\d+),\s?(\.?\d+%?),\s?(\.?\d+%?)\)/gm

const getSearchQuery = () => document.getElementById("search").value.trim().toLowerCase()
const getTotalSearchResults = () =>
  document.querySelectorAll(".search-results ul li").length
const setQueryLabel = (query) => (document.getElementById("query").innerHTML = query)
const clearSearchInput = () => (document.getElementById("search").value = "")

// polyfill String.prototype.matchAll()
if (!String.prototype.matchAll) {
  String.prototype.matchAll = function (regex) {
    "use strict"
    function ensureFlag(flags, flag) {
      return flags.includes(flag) ? flags : flags + flag
    }
    function* matchAll(str, regex) {
      const localCopy = new RegExp(regex, ensureFlag(regex.flags, "g"))
      let match
      while ((match = localCopy.exec(str))) {
        match.index = localCopy.lastIndex - match[0].length
        yield match
      }
    }
    return matchAll(this, regex)
  }
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

function handleSearchQuery(event) {
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
  const success = renderResults(query, searchResults)
  if (!success) {
    displayErrorMessage("Your search returned no results")
    return
  }
}

function displayErrorMessage(message) {
  document.querySelector(".search-container").classList.remove("focused")
  document.querySelector("#search-form .search-error-message").innerHTML = message
  document.querySelector("#search-form .search-error").classList.remove("hide-element")
  document.querySelector("#search-form .search-error").classList.add("fade")
}

function searchSite(query) {
  return searchIndex.search(getLunrSearchQuery(query)).map((result) => {
    let page_match = pagesIndex.filter((page) => page.href === result.ref)[0]
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
  if (searchResults.length === 0) {
    displayErrorMessage("Your search returned no results")
    return false
  }
  clearSearchResults()
  updateSearchResults(query, searchResults)
  setQueryLabel(query)
  showSearchResults()
  scrollToTop()
  return true
}

function clearSearchResults() {
  const results = document.querySelector(".search-results ul")
  while (results.firstChild) results.removeChild(results.firstChild)
}

function updateSearchResults(query, searchResults) {
  document.querySelector(".search-results ul").innerHTML = searchResults
    .map(
      (hit) => `
    <li class="search-result-item" data-score="${hit.score.toFixed(2)}">
      <a href="${hit.href}" class="search-result-page-title">${hit.title}</a>
      <p>${createSearchResultText(query, hit.content)}</p>
      <p class="search-result-score">Search Result Score: ${hit.score.toFixed(2)}</p>
    </li>
    `
    )
    .join("")
  document.getElementById("results-count").innerHTML = getTotalSearchResults()
  document.getElementById("results-count-text").innerHTML =
    getTotalSearchResults() > 1 ? "results" : "result"
  document.querySelectorAll(".search-results ul li").forEach((li) => {
    colorForSearchResult = getColorForSearchResult(li.dataset.score)
    li.querySelector(".search-result-score").style.color = colorForSearchResult
    li.querySelector(".search-result-page-title").style.color = colorForSearchResult
  })
}

function createSearchResultText(query, pageContent) {
  const searchQueryRegex = new RegExp(createSearchQueryRegex(query), "gmi")
  const searchQueryHits = Array.from(
    pageContent.matchAll(searchQueryRegex),
    (m) => m.index
  )
  const endOfSentenceLocations = Array.from(
    pageContent.matchAll(END_OF_SENTENCE_REGEX),
    (m) => m.index
  )
  let searchResultText = ""
  let lastEndOfSentence = 0
  for (const hitLocation of searchQueryHits) {
    if (hitLocation > lastEndOfSentence) {
      for (let i = 0; i < endOfSentenceLocations.length; i++) {
        if (endOfSentenceLocations[i] > hitLocation) {
          const startOfSentence = endOfSentenceLocations[i - 1] + 1
          const endOfSentence = endOfSentenceLocations[i]
          lastEndOfSentence = endOfSentence
          searchResultText +=
            pageContent.slice(startOfSentence, endOfSentence).trim() + " ... "
          break
        }
      }
    }
    const searchResultWords = tokenize(searchResultText)
    const pageBreakers = searchResultWords.filter((word) => word.length > 50)
    if (pageBreakers.length > 0) {
      searchResultText = fixPageBreakers(searchResultText, pageBreakers)
    }
    if (searchResultWords.length > MAX_SUMMARY_LENGTH) break
  }
  return ellipsize(searchResultText, MAX_SUMMARY_LENGTH).replace(
    searchQueryRegex,
    '<span class="search-hit">$&</span>'
  )
}

function showSearchResults() {
  document.querySelector(".primary").classList.add("hide-element")
  document.querySelector(".search-results").classList.remove("hide-element")
  document.getElementById("site-search").classList.add("expanded")
  document.querySelector(".clear-search-top").classList.remove("hide-element")

  if (getTotalSearchResults() > 2) {
    document.querySelector(".clear-search-bottom").classList.remove("hide-element")
  }

  document.getElementById("clear-search-results-side").classList.remove("hide-element")
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

function createSearchQueryRegex(query) {
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
  largeWords.forEach((word) => {
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
  document.getElementById("clear-search-results-side").classList.add("hide-element")
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

function getColorForSearchResult(score) {
  const highQualityColor = "hsl(171, 92%, 53%)"
  const lowQualityColor = "hsl(212, 92%, 53%)"
  return adjustHue(highQualityColor, lowQualityColor, score)
}

function adjustHue(color1, color2, score) {
  if (score > 3) return color1
  const hslcolor1 = parseHslColor(color1)
  if (!hslcolor1) return {}
  const hslcolor2 = parseHslColor(color2)
  if (!hslcolor2) return {}
  const hueRange = hslcolor1.hue - hslcolor2.hue
  const hueAdjust = (parseFloat(score) / 3) * hueRange
  const newHue = hslcolor2.hue + Math.floor(hueAdjust)
  return `hsl(${newHue}, ${hslcolor1.saturation}, ${hslcolor1.light})`
}

function parseHslColor(input) {
  const localCopy = new RegExp(HSL_REGEX)
  const match = localCopy.exec(input)
  if (!match) return null
  return {
    hue: parseInt(match[1]),
    saturation: match[2],
    light: match[3],
    string: match[0],
  }
}

initSearchIndex()
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("search-form") != null) {
    document.getElementById("search").addEventListener("keydown", (event) => {
      if (event.keyCode == 13) handleSearchQuery(event)
    })
    document.getElementById("search").addEventListener("focus", () => searchBoxFocused())
    document
      .getElementById("clear-search-results-side")
      .addEventListener("click", () => handleClearSearchButtonClicked())
    document
      .querySelector(".search-error")
      .addEventListener("animationend", removeAnimation)
  }
  document
    .querySelectorAll(".clear-search-results-primary")
    .forEach((button) =>
      button.addEventListener("click", () => handleClearSearchButtonClicked())
    )
})
