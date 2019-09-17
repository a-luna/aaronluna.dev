function addAnchor(e) {
    e.insertAdjacentHTML('beforeend', `<a href="#${e.id}" class="hanchor" ariaLabel="Anchor" title="Link to this section"><i class="fa fa-paperclip"></i></a></a>`)
    e.insertAdjacentHTML('beforeend', `<a href="#top-of-page" class="hanchor" title="Return to top of page"><i class="fa fa-angle-double-up"></i></a></a>`)
}
document.addEventListener('DOMContentLoaded', function() {
    const postTitle = document.querySelector('h1.post__title')
    if (postTitle) {
        postTitle.id = "top-of-page"
    }
    // Add anchor links to all headings
    var headers = document.querySelectorAll('article h2[id], article h3[id]')
    if (headers) {
        headers.forEach(addAnchor)
    }
});