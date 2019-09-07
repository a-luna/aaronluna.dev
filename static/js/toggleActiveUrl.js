(function() {
    const home_url_1 = 'https://aaronlunadev.netlify.com/';
    const home_url_2 = 'https://aaronlunadev.netlify.com/index.html';
    const blog_search = 'blog';
    const blog_url_1 = '/blog/';
    const tutorial_search = 'flask-api-tutorial';
    const tutorial_url_1 = '/series/flask-api-tutorial';
    const about_url_1 = '/about/';
    const about_url_2 = '/about/index.html';

    var rel_url;
    var matched = true;
    const currentUrl = location.href;
    if (currentUrl.includes(tutorial_search)) {
        rel_url = tutorial_url_1;
    } else if (currentUrl.includes(blog_search)) {
        rel_url = blog_url_1;
    } else if (currentUrl.endsWith(about_url_1)) {
        rel_url = about_url_1;
    } else if (currentUrl.endsWith(about_url_2)) {
        rel_url = about_url_1
    } else if (currentUrl == home_url_1) {
        rel_url = "/";
    } else if (currentUrl == home_url_2) {
        rel_url = "/";
    } else {
        matched = false;
    }

    if (matched) {
        removeActiveMenuItem();
        setActiveMenuItem(rel_url);
    }

    function removeActiveMenuItem() {
        const xpath_a = '//ul[@class="menu__list"]//a[contains(@class, "active")]';
        const xpath_li = '//ul[@class="menu__list"]//li[contains(@class, "menu__item--active")]';
        updateActiveMenuItem(xpath_a, xpath_li, false);
    }

    function setActiveMenuItem(rel_url) {
        var xpath_a = `//ul[@class="menu__list"]//a[contains(@href, "${rel_url}")]`;
        var xpath_li = `${xpath_a}/parent::li`;
        updateActiveMenuItem(xpath_a, xpath_li, true);
    }

    function updateActiveMenuItem(xpath_a, xpath_li, settingActiveItem) {
        var xpathResult_a = document.evaluate(
            xpath_a,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        );
        var xpathResult_li = document.evaluate(
            xpath_li,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        );

        menuItem = xpathResult_li.singleNodeValue;
        menuLink = xpathResult_a.singleNodeValue;
        if (xpathResult_a && menuLink) {
            if (settingActiveItem) {
                menuLink.classList.toggle('active');
            } else {
                menuLink.classList.remove('active')
            }
        }
        if (xpathResult_li && menuItem) {
            if (settingActiveItem) {
                menuItem.classList.toggle('menu__item--active');
            } else {
                menuItem.classList.remove('menu__item--active');
            }
        }
    }
}())