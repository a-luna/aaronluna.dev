(function() {
    const toggleActive = function(link) {
        if (location.href == link.href) {
            link.classList.add("active");
        }
    };
    document.querySelectorAll('.site-menu-link').forEach(link => toggleActive(link));
}())