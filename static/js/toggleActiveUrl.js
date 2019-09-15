(function() {
  const menuLinks = Array.from(document.querySelectorAll('.site-menu-link'));
  menuLinks.forEach(link => link.classList.remove("active"));
  const activeLinks = menuLinks.filter(link => location.href.endsWith(link));
  if (activeLinks && activeLinks.length == 1) {
    activeLinks[0].classList.add("active");
  }
}())
