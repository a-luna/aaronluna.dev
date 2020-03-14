function colorizeToxResults(codeElement) {
    let toxResultsSpan = codeElement.querySelector(".cmd-results")
    let toxResultsHtml = toxResultsSpan.firstChild
    toxResultsSpan.normalize()
    const newHtml = toxResultsHtml.nodeValue
        .replace(/PASSED/g, '<span class="tox-passed">$&</span>')
        .replace(/SKIPPED/g, '<span class="tox-skipped">$&</span>')
        .replace(/FAILED/g, '<span class="tox-failed">$&</span>')
        .replace(/ERROR/g, '<span class="tox-error">$&</span>')
    let colorizedResults = htmlToDocFragment(newHtml)
    toxResultsSpan.replaceChild(colorizedResults, toxResultsHtml)
}

function htmlToDocFragment(html) {
    let div = document.createElement('div')
    let frag = document.createDocumentFragment()
    div.innerHTML = html;
    while (div.firstChild) {
        frag.appendChild(div.firstChild);
    }
    return frag;
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".tox, .pytest").forEach(
        tox => colorizeToxResults(tox)
    )
})
