(function() {
  const toggleActive = function(link) {
    const link_url = link.attributes.href.value;
    if (location.href.indexOf(link_url) > 0) {
      link.classList.add("active");
    }
  };
  document.querySelectorAll('.site-menu-link').forEach(link => toggleActive(link));
}())
