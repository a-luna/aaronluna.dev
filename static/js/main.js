const toggleActiveMenuLink = function(link) {
  if (location.href == link.href) {
    link.classList.add("active");
  }
};

const addLinksToHeaderElement = function(h) {
  h.insertAdjacentHTML(
    "beforeend",
    `<a href="#${h.id}" class="hanchor hanchor-self" ariaLabel="Anchor" title="Link to this section"><i class="fa fa-link"></i></a></a>`
  );
  h.insertAdjacentHTML(
    "beforeend",
    `<a href="#menu" class="hanchor hanchor-top" title="Return to top of page"><i class="fa fa-angle-double-up"></i></a></a>`
  );
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

const addCopyButtonToCodeBlock = function(code) {
  var button = document.createElement("button");
  button.className = "copy-code-button";
  button.type = "button";
  button.innerText = "Copy";
  button.addEventListener("click", function() {
    navigator.clipboard.writeText(code.innerText).then(
      function() {
        button.blur();
        button.innerText = "Copied!";
        setTimeout(function() {
          button.innerText = "Copy";
        }, 2000);
      },
      function(error) {
        button.innerText = "Error";
      }
    );
  });
  let pre = code.parentNode;
  let chroma = pre;
  if (!pre.parentNode.classList.contains("highlight")) {
    chroma =
      pre.parentNode.parentNode.parentNode.parentNode.parentNode;
  }
  chroma.parentNode.insertBefore(button, chroma);
  let highlight = chroma.parentNode;
  let wrapper = document.createElement('div');
  wrapper.className = "highlight-wrapper"
  highlight.parentNode.insertBefore(wrapper, highlight);
  wrapper.appendChild(highlight);
};

document
  .querySelectorAll(".menu-link")
  .forEach(link => toggleActiveMenuLink(link));
document
  .querySelectorAll("article h2[id], article h3[id], article h4[id]")
  .forEach(h => addLinksToHeaderElement(h));
document
  .querySelectorAll(".series-accordian-button")
  .forEach(button => button.addEventListener("click", toggleSeriesAccordian));
document
  .querySelectorAll(".toc-accordian-button")
  .forEach(button => button.addEventListener("click", toggleTocAccordian));
document
  .querySelectorAll(
    ".highlight > .chroma > code, .highlight td.lntd:last-child > .chroma > code"
  )
  .forEach(code => addCopyButtonToCodeBlock(code));
