function wrapHeaderElement(h, headerLevel) {
  const headingWrapper = document.createElement("span");
  headingWrapper.classList.add("heading-text")
  headingWrapper.classList.add(`${headerLevel}`)
  const range = document.createRange()
  range.selectNode(h)
  range.surroundContents(headingWrapper)
  addLinkToSection(h.id, headingWrapper)
  addLinkToTopOfPage(headingWrapper)
  addMagicalUnderline(h)
}

function addLinkToSection(id, headingWrapper) {
  headingWrapper.insertAdjacentHTML(
    "beforeend",
    `<a href="#${id}" class="hanchor hanchor-self" title="Link to this section"><i class="fa fa-link"></i></a></a>`
  )
}

function addLinkToTopOfPage(headingWrapper) {
  headingWrapper.insertAdjacentHTML(
    "beforeend",
    `<a href="#menu" class="hanchor hanchor-top" title="Return to top of page"><i class="fa fa-arrow-up"></i></a></a>`
  )
}

function addMagicalUnderline(h) {
  const headingWrapper = document.createElement("span")
  headingWrapper.classList.add('underline--magical')
  const range = document.createRange()
  range.selectNodeContents(h)
  range.surroundContents(headingWrapper)
}

document
  .querySelectorAll("article h2[id]")
  .forEach(h => wrapHeaderElement(h, "level1"))
document
  .querySelectorAll("article h3[id]")
  .forEach(h => wrapHeaderElement(h, "level2"))
document
  .querySelectorAll("article h4[id]")
  .forEach(h => wrapHeaderElement(h, "level3"))
document
  .querySelectorAll("article h5[id]")
  .forEach(h => wrapHeaderElement(h, "level4"))
document
  .querySelectorAll("h4.widget__title")
  .forEach(h => addMagicalUnderline(h))
