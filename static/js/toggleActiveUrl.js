(function() {
  currentUrl = location.href;
  const menuLinks = Array.from(document.querySelectorAll('.site-menu-link'));
  menuLinks.forEach(link => link.classList.remove("active"));
  if (currentUrl.indexOf("/blog/") > 0) {
    document.getElementById('blog').classList.add("active");
    return;
  }
  if (currentUrl.indexOf("/series/") > 0) {
    document.getElementById('tutorials').classList.add("active");
    return;
  }
  homeLink = document.getElementById('home');
  if (currentUrl.endsWith(homeLink)) {
    siteNameLink = document.getElementById('site-name');
    console.log(siteNameLink);
    homeLink.classList.add("active");
    siteNameLink.classList.add("active");
    return;
  }
  aboutMeLink = document.getElementById('about-me');
  if (currentUrl.endsWith(aboutMeLink)) {
    aboutMeLink.classList.add("active");
  }
}())
