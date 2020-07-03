---
title: "Add Search to Your Static Site with Lunr.js (Hugo, Vanilla JS)"
slug: "add-search-to-static-site-lunrjs-hugo-vanillajs"
date: "2020-05-30"
menu_section: "blog"
toc: true
categories: ["Hugo", "Javascript"]
summary: ""
resources:
  - name: cover
    src: images/cover.jpg
    params:
      credit: "Photo by Brian McMahon on Unsplash"
  - name: search_input
    src: media/search_input.mp4
    title: Search Input Form (Error Messages)
  - name: search_results_mobile
    src: media/search_results_mobile.mp4
    title: Mobile Experience
  - name: search_results_desktop
    src: media/search_results_desktop.mp4
    title: Desktop Experience
---

## Introduction

If you _**DuckDuckGo**_ or _**bing!**_ the phrase "add search to static site", you will find hundreds of articles explaining how a client-side search product like Lunr.js can be integrated with Hugo, Eleventy or Gatsby. Given this fact, I feel compelled to explain why I created this blog post when it appears that this question has been sufficiently answered.

I decided to document my Hugo/Lunr.js solution because unlike other guides I found while researching this subject, my implementation:

<ul class="requirements teal" style="font-size: 0.9em">
  <li>Uses Vanilla JS and does not require jQuery for DOM manipulation/JSON fetching functions.</li>
  <li>Generates the JSON page data file file whenever the site is built by creating a simple Hugo template, <strong>NOT</strong> by npm scripts you have to manually run or integrate with a CI process.</li>
  <li>
    <p>Includes unique features to enhance the search UX:</p>
    <ul>
      <li>Lunr.js gives each search result a "score" indicating the quality of the search hit. I use this score to dynamically alter the hue of the search result link font color: "warm" colors are applied to higher quality results while "cool" colors are applied to lower quality results, producing a gradient effect on the list of search results. This makes the list easier to visually digest since the relative quality of each result is communicated in a simple, intuitive way.</li>
      <li>IMO, the text below the search result link containing text from the page should use an algorithm to display text that is directly related to the search term entered by the user. Most implementations I found simply truncate the page content to the first <strong>N</strong> characters, which is lazy and may not be pertinent to what the user is searching for.</li>
      <li>Rather than navigating to a new page/route when a search is performed, the main content div is hidden and the search results are "unhidden" (shown) in their place. Prominent <strong>Clear Search Results</strong> buttons are shown and when clicked, the search results are hidden and replaced by the main content div. Why is this better? It reduces a tiny amount of friction from the search process, making the experience like that of a Single Page App.</li>
    </ul>
  </li>
</ul>

The items in the list above make my implementation notably different and (IMO) markedly better than the examples I found when I started looking into this topic. Hopefully this makes my decision to create this post in spite of the fact that this topic has been covered extensively easier to understand.

### What is a Client-Side Search Tool?

How is it possible to add a search feature to a static site? Let's back up and instead ask, how is it possible to add any type of dynamic/interactive behavior to a static site? In general, the answer will fall under one of two categories: serverless functions (e.g., AWS Lambda, Azure Functions, etc.) or client-side javascript.

Lunr.js falls under the latter category, which means that all of the work done to produce search results takes place in the client's browser. How does the client get the data required for this task? Since we are not running a server where a database is available to provide the data, we must generate a file that acts like a database when the site is built and make it accessible from a route/URL exposed by our site.

The file we generate will be in JSON format, containing the data for all posts that need to be searchable (this file will be referred to as **the JSON page data file** for the remainder of this guide). When a user performs a search, this JSON file will be fetched and Lunr.js will figure out what posts, if any, match what the user searched for. Most of the code that is unique to my implementation is responsible for the next and final step: rendering the search results as HTML and presenting them to the user.

### Determine Your Search Strategy

Before you implement Lunr.js or a similar package that provides client-side search capabilities, it is extremely important to understand the strengths and weaknesses of such a product. Lunr.js is a perfect fit for my website, since the total number of pages that are searchable is very small (24 pages at the time this was written). I am by no means a prolific blogger, so over time this number should increase very slowly.

However, if your site has thousands of pages that need to be searchable, a client-side search solution could be a very poor choice. You must closely monitor the size of the JSON page data file since it will be transferred to the client when the user performs a search.

If you include the entire content of each page in the JSON, the file can become very large, very quickly. This will have an obvious impact on the response time of the search request, making your site appear sluggish.

This can be mitigated by omitting the page content from the page data file and including a description of the page instead. This would address the performance issue but would greatly lessen the power of the search feature.

If you have reached this page and your site has a much greater amount of content than mine, I would recommend a product like Algolia rather than Lunr.js. Algolia is a paid product, but there is a free version and it is much better suited to large sites than Lunr.js.

{{< info_box >}}

<p>At the very least, generate the page data file in order to understand the size of the JSON for your site. If the file is more than <strong>2 MB</strong>, the search UX will be sluggish for clients with a high-speed connection and unusable for clients with slower data rates.</p>
<p style="margin:10px 0 0 0">If the file is between <strong>1-2 MB</strong>, you need to make a decision based on the quality of the internet service for an average user of your site. At this file size, high speed users should only experience a minor delay when performing a search, but if your average user only has access to 3G, a search could take a minute to execute!</p>
<p style="margin:10px 0 0 0">Ideally, you want the JSON page data file to be less than <strong>500 KB</strong>, however a high-speed connection will easily handle <strong>1 MB</strong>, but this cannot be necessarily assumed for all users.</p>
{{< /info_box >}}

### Install Lunr.js

Lunr.js can be installed locally using npm:

```shell
$ npm install --save-dev lunr
```

This is the method I use in my project. I bundle the lunr.js script with the other javascript files in use on my website and provide the bundle to the client in a single script tag. Of course, you could also have clients download it directly from the unpkg CDN with the script tag below:

```html
<script src="https://unpkg.com/lunr/lunr.js"></script>
```

## How to Integrate Lunr.js with Hugo

If you are still with me, let's get started! There are quite a few things that we must accomplish in order to fully integrate Lunr.js with a Hugo site:

<ol class="requirements teal">
  <li>Update <code>config.toml</code> to generate a JSON version of the home page.</li>
  <li>Create an output format template for the home page that generates the JSON page data file.</li>
  <li>Write javascript to fetch the JSON page data file and build the Lunr.js search index.</li>
  <li>Create a partial template that allows the user to input and submit a search query.</li>
  <li>Write javascript to retrieve the value entered by the user and generate a list of search results, if any.</li>
  <li>Create a partial template that renders the search results.</li>
  <li>Write javascript to render the search results on the page.</li>
</ol>

### Codepen with Final Code

You can inspect the final HTML, CSS and JavaScript with the CodePen below. Please note that the search results will be slightly different from the search form on this page since the CodePen only includes (roughly) the first 500 words of the content from each page:

<p class="codepen" data-height="350" data-theme-id="dark" data-default-tab="result" data-user="a-luna" data-slug-hash="GRooENM" style="height: 555px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Lunr.js Static Site Search Example">
  <span>See the Pen <a href="https://codepen.io/a-luna/pen/GRooENM">
  Lunr.js Static Site Search Example</a> by Aaron Luna (<a href="https://codepen.io/a-luna">@a-luna</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

I recommend changing the zoom from 1x to 0.5x if you choose to view the code alongside the Result.

## Generate JSON Page Data File

One of Hugo's most useful (and powerful) features is the ability to [generate content in any number of formats](https://gohugo.io/templates/output-formats/). By default, Hugo will render an HTML version of each page, as well as an XML version based on an [the default internal RSS template](https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_default/rss.xml).

### Serve `index.json` from Site Root

There are a few other built-in formats that are not enabled by default, including JSON. In your `config.toml` file, add `"JSON"` to the `home` entry in the `[outputs]` section.

```toml
[outputs]
  home = ["HTML", "RSS", "JSON"]
  page = ["HTML"]
```

{{< info_box >}}
If your `config.toml` file does not already have a section called `[outputs]`, you can copy and paste the entire code block above. By default, Hugo generates HTML and XML versions of each page, so generating a JSON version of the homepage is the only change that will be made by applying the code above.
{{< /info_box >}}

This tells Hugo to generate the following files in the site root folder: `index.html`, `index.xml`, and `index.json`. If you save `config.toml` and attempt to build the site, you will be warned that Hugo is unable to locate a layout template for the JSON output format for the home page:

<pre><code><span class="cmd-prompt">$</span> <span class="cmd-input">hugo server -D</span>
<span class="cmd-results">Building sites … <span class="bold-text goldenrod">WARN</span> 2020/05/29 14:20:17 found no layout file for "JSON" for kind "home": You should create a template file which matches Hugo Layouts Lookup Rules for this combination.</span></code></pre>

Since the JSON output template cannot be found, you will receive a 404 response if you attempt to access the URL `/index.json`. Obviously, our next step is to create this template with the goal of generating the page data file.

### Create JSON Output Template

Create a file in the root of the `layouts` folder named `index.json` and add the content below:

```go-html-template {linenos=table,hl_lines=[3]}
{{- $.Scratch.Add "pagesIndex" slice -}}
{{- range $index, $page := .Site.Pages -}}
  {{- if eq $page.Type "post" -}}
    {{- if gt (len $page.Content) 0 -}}
      {{- $pageData := (dict "title" $page.Title "href" $page.Permalink "categories" (delimit $page.Params.categories " ; ") "content" $page.Plain) -}}
      {{- $.Scratch.Add "pagesIndex" $pageData -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{- $.Scratch.Get "pagesIndex" | jsonify -}}
```

Most of this should be self-explanatory. The only line that I am calling attention to is the `if` statement in **Line 3**. For my site, I have pages of types other than `post` that I need to make searchable, so my template includes these other page types with the code below:

```go-html-template
{{- if in (slice "post" "flask_api_tutorial" "projects") $page.Type -}}
```

Hopefully this helps if you also need to include other page types in your site search, the changes you make will depend on the structure of your `content` folder.

With the JSON output template in place, rebuild the site. When complete, if you navigate to `/index.json` you should find a JSON list containing all of the page data for your site:

```json
[
  {
    "categories": "",
    "content": "",
    "href": "",
    "title": ""
  },
  ...
]
```

You can verify that the JSON page data file for my site exists <a href="/index.json" target="_blank">by clicking here</a>.

{{< info_box >}}
<p>I do not use the <code>tags</code> taxonomy on my site, preferring to use <code>categories</code> only. If you only use <code>tags</code> or use both and you want the list of tags to be searchable, the code required is nearly identical to the code shown for <code>categories</code>.</p>
<p style="margin:10px 0 0 0">If you do not use categories and want the list of tags for each page to be searchable, replace <code>"categories" (delimit $page.Params.categories " ; ")</code> with <code>"tags" (delimit $page.Params.tags " ; ")</code> in the <code>$pageData</code> dict object.</p>
<p style="margin:10px 0 0 0">If you use both tags and categories and want both to be searchable, simply add <code>"tags" (delimit $page.Params.tags " ; ")</code> to the <code>$pageData</code> dict object.</p>
{{< /info_box >}}

## Build Lunr.js Search Index

After creating the JSON output template and updating `config.toml` to generate a JSON version of the home page, rebuild your site. Verify that this succeeds without the error we encountered earlier and also verify that `index.json` exists in the root of the `public` folder.

If the format of `index.json` is incorrect, make any necessary changes to the template file and rebuild your site. When you are satisfied with the content and format, create a new file named `search.js`.

There are multiple valid ways to structure your site resources, so place this file with the rest of your javascript files ([in my project this location is `static/js/search.js`](https://github.com/a-luna/aaronluna.dev/blob/master/static/js/search.js)). Add the content below and save the file:

```javascript {linenos=table}
let pagesIndex, searchIndex;

async function initSearchIndex() {
  try {
    const response = await fetch("/index.json");
    pagesIndex = await response.json();
    searchIndex = lunr(function () {
      this.field("title");
      this.field("categories");
      this.field("content");
      this.ref("href");
      pagesIndex.forEach((page) => this.add(page));
    });
  } catch (e) {
    console.log(e);
  }
}

initSearchIndex();
```

{{< info_box >}}
<p>What exactly is a Lunr search index? We designed the JSON output template to generate a list of page objects (one object for every page that is searchable) with the following fields: <strong>href</strong>, <strong>title</strong>, <strong>categories</strong> and <strong>content</strong>. We tell Lunr which fields contain data to be searched, and specify one field as an identifier that is returned in the list of search results.</p>
<p style="margin:10px 0 0 0">Lunr takes the list of search fields, the identifier and the list of page objects and builds an index. The process of building a search index is complicated and way over my head, you can <a href="https://lunrjs.com/guides/core_concepts.html">read the official docs for all the nerdy details</a>.</p>
{{< /info_box >}}

The Lunr search index is pretty important, so let's explain how it is built from the `index.json` file:

<div class="code-details">
  <ul>
    <li><strong>Line 1: </strong><code>search.js</code> will have two global variables: <code>pagesIndex</code> will contain the JSON page data read in from <code>index.json</code>, and <code>searchIndex</code> will contain the Lunr.js search index.</li>
    <li><strong>Lines 5-6: </strong>The client asynchronously fetches <code>index.json</code>, and stores the list of page data in the <code>pagesIndex</code> global variable.</li>
    <li><strong>Line 7: </strong>The <a href="https://lunrjs.com/docs/lunr.html"><code>lunr</code> function is a convenience method</a> that creates a new search index from a list of documents. The search index itself is immutable, all documents to be searched must be provided at this time. It is not possible to add or remove documents after the search index has been created.</li>
    <li><strong>Lines 8-10: </strong>Within the <code>lunr</code> function, the first thing we do is define specify all fields that need to be searchable. The set of possible fields are those that exist on the JSON objects stored in <code>pagesIndex</code>. We specify that three of the four fields available on our page objects (<code>title</code>, <code>categories</code> and <code>content</code>) contain text that should be available to search.</li>
    <li><strong>Line 11: </strong>We specify that the remaining field, <code>href</code>, will be used as the identifier. When a search is performed, the list of results will contain the <code>href</code> value, and this value can be used with <code>pagesIndex</code> to retrieve the page title and content to construct the list of search results and render them as HTML.</li>
    <li><strong>Line 12: </strong>Finally, each page object is added to the Lunr search index. This is the only time that pages can be added to the index, since the Lunr search index object is immutable.
{{< alert_box >}}
The order of the tasks performed within the <code>lunr</code> function is actually important. <a href="https://lunrjs.com/docs/lunr.Builder.html#field">According to the official docs</a>, "<span class="bold-text">all fields should be added before adding documents to the index.</span> Adding fields after a document has been indexed will have no effect on already indexed documents."
{{< /alert_box >}}
    </li>
    <li><strong>Line 19: </strong>The <code>initSearchIndex</code> function is called automatically when the page loads. Most likely, <code>index.json</code> will by downloaded only once (assuming the user's browser is configured to cache it), and all subsequent searches will provide results immediately.</li>
  </ul>
</div>

A search of all documents is performed by calling `searchIndex.search`. The `search` method requires a single parameter, a query string to run against the search index. Our next task is to create a form for users to enter the query string and submit a search request.

## Create Search Form HTML Template

The search input form I designed for my site is intended to appear simple and minimalist, revealing additional functionality when a search is attempted. For example, when a search does not return any results or the enter key is pressed and the text box is empty, an error message fades in and out directly overlapping the input element as shown below:

{{< autoplay_video video="search_input" width="350px" >}}

My implementation is tied directly to [the base theme I started with](https://github.com/Vimux/Mainroad/). All of the items in the sidebar of my site are "widgets" which can be hidden/shown and reordered by adjusting values in `config.toml`. The base theme does not include a "search" widget, but the theme makes creating custom widgets simple and straightforward.

I have removed class names that are related to the base theme/widget system from the HTML below to make the markup more readable and generic (You can compare it to [the actual template in the github repo for this site](https://github.com/a-luna/aaronluna.dev/blob/master/layouts/partials/widgets/search.html)). For the purposes of this guide, I assume that you will adapt my template to suit your needs or create a new layout:

```HTML
<div id="site-search">
  <h4><span class="underline--magical">Search</span></h4>
  <div class="search-flex">
    <form id="search-form" name="searchForm" role="form" onsubmit="return false">
      <div class="search-wrapper">
        <div class="search-container">
          <i class="fa fa-search"></i>
          <input autocomplete="off" placeholder="" id="search" class="search-input" aria-label="Search site" type="text" name="q">
        </div>
        <div class="search-error hide-element"><span class="search-error-message"></span></div>
      </div>
    </form>
    <button id="clear-search-results-sidebar" class="button clear-search-results hide-element">Clear Search Results</button>
  </div>
</div>
```

There are two form elements which are hidden when the page is initially loaded, and this is indicated by the presence of `hide-element` in their class list. As we will see shortly, these elements will be shown when they are needed by removing this class and other elements will be hidden by adding `hide-element` to their class list (via javascript).

{{< info_box >}}
<p>You may be wondering why the search input form is so highly nested. The fade in/out behavior for error messages shown above is one reason, since this requires absolute/relative positioning of stacked elements.</p>
<p style="margin:10px 0 0 0">The purple border effect that occurs when the text box is in focus is achieved by wrapping the input element and magnifying glass icon with the  <code>&lt;div class=search-container&gt;</code> element.</p>
<p style="margin:10px 0 0 0">Also, while the search form may appear simple when finally rendered, it contains multiple flex-containers. Finally, in an attempt to abide by HTML5 recommendations, the widget includes a <code>form</code> element which further increases the levels of nesting.</p>
{{< /info_box >}}

The CSS for the search input form is rather lengthy, obviously you can ignore the coloring/font size details and adapt the style to your own needs:

```css
.hide-element {
  display: none;
}

.search-flex {
  display: flex;
  flex-flow: column nowrap;
  margin: 8px 0 3px 0;
}

.search-wrapper {
  position: relative;
  z-index: 0;
  height: 31px;
}

.search-container {
  position: absolute;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-evenly;
  line-height: 1.3;
  color: hsl(0, 0%, 77%);
  cursor: pointer;
  background-color: hsl(0, 0%, 16%);
  border: 1px solid hsl(0, 0%, 27%);
  border-radius: 0.5em;
}

.search-container:hover {
  border-color: hsl(0, 0%, 40%);
}

.search-container.focused {
  border-color: hsl(261, 100%, 45%);
  box-shadow: 0 0 1px 2px hsl(261, 100%, 45%);
}

#site-search a {
  color: hsl(0, 0%, 85%);
  text-decoration: none;
}

#site-search h4 {
  position: relative;
  font-family: raleway, sans-serif;
  font-weight: 500;
  line-height: 1.2;
  font-size: 1.45em;
  color: #e2e2e2;
  padding: 0 0 5px 0;
  margin: 0;
}

.underline--magical {
    background-image: linear-gradient( 120deg, hsl(261, 100%, 45%) 0%, hsl(261, 100%, 45%) 100% );
    background-repeat: no-repeat;
    background-size: 100% 0.2em;
    background-position: 0 88%;
    transition: background-size 0.25s ease-in;
}

#site-search.expanded #search-form {
  margin: 0 0 15px 0;
}

#search-form .fa {
  margin: 0 auto;
  font-size: 0.9em;
}

#search {
  flex: 1 0;
  max-width: calc(100% - 35px);
  font-size: 0.8em;
  color: hsl(0, 0%, 77%);
  background-color: transparent;
  font-family: roboto, sans-serif;
  box-sizing: border-box;
  -moz-appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  padding: 6px 0;
  margin: 0 5px 0 0;
}

#search:hover {
  background-color: hsl(0, 0%, 16%);
}

#search:focus {
  border-color: hsl(0, 0%, 16%);
  box-shadow: none;
  color: hsl(0, 0%, 77%);
  outline: none;
}

#clear-search-results-mobile {
  display: none;
}

.clear-search-results {
  font-size: 0.9em;
  color: hsl(0, 0%, 85%);
  background-color: hsl(261, 100%, 45%);
  border-radius: 4px;
  line-height: 16px;
  padding: 7px 10px;
  box-sizing: border-box;
  text-align: center;
  width: 100%;
  min-width: 170px;
  transition: all 0.4s linear;
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2), 0 3px 20px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  border: none;
}

.clear-search-results:hover,
.clear-search-results:active,
.clear-search-results:focus,
.clear-search-results:active:hover {
  color: hsl(0, 0%, 95%);
  background-color: hsl(261, 100%, 35%);
}

#search-form .search-error.hide-element {
  display: none;
}

.search-error {
  position: absolute;
  z-index: 2;
  top: 4px;
  right: 7px;
  font-size: 0.75em;
  background-color: hsl(0, 0%, 16%);
  height: 24px;
  display: flex;
  transition: all 0.5s ease-out;
  width: 95%;
}

.search-error-message {
  font-style: italic;
  color: #e6c300;
  text-align: center;
  margin: auto;
  line-height: 1;
  transition: all 0.5s ease-out;
}

.fade {
  -webkit-animation: fade 4s;
  animation: fade 4s;
  -moz-animation: fade 4s;
  -o-animation: fade 4s;
}

@-webkit-keyframes fade {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}

@-moz-keyframes fade {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes fade {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}

@-o-keyframes fade {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}
```

Open `search.js` and add the code highlighted below:

```javascript {linenos=table,hl_lines=["19-28","31-36"]}
let pagesIndex, searchIndex;

async function initSearchIndex() {
  try {
    const response = await fetch("/index.json");
    pagesIndex = await response.json();
    searchIndex = lunr(function () {
      this.field("title");
      this.field("categories");
      this.field("content");
      this.ref("href");
      pagesIndex.forEach((page) => this.add(page));
    });
  } catch (e) {
    console.log(e);
  }
}

function searchBoxFocused() {
  document.querySelector(".search-container").classList.add("focused");
  document
    .getElementById("search")
    .addEventListener("focusout", () => searchBoxFocusOut());
}

function searchBoxFocusOut() {
  document.querySelector(".search-container").classList.remove("focused");
}

initSearchIndex();
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("search-form") != null) {
    const searchInput = document.getElementById("search");
    searchInput.addEventListener("focus", () => searchBoxFocused());
  }
})
```

The code that was just added does not perform any search functionality, it simply adds and removes the purple border around the search box when it is focused/becomes out of focus.

## Handle User Search Request

Now that we have our search input form, we need to retrieve the search query entered by the user. Since I did not create a "Submit" button for the search form, the user will submit their query by pressing the <kbd>Enter</kbd> key. I also added a click event handler to the magnifying glass icon, to provide another way to submit a search query:

Open `search.js` and add the lines highlighted below:

```javascript {linenos=table,linenostart=30,hl_lines=["6-14"]}
initSearchIndex();
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("search-form") != null) {
    const searchInput = document.getElementById("search");
    searchInput.addEventListener("focus", () => searchBoxFocused());
    searchInput.addEventListener("keydown", (event) => {
      if (event.keyCode == 13) handleSearchQuery(event)
    });
    document
      .querySelector(".search-error")
      .addEventListener("animationend", removeAnimation);
    document
      .querySelector(".fa-search")
      .addEventListener("click", (event) => handleSearchQuery(event));
  }
})
```

The code above creates three new event handlers:

<ul class="requirements teal">
  <li>Call <code>handleSearchQuery(event)</code> when the <kbd>Enter</kbd> key is pressed and the search input text box is in focus.</li>
  <li>Call <code>removeAnimation</code> when the <code>animationend</code> event occurs on the <code>&lt;div class="search-error"&gt;</code> element.</li>
  <li>Call <code>handleSearchQuery(event)</code> when the user clicks on the magnifying glass icon.</li>
</ul>

We need to create the functions that are called by these event handlers, add the content below to `search.js` and save the file:

```javascript {linenos=table,linenostart=30}
function handleSearchQuery(event) {
  event.preventDefault();
  const query = document.getElementById("search").value.trim().toLowerCase();
  if (!query) {
    displayErrorMessage("Please enter a search term");
    return;
  }
  const results = searchSite(query)
  if (!results.length) {
    displayErrorMessage("Your search returned no results")
    return
  }
}

function displayErrorMessage(message) {
  document.querySelector(".search-error-message").innerHTML = message;
  document.querySelector(".search-container").classList.remove("focused");
  document.querySelector(".search-error").classList.remove("hide-element");
  document.querySelector(".search-error").classList.add("fade");
}

function removeAnimation() {
  this.classList.remove("fade");
  this.classList.add("hide-element");
  document.querySelector(".search-container").classList.add("focused");
}

function searchSite(query) {
  const originalQuery = query;
  query = getLunrSearchQuery(query);
  let results = getSearchResults(query);
  return results.length
    ? results
    : query !== originalQuery
    ? getSearchResults(originalQuery)
    : [];
}

function getSearchResults(query) {
  return searchIndex.search(query).flatMap((hit) => {
    if (hit.ref == "undefined") return [];
    let pageMatch = pagesIndex.filter((page) => page.href === hit.ref)[0];
    pageMatch.score = hit.score;
    return [pageMatch];
  });
}

function getLunrSearchQuery(query) {
  const searchTerms = query.split(" ");
  if (searchTerms.length === 1) {
    return query;
  }
  query = "";
  for (const term of searchTerms) {
    query += `+${term} `;
  }
  return query.trim();
}
```

There is a lot of information contained within the code above, so please bear with me and read the following explanations:

<div class="code-details">
  <ul>
    <li><strong>Line 31: </strong>When the <kbd>Enter</kbd> key is pressed and the focus is on a form element, the default behavior is to submit the form, which causes the page to reload. Calling <code>event.preventDefault</code> prevents this and stops the event from propgating further.</li>
    <li><strong>Line 32: </strong>When the query entered by the user is retrieved, it is converted to lowercase and any leading and trailing whitespace is removed.</li>
    <li><strong>Lines 33-36: </strong>If nothing has been entered into the search text box, we display an error message to the user (<span class="bold-italics" style="color: var(--purple3)">Please enter a search term</span>).</li>
    <li><strong>Line 37: </strong>Since we have verified that an actual value has been entered, we call <code>searchSite</code> which returns <code>results</code>.</li>
    <li><strong>Lines 38-41: </strong>If the total number of <code>results</code> is zero, we display an error message to the user (<span class="bold-italics" style="color: var(--purple3)">Your search returned no results</span>).</li>
    <li><strong>Lines 44-55: </strong>These two functions are responsible for fading in and fading out the error message directly on top of the search text box.</li>
    <li><strong>Line 58: </strong>We store a copy of the search query entered by the user in <code>originalQuery</code>.</li>
    <li>
      <p><strong>Lines 59, 77-87: </strong>Before generating the list of search results by calling <code>searchIndex.search</code>, the <code>query</code> string is modified by calling <code>getLunrSearchQuery</code>. In order to understand the purpose of this function, you must understand <a href="https://lunrjs.com/guides/searching.html">how the <code>searchIndex.search</code> method uses the query string</a>.</p>
      <p>Before conducting the search, the query string is parsed to <a href="https://lunrjs.com/docs/lunr.Query.html">a search query object</a>. Lunr.js provides a special syntax for query strings, allowing the user to isolate search terms to individual fields, use wildcard characters, perform fuzzy matching, etc.</p>
      <p>The default behavior when a search is performed with a query string that contains more than one word is explained below (<a href="https://lunrjs.com/guides/searching.html#term-presence">from the official docs</a>):</p>
      <blockquote>By default, Lunr combines multiple terms together in a search with a logical OR. That is, a search for “foo bar” will match documents that contain “foo” or contain “bar” or contain both. ... By default each term is optional in a matching document, though a document must have at least one matching term.</blockquote>
      <p>IMO, requiring at least one search term to be found in a document rather than requiring all search terms to be found tends to produce low quality search results. For this reason, the <code>getLunrSearchQuery</code> function modifies the query string in the following manner:</p>
      <ol class="requirements teal">
        <li>Call <code>query.split(" ")</code> to produce a list of search terms.</li>
        <li>If the query only contains a single search term, it is returned unmodified.</li>
        <li>Otherwise, each search term is prefixed with the <code>+</code> character, which specifies that the term must be present in the document to be considered a match.</li>
        <li>The modified search term is concatenated to produce a modified query string.</li>
        <li>After all search terms have had a <code>+</code> prepended, trailing whitespace is trimmed from the modified query string.</li>
        <li>The modified query string is returned.</li>
      </ol>
      <p>For example, if the user entered <span class="bold-italics" style="color: var(--purple3)">vanilla javascript</span>, the <code>getLunrSearchQuery</code> function would produce <span class="bold-italics" style="color: var(--purple3)">+vanilla +javascript</span>. How does modifying the query string in this way change the search behavior? Again, from the Lunr.js docs:</p>
      <blockquote>To indicate that a term must be present in matching documents the term should be prefixed with a plus (+)</blockquote>
      <p>In this example, the effect of the <code>getLunrSearchQuery</code> function changes the search behavior from <span class="bold-italics" style="color: var(--purple3)">documents containing vanilla <span class="emphasis" style="color: var(--purple3)">OR</span> javascript</span> to <span class="bold-italics" style="color: var(--purple3)">documents containing vanilla <span class="emphasis" style="color: var(--purple3)">AND</span> javascript</span>.</p>
    </li>
    <li><strong>Lines 60-65: </strong>If the modified search query does not produce any results, we will re-try with the original version of the search query, since this will return results where <span class="emphasis">ANY</span> search term is present. Please note however, that <code>query</code> and <code>originalQuery</code> will be the same value if the user entered a single-word search query. In this case, we do not need to re-try the search and an empty list is returned.</li>
    <li>
      <p><strong>Line 69: </strong>If we have generated the JSON page data file and built the Lunr.js search index correctly, calling <code>searchIndex.search</code> with a query string will produce a list of search results.</p>
      <p>The search results as returned from <code>searchIndex.search</code> only contain the <code>href</code> field from the JSON page data file and a <code>score</code> value that indicates the quality of the search result. Since we will use the title and page content to construct the list of search results, we need to update the search results to include this information.</p>
      <p>I am using the <code>Array.flatMap</code> method to produce a list of search results containing the data from the JSON page data file and the search result score. I learned about this usage of <code>flatMap</code> from MDN, <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap/#For_adding_and_removing_items_during_a_map">click here if you are interested in the reason why this produces the list of search results</a>.</p>
    </li>
    <li><strong>Line 70: </strong>If the <code>ref</code> property of the Lunr.js search result object is <code>undefined</code>, we exclude it from the list of search results.</li>
    <li id="lunrjs-score"><strong>Line 71: </strong>For each <code>hit</code>, we retrieve the matching page object from <code>pagesIndex</code> by filtering with the condition <code>hit.ref</code> == <code>page.href</code>. There can only be a single page that matches this condition, so we grab the first element returned by the <code>filter</code> method.</li>
    <li><strong>Line 72: </strong>We update the page object returned from the <code>filter</code> method to include the <code>score</code> value of the search result.</li>
{{< info_box >}}
I couldn't find anything [in the Lunr.js docs](https://lunrjs.com/guides/searching.html#scoring) that describe exact score ranges and how those ranges correlate to high-quality, average-quality and low-quality search results. However, based on the results I receive from my site, **anything above 3.0** is a high-quality result, **2-1.5** appears average, and **less than 1.5** seems to be low-quality. This is just my completely amateurish approximation, so take it with a substantial grain of salt.
{{< /info_box >}}
  </ul>
</div>

On my site, if I place a breakpoint at **Line 38**, submit the query "search" and debug this code, the list of search results that are returned from the `searchSite` function can be inspected from the console (obviously, the values for `content` have been truncated since they contain the entire page content):

<pre><code><span class="cmd-prompt">&raquo;</span> <span class="cmd-input">results</span>
<span class="cmd-prompt">&#8594;</span> <span class="cmd-results">(7) [{…}, {…}, {…}, {…}, {…}, {…}, {…}]
      0:
        categories: "Hugo ; Javascript"
        content: "Introduction If you DuckDuckGo or bing! the phrase"
        href: "http://172.20.10.2:1313/blog/add-search-to-static-site-lunrjs-hugo-vanillajs/"
        <span class="bold-text goldenrod">score: 3.6189999999999998</span>
        title: "Add Search to Your Static Site with Lunr.js (Hugo, Vanilla JS)"
        __proto__: Object
      1:
        categories: "Virtualization"
        content: "The majority of my work consists of C#/.NET develo"
        href: "http://172.20.10.2:1313/blog/optimize-vm-performance-windows10-visual-studio-vmware-fusion/"
        <span class="bold-text goldenrod">score: 1.985</span>
        title: "How to Optimize Performance of Windows 10 and Visual Studio in VMWare Fusion"
        __proto__: Object
      2:
        categories: "DevOps"
        content: "If you create Heroku apps, you know that the only"
        href: "http://172.20.10.2:1313/blog/continuously-deploy-heroku-azure-devops/"
        <span class="bold-text goldenrod">score: 1.577</span>
        title: "How to Continuously Deploy a Heroku App with Azure DevOps"
        __proto__: Object
      3:
        categories: "Hugo ; JavaScript"
        content: "Hugo includes a built-in syntax-highlighter called"
        href: "http://172.20.10.2:1313/blog/add-copy-button-to-code-blocks-hugo-chroma/"
        <span class="bold-text goldenrod">score: 1.537</span>
        title: "Hugo: Add Copy-to-Clipboard Button to Code Blocks with Vanilla JS"
        __proto__: Object
      4:
        categories: "Linux"
        content: "Why would you want to install NGINX from source co"
        href: "http://172.20.10.2:1313/blog/install-nginx-source-code-shell-script/"
        <span class="bold-text goldenrod">score: 1.11</span>
        title: "Create a Shell Script to Install NGINX from Source On Ubuntu"
        __proto__: Object
      5:
        categories: "Flask ; Python ; Tutorial-Series"
        content: "Project Structure The chart below shows the folder"
        href: "http://172.20.10.2:1313/series/flask-api-tutorial/part-6/"
        <span class="bold-text goldenrod">score: 0.808</span>
        title: "How To: Create a Flask API with JWT-Based Authentication (Part 6)"
        __proto__: Object
      6:
        categories: "Flask ; Python ; Tutorial-Series"
        content: "Introduction My goal for this tutorial is to provi"
        href: "http://172.20.10.2:1313/series/flask-api-tutorial/part-1/"
        <span class="bold-text goldenrod">score: 0.717</span>
        title: "How To: Create a Flask API with JWT-Based Authentication (Part 1)"
        __proto__: Object
      length: 7</span></code></pre>

As you can see, the list of search results is ordered by `score` and each list item contains all of the information from the JSON page data file. This is everything we need to construct the list of search results and render them as HTML.

## Create Search Results HTML Template

Create a new partial template named `search_results.html` and add the content below:

```html
<section class="search-results hide-element">
  <div id="search-header">
    <div class="search-query search-query-left">search term: <span id="query"></span></div>
    <div class="search-query search-query-right"><span id="results-count"></span><span id="results-count-text"></span></div>
  </div>
  <button id="clear-search-results-mobile" class="button clear-search-results">Clear Search Results</button>
  <ul></ul>
</section>
```

{{< alert_box >}}
The partial HTML template and how it is implemented into the page should not be taken and applied blindly to your web site. The layout and CSS you see here are designed to work in concert with the layout templates I have adapted from the [Mainroad](https://github.com/Vimux/Mainroad/) base theme and there is very little chance that it will make sense on another site unless significant changes are made.
{{< /alert_box >}}

My site is based on a responsive, two-column layout. The two columns are the `<div class="primary">` and `<aside class="sidebar">` elements shown in the example below. The highlighted elements are the search input form which we just created (`<div id="site-search"/>`, which is the first widget in the sidebar), and the other is the search results which we will implement now (i.e., `<section class="search-results hide-element"/>`).

<pre><code>&lt;<span class="html-element-name">div</span> <span class="html-attribute-name">class</span>=<span class="html-attribute-value">"wrapper flex"</span>&gt;
  &lt;<span class="html-element-name">div</span> <span class="html-attribute-name">class</span>=<span class="html-attribute-value">"primary"</span>&gt;
    <span class="html-comment">...page content</span>
  &lt;/<span class="html-element-name">div</span>&gt;
  <span class="html-hl-gray">&lt;<span class="html-element-name">section</span> <span class="html-attribute-name">class</span>=<span class="html-attribute-value">"search-results hide-element"</span>/&gt;</span>
  &lt;<span class="html-element-name">aside</span> <span class="html-attribute-name">class</span>=<span class="html-attribute-value">"sidebar"</span>&gt;
    <span class="html-hl-gray">&lt;<span class="html-element-name">div</span> <span class="html-attribute-name">id</span>=<span class="html-attribute-value">"site-search"</span>/&gt;</span>
    <span class="html-comment">...other widgets</span>
  &lt;/<span class="html-element-name">aside</span>&gt;
&lt;/<span class="html-element-name">div</span>&gt;</code></pre>

The important thing to take away from this is that the search results are hidden when the page loads. However, when the user submits a search query, the `<div class="primary">` element containing the page content will be hidden (by adding the `hide-element` class) and the search results will be shown in their place (by removing the `hide-element` class).

The search results will contain prominent buttons labeled **Clear Search Results** that will restore the original layout when clicked (i.e., the search results will be hidden by adding the `hide-element` class and the `<div class="primary">` element containing the page content will be shown again by removing the `hide-element` class).

Again, the CSS below for the search results HTML template is what I am using on this site, you may have to modify it substantially in order to use it. Alternatively, you could create your own layout and style for the search results:

```css
.wrapper {
  display: flex;
  padding: 40px;
}

.primary {
  flex: 1 0 68%;
  margin: 0;
  display: flex;
  flex-flow: column nowrap;
}

main {
  margin: 0 20px 0 0;
}

.content {
  font-size: 1em;
}

.sidebar {
  font-size: 1.1em;
  flex: 0 0 30%;
  margin: 0;
  padding: 0;
}

.sidebar > div {
  background-color: hsl(0, 0%, 13%);
  border-radius: 4px;
  margin: 0 0 20px;
  padding: 10px 15px;
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2), 0 3px 20px rgba(0, 0, 0, 0.3);
}

.search-results {
  flex: 1 0 68%;
  margin: 0 0 20px 0;
}

.search-query,
.search-detail {
  color: hsl(0, 0%, 70%);
  line-height: 1.2;
}

#results-count {
  font-size: 0.9em;
  margin: 0 6px 0 0;
}

.search-query {
  flex: 1 1 auto;
  font-size: 1.5em;
}

.search-query-left {
  align-self: flex-end;
}

.search-query-right {
  flex: 0 1 auto;
  text-align: right;
  white-space: nowrap;
  align-self: flex-end;
}

.search-result-page-title {
  font-size: 1.4em;
  line-height: 1.2;
}

.search-detail {
  font-size: 1.4em;
}

.search-results ul {
  list-style: none;
  margin: 0 2em 0 0;
  padding: 0;
}

.search-results a {
  text-decoration: none;
}

.search-results p {
  font-size: 0.95em;
  color: hsl(0, 0%, 70%);
  line-height: 1.45;
  margin: 10px 0 0 0;
  word-wrap: break-word;
}

.search-result-item {
  background-color: hsl(0, 0%, 13%);
  padding: 20px;
  margin: 0 0 20px 0;
  border-radius: 4px;
  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2), 0 3px 20px rgba(0, 0, 0, 0.3);
}

.search-result-item p strong {
  color: hsl(0, 0%, 95%);
}

#search-header {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin: 0 2em 10px 0;
}

#query {
  color: hsl(0, 0%, 95%);
  font-weight: 700;
  margin: 0 0 0 3px;
}

@media screen and (max-width: 767px) {
  .wrapper {
    display: block;
  }

  .primary {
    margin: 0;
  }

  .sidebar {
    float: none;
    width: 100%;
    margin: 0 0 40px 0;
    padding: 20px 0;
    border-top: 2px dotted hsl(0, 0%, 50%);
  }

  #search-header {
    font-size: 0.85em;
    margin: 0 0 20px 0;
  }

  #clear-search-results-mobile {
    display: block;
    font-size: 1.3em;
    padding: 10px 15px;
    margin: 0 0 20px 0;
  }

  .search-results ul {
    margin: 0;
  }
}
```

## Render Search Results

Fair warning! This section is going to be lengthy since this is where I have created features and behaviors that are (as far as I have seen) distinct from other Lunr.js/Hugo implementations:

<ol id="unique-features" class="requirements teal">
  <li>The text blurb below the title of each search result is generated by an algorithm that finds sentences in the page content containing one or more search terms. All such sentences are added to the text blurb until the total word count of the blurb exceeds or is equal to a configurable maximum length. If the search term occurs sparingly, the text blurb will be short. There is no minimum length.</li>
  <li>Whenever a search term appears in the text blurb, it is displayed with <strong>bold font weight</strong>.</li>
  <li>The search result score is used to set the color of the search result page title. In the videos below, the first search result (i.e., the search result with the highest score) is displayed with a <span style="color: rgb(0, 255, 217); background-color: var(--widget-bg-color); padding: 2px 4px; margin: 0 1px; border-radius: 4px">teal font color</span>, and each subsequent page is displayed in a "cooler" color. The final search result (i.e., the lowest/worst score) is displayed in a <span style="color: rgb(0, 162, 255); background-color: var(--widget-bg-color); padding: 2px 4px; margin: 0 1px; border-radius: 4px">mid-dark blue color</span>.</li>
</ol>

You can see all of these features and compare the desktop and mobile user experience in the videos below.

<div class="vid-flex">
{{< autoplay_video video="search_results_desktop" device="desktop" >}}
{{< autoplay_video video="search_results_mobile" device="mobile" width="200px" >}}
</div>

### Create Search Result Blurb

Let's start with the code that generates the text blurb beneath each search result. Begin by adding **Lines 2-4** to `search.js`:

```javascript {linenos=table,hl_lines=["2-4"]}
let pagesIndex, searchIndex
const MAX_SUMMARY_LENGTH = 100
const SENTENCE_BOUNDARY_REGEX = /\b\.\s/gm
const WORD_REGEX = /\b(\w*)[\W|\s|\b]?/gm
```

<div class="code-details">
    <ul>
      <li>
        <p><strong>MAX_SUMMARY_LENGTH: </strong>Maximum length (in words) of each text blurb. You can change this value if you find that 100 is too short or too long for your taste.</p>
      </li>
      <li>
        <p><strong>SENTENCE_BOUNDARY_REGEX: </strong>Since the blurb is comprised of full sentences containing any search term, we need a way to identify where each sentence begins/ends. This regex will be used to produce a list of all sentences from the page content.</p>
      </li>
      <li>
        <p><strong>WORD_REGEX: </strong>This is a simple regex that produces a list of words from the text it is applied to. This will be used to check the number of total words in the blurb as it is being built.</p>
      </li>
    </ul>
</div>

Next, add the `createSearchResultBlurb` function to `search.js`:

```javascript {linenos=table,linenostart=92}
function createSearchResultBlurb(query, pageContent) {
  const searchQueryRegex = new RegExp(createQueryStringRegex(query), "gmi");
  const searchQueryHits = Array.from(
    pageContent.matchAll(searchQueryRegex),
    (m) => m.index
  );
  const sentenceBoundaries = Array.from(
    pageContent.matchAll(SENTENCE_BOUNDARY_REGEX),
    (m) => m.index
  );
  let searchResultText = "";
  let lastEndOfSentence = 0;
  for (const hitLocation of searchQueryHits) {
    if (hitLocation > lastEndOfSentence) {
      for (let i = 0; i < sentenceBoundaries.length; i++) {
        if (sentenceBoundaries[i] > hitLocation) {
          const startOfSentence = i > 0 ? sentenceBoundaries[i - 1] + 1 : 0;
          const endOfSentence = sentenceBoundaries[i];
          lastEndOfSentence = endOfSentence;
          parsedSentence = pageContent.slice(startOfSentence, endOfSentence).trim();
          searchResultText += `${parsedSentence} ... `;
          break;
        }
      }
    }
    const searchResultWords = tokenize(searchResultText);
    const pageBreakers = searchResultWords.filter((word) => word.length > 50);
    if (pageBreakers.length > 0) {
      searchResultText = fixPageBreakers(searchResultText, pageBreakers);
    }
    if (searchResultWords.length >= MAX_SUMMARY_LENGTH) break;
  }
  return ellipsize(searchResultText, MAX_SUMMARY_LENGTH).replace(
    searchQueryRegex,
    "<strong>$&</strong>"
  );
}
```

<p class="bold-italics">There is a lot to breakdown in this function, so bear with me and stay focussed!</p>

<div class="code-details">
    <ul>
      <li>
        <p><strong>Line 92: </strong>The important thing to note about the function definition is that <code>createSearchResultBlurb</code> requires two parameters: <code>query</code> and <code>pageContent</code>. <code>query</code> is the value entered by the user into the search form text box, and <code>pageContent</code> is the full text of the page that was returned as a match for the user's query.</p>
      </li>
      <li>
        <p><strong>Line 93: </strong>The first thing that we do is call <code>createQueryStringRegex</code>, providing <code>query</code> as the only argument. Add the code below to <code>search.js</code>:</p>
{{< highlight javascript "linenos=table,linenostart=130" >}}
function createQueryStringRegex(query) {
  const searchTerms = query.split(" ");
  if (searchTerms.length == 1) {
    return query;
  }
  query = "";
  for (const term of searchTerms) {
    query += `${term}|`;
  }
  query = query.slice(0, -1);
  return `(${query})`;
}
{{< / highlight >}}
        <p>This function creates a regular expression from the user's search query which is designed to find all occurrences of any term in the search query within any given piece of text. This regular expression is created by performing the following steps:</p>
        <ol class="requirements teal">
            <li>Call <code>query.split(" ")</code> to produce a list of search terms.</li>
            <li>If the query only contains a single search term, it is returned unmodified.</li>
            <li>Otherwise, the function iterates through the search terms and appends the <code>|</code> character to each word, creating a new string by concatenating the modified search terms.</li>
            <li>After iterating through all search terms, the final <code>|</code> character is removed from the concatenated string.</li>
            <li>The concatenated string is surrounded by parentheses to create a capturing group and this string is used as the return value.</li>
        </ol>
        <p>For example, if the user entered <span class="bold-text" style="color: var(--purple3)">vanilla javascript</span>, the <code>createQueryStringRegex</code> function would produce <span class="bold-text" style="color: var(--purple3)">(vanilla</span><span class="bold-text" style="color: var(--purple3); margin: 0 3px;">|</span><span class="bold-text" style="color: var(--purple3)">javascript)</span>. This is a very simple regular expression that finds either the word <span class="bold-text" style="color: var(--purple3)">vanilla</span> <span class="emphasis">OR</span> the word <span class="bold-text" style="color: var(--purple3)">javascript</span>.</p>
        <p>The string value returned from <code>createQueryStringRegex</code> is provided to the <code>RegExp</code> constructor, along with the global, multi-line and case-insensitive flags to create a <code>RegExp</code> object that is stored in the <code>searchQueryRegex</code> variable.</p>
      </li>
      <li>
        <p><strong>Lines 94-97: </strong><code>pageContent.matchAll(searchQueryRegex)</code> is called to produce an array containing the location of all occurrences of any search term within the page content. The list of search term locations is stored in the <code>searchQueryHits</code> variable.</p>
      </li>
      <li>
        <p><strong>Lines 98-101: </strong><code>pageContent.matchAll(SENTENCE_BOUNDARY_REGEX)</code> is called to produce an array containing the location of all period (<code>.</code>) characters that are followed by a whitespace character within the page content. The list of sentence boundary locations is stored in the <code>sentenceBoundaries</code> variable.</p>
      </li>
      <li>
        <p><strong>Line 102: </strong>The variable <code>searchResultText</code> is declared as an empty string.  Sentences from the page content containing search terms will be parsed and appended to this string, which will be used as the return value when all relevant sentences have been added or the maximum length for the search result text blurb has been reached.</p>
      </li>
      <li>
        <p><strong>Line 103: </strong>The variable <code>lastEndOfSentence</code> will be used to keep track of the location of the last sentence that was found containing a search term.</p>
      </li>
      <li>
        <p><strong>Line 104: </strong>We use a <code>for..of</code> loop to iterate through <code>searchQueryHits</code>, <code>hitLocation</code> is the current search term location.</p>
      </li>
      <li>
        <p><strong>Line 105: </strong>For each <code>hitLocation</code>, the first thing we do is make sure that the location of the search term occurs after the location of the last sentence boundary. If the location of the search term occurs before <code>lastEndOfSentence</code>, this means that the last sentence that was added to <code>searchResultText</code> contains multiple search terms. In that case, we move on to the next <code>hitLocation</code>.</p>
      </li>
      <li>
        <p><strong>Line 106: </strong>For each <code>hitLocation</code>, we iterate through the list of <code>sentenceBoundaries</code> using a traditional <code>for</code> loop. We use this type of loop because we need access to the index of the current item.</p>
      </li>
      <li>
        <p><strong>Line 107: </strong>We compare the <code>hitLocation</code> to the current <code>sentenceBoundary</code>. When the current <code>sentenceBoundary</code> is greater than <code>hitLocation</code>, we know that the current <code>sentenceBoundary</code> is the end of the sentence containing the <code>hitLocation</code>.</p>
      </li>
      <li>
        <p><strong>Lines 108-110: </strong>Since the current <code>sentenceBoundary</code> is the end of the sentence containing the <code>hitLocation</code>, the previous <code>sentenceBoundary</code> is the start of the sentence, these two locations are stored in the variables <code>endOfSentence</code> and <code>startOfSentence</code>, respectively. Also, we update <code>lastEndOfSentence</code> to be equal to the value of <code>endOfSentence</code>.</p>
      </li>
      <li>
        <p><strong>Lines 111: </strong>Using the locations <code>startOfSentence</code> and <code>endOfSentence</code>, we create a substring from <code>pageContent</code> and trim any leading/trailing whitespace, storing the string as <code>parsedSentence</code>.</p>
      </li>
      <li>
        <p><strong>Line 112: </strong>We append <code>parsedSentence</code> and an ellipsis (<code>...</code>) to the end of <code>searchResultText</code>.</p>
      </li>
      <li>
        <p><strong>Line 113: </strong>After parsing the sentence containing the <code>hitLocation</code> and updating <code>searchResultText</code> to include this sentence, we do not need to iterate through the list of <code>sentenceBoundaries</code> any longer, so we <code>break</code> out of the <code>for</code> loop.</p>
      </li>
      <li>
        <p><strong>Line 117: </strong>After we break out of the inner <code>for</code> loop, the first thing we do is call the <code>tokenize</code> function, providing <code>searchResultText</code> as the only argument. The code for this function is given below, add it to <code>search.js</code>:</p>
{{< highlight javascript "linenos=table,linenostart=143" >}}
function tokenize(input) {
  const wordMatches = Array.from(input.matchAll(WORD_REGEX), (m) => m);
  return wordMatches.map((m) => ({
    word: m[0],
    start: m.index,
    end: m.index + m[0].length,
    length: m[0].length,
  }));
}
{{< / highlight >}}
      <p>This function takes an <code>input</code> string and uses the <code>WORD_REGEX</code> regular expression to capture the individual words from the string. The return value is an array of objects containing (for each word) the word itself, the start/end indices where the word is located within the <code>input</code> string, and the length of the word.</p>
      <p>The <code>tokenize</code> function is called with the current value of <code>searchResultText</code>, storing the tokenized list of words in the <code>searchResultWords</code> variable.</p>
      </li>
      <li>
        <p><strong>Line 118: </strong>Next, we filter <code>searchResultWords</code> for all words that are longer than 50 characters and store the result in a variable named <code>pageBreakers</code>. The name should be a clue as to why we are filtering for these words, since extremely long words will fail to cause a line-break leading to layout issues with the page.</p>
      </li>
      <li>
        <p><strong>Lines 119-121: </strong>If <code>searchResultText</code> contains any words longer than 50 characters, they need to be broken into smaller pieces. This task is performed by calling the <code>fixPageBreakers</code> function. Add the code below to <code>search.js</code>:</p>
{{< highlight javascript "linenos=table,linenostart=153" >}}
function fixPageBreakers(input, largeWords) {
  largeWords.forEach((word) => {
    const chunked = chunkify(word.word, 20);
    input = input.replace(word.word, chunked);
  });
  return input;
}

function chunkify(input, chunkSize) {
  let output = "";
  let totalChunks = (input.length / chunkSize) | 0;
  let lastChunkIsUneven = input.length % chunkSize > 0;
  if (lastChunkIsUneven) {
    totalChunks += 1;
  }
  for (let i = 0; i < totalChunks; i++) {
    let start = i * chunkSize;
    let end = start + chunkSize;
    if (lastChunkIsUneven && i === totalChunks - 1) {
      end = input.length;
    }
    output += input.slice(start, end) + " ";
  }
  return output;
}
{{< / highlight >}}
      <p>I won't explain the <code>fixPageBreakers</code> and <code>chunkify</code> functions in great detail since they are fairly self-explanatory. The <code>largeWords</code> argument contains a list of extremely long words and we iterate through this list calling <code>chunkify</code> for each word.</p>
      <p><code>chunkify</code> accepts two arguments, a word that needs to be broken into chunks (<code>input</code>) and <code>chunkSize</code> which is the length of each chunk. The most important thing to note about <code>chunkify</code> is that the return value is a single string, not a list of "chunks". This string is constructed by concatenating the chunks into a single string, separated by space characters.</p>
      <p>The string returned from <code>chunkify</code> is used to replace the original really long word in the <code>input</code> string. After doing so for all words in <code>largeWords</code>, the <code>input</code> string (which no longer has any really long words) is returned.</p>
      </li>
      <li>
        <p><strong>Line 122: </strong>At this point we are still within the main <code>for</code> loop. Before beginning the next iteration, we check the length of <code>searchResultText</code> (in words). If the number of words is greater than or equal to the value <code>MAX_SUMMARY_LENGTH</code>, we break out of the <code>for</code> loop.</p>
      </li>
      <li>
        <p><strong>Line 124: </strong>After constructing <code>searchResultText</code>, the first thing we do is call <code>ellipsize</code>. The code for this function is given below, please add it to <code>search.js</code>:</p>
{{< highlight javascript "linenos=table,linenostart=179" >}}
function ellipsize(input, maxLength) {
  const words = tokenize(input);
  if (words.length <= maxLength) {
    return input;
  }
  return input.slice(0, words[maxLength].end) + "...";
}
{{< / highlight >}}
      <p>This function is very simple. It requires two parameters: an <code>input</code> string and a number (<code>maxLength</code>) which is the maximum number of words allowed in the <code>input</code> string. First, the <code>tokenize</code> function is called, which produces a list with an object for every word in the <code>input</code> string. If the number of words in <code>input</code> is less than or equal to <code>maxLength</code>, the original string is returned, unmodified.</p>
      <p>However, if the number of words is greater than <code>maxLength</code>, the string is truncated in an intelligent way. Using the <code>words</code> list produced by the <code>tokenize</code> function, we know that the last word that is allowed is <code>words[maxLength]</code>. The <code>end</code> property is the index of the last character of this word within the <code>input</code> string. This allows us to create a substring from the start of <code>input</code> to the location of the end of the last allowed word. The return value is the truncated string with an ellipsis appended (<code>...</code>).</p>
      </li>
      <li>
        <p><strong>Line 124-127: </strong>The last thing we do to <code>searchResultText</code> is call the <code>replace</code> method using the <code>searchQueryRegex</code> created earlier in <span class="bold-text">Line 85</span> as the first argument (this regular expression is designed to capture any search term entered by the user). Any matches in <code>searchResultText</code> for this regular expression will be replaced by the second argument, <code>'&lt;strong&gt;$&&lt;/strong&gt;'</code>. The special syntax <code>$&</code> represents the substring that matched the regular expression (i.e., the search term).</p>
        <p>Summarizing the above, calling the <code>replace</code> method finds all occurrences of any search term entered by the user within <code>searchResultText</code> and wraps the search term in a <code>&lt;strong&gt;</code> element. This will make all search terms appear in <span class="bold-text">bold font weight</span> when rendered as HTML.</p>
      </li>
    </ul>
</div>

If you are still here and you are still awake, that is seriously impressive! The `createSearchResultBlurb` function takes care of items #1 and #2 in [the list of features provided earlier](#unique-features), hopefully that makes the insane level of detail provided understandable.

### Polyfill `String.matchAll`

Before moving on to the next implementation detail, add the code below to <coee>search.js</coee>:

```javascript {linenos=table,linenostart=204}
if (!String.prototype.matchAll) {
  String.prototype.matchAll = function (regex) {
    "use strict";
    function ensureFlag(flags, flag) {
      return flags.includes(flag) ? flags : flags + flag;
    }
    function* matchAll(str, regex) {
      const localCopy = new RegExp(regex, ensureFlag(regex.flags, "g"));
      let match;
      while ((match = localCopy.exec(str))) {
        match.index = localCopy.lastIndex - match[0].length;
        yield match;
      }
    }
    return matchAll(this, regex);
  };
}
```

This is a polyfill for the `String.matchAll` method, which is available in most browsers but notably absent from mobile Safari 12, which is still used by a lot of devices. Adding this polyfill will make this method available to all browsers.

### Set Font Color Based on Search Result Score

The only item that has not been implemented is probably the most impactful feature, at least visually. This feature uses the search result score to set the color of the search result page title, producing a gradient effect of <span style="color: rgb(0, 255, 217); background-color: var(--widget-bg-color); padding: 2px 4px; margin: 0 1px; border-radius: 4px">warm</span> to <span style="color: rgb(0, 162, 255); background-color: var(--widget-bg-color); padding: 2px 4px; margin: 0 1px; border-radius: 4px">cool</span> color to communicate which results are determined to be higher- and lower-quality.

Add the code below to `search.js`:

```javascript {linenos=table,linenostart=187}
function getColorForSearchResult(score) {
  const highQualityHue = 171;
  const lowQualityHue = 212;
  return adjustHue(highQualityHue, lowQualityHue, score);
}

function adjustHue(hue1, hue2, score) {
  if (score > 3) return `hsl(${hue1}, 100%, 50%)`;
  const hueAdjust = (parseFloat(score) / 3) * (hue1 - hue2);
  const newHue = hue2 + Math.floor(hueAdjust);
  return `hsl(${newHue}, 100%, 50%)`;
}
```

The `getColorForSearchResult` function requires a single argument, `score`, which is the Lunr.js score for a single search result. If you remember <a href="#lunrjs-score">way back when we created the `searchSite` function</a>, this is a numeric value that describes the quality of the search result.

Also within `getColorForSearchResult`, we define two values: `warmColorHue` and `coolColorHue`. These values are used for the **hue** component of a HSL color value. If you are unfamiliar with HSL colors, I wholeheartedly recommend using them instead of RBG colors since the individual components are much easier to understand and manipulate through code. [A quick definition of these components is given below](https://css-tricks.com/hsl-hsla-is-great-for-programmatic-color-control/):

> * **Hue**: Think of a color wheel. Around 0&deg; and 360&deg; are reds. 120&deg; is where greens are and 240&deg; are blues. Use anything in between 0-360. Values above and below will be modulus 360.
> * **Saturation**: 0% is completely desaturated (grayscale). 100% is fully saturated (full color).
> * **Lightness**: 0% is completely dark (black). 100% is completely light (white). 50% is average lightness.

Given the definitions above, we can easily modify a color simply by adjusting the hue component. The `adjustHue` function leaves both saturation and lightness components untouched at 100% and 50%, respectively, in order to produce fully saturated colors with average lightness.

From my observations of the search results produced by the Lunr.js implementation on this site, the vast majority of search result scores are in the range 0-3. For this reason, if a search result score is greater than 3, we do not perform any calculations to adjust the hue and simply return a HSL color using the `warmColorHue` value.

However, if the score is less than 3, we will adjust the hue and produce an HSL color that gradually becomes "cooler". As the score approaches zero, the color becomes closer to the `coolColorHue` value.

### Tieing it All Together

You may be wondering, where is the code that calls the `createSearchResultBlurb` and `getColorForSearchResult` functions? IMO, it is much easier to understand how these functions are designed when they are presented on their own. Now, we will close the loop and create the code that uses these functions.

First, add the highlighted line below to the `handleSearchQuery` function:

```javascript {linenos=table,linenostart=33,hl_lines=[13]}
function handleSearchQuery(event) {
  event.preventDefault()
  const query = document.getElementById("search").value.trim().toLowerCase()
  if (!query) {
    displayErrorMessage("Please enter a search term")
    return
  }
  const results = searchSite(query)
  if (!results.length) {
    displayErrorMessage("Your search returned no results")
    return
  }
  renderSearchResults(query, results)
}
```

The `handleSearchQuery` function is called when the user submits a search query. If the query returned any results, the `renderSearchResults` function is called using the query string entered by the user and the list of search results.

Obviously, we need to implement the `renderSearchResults` function. Next, add the following functions to `search.js` (In other words, add the code that is highlighted below):

* `renderSearchResults`
* `clearSearchResults`
* `updateSearchResults`
* `showSearchResults`
* `scrollToTop`

```javascript {linenos=table,linenostart=93,hl_lines=["1-31","128-145"]}
function renderSearchResults(query, results) {
  clearSearchResults();
  updateSearchResults(query, results);
  showSearchResults();
  scrollToTop();
}

function clearSearchResults() {
  const results = document.querySelector(".search-results ul");
  while (results.firstChild) results.removeChild(results.firstChild);
}

function updateSearchResults(query, results) {
  document.getElementById("query").innerHTML = query;
  document.querySelector(".search-results ul").innerHTML = results
    .map(
      (hit) => `
    <li class="search-result-item" data-score="${hit.score.toFixed(2)}">
      <a href="${hit.href}" class="search-result-page-title">${hit.title}</a>
      <p>${createSearchResultBlurb(query, hit.content)}</p>
    </li>
    `
    )
    .join("");
  const searchResultListItems = document.querySelectorAll(".search-results ul li");
  document.getElementById("results-count").innerHTML = searchResultListItems.length;
  document.getElementById("results-count-text").innerHTML = searchResultListItems.length > 1 ? "results" : "result";
  searchResultListItems.forEach(
    (li) => (li.firstElementChild.style.color = getColorForSearchResult(li.dataset.score))
  );
}

function createSearchResultBlurb(query, pageContent) {
  const searchQueryRegex = new RegExp(createQueryStringRegex(query), "gmi");
  const searchQueryHits = Array.from(
    pageContent.matchAll(searchQueryRegex),
    (m) => m.index
  );
  const sentenceBoundaries = Array.from(
    pageContent.matchAll(SENTENCE_BOUNDARY_REGEX),
    (m) => m.index
  );
  let searchResultText = "";
  let lastEndOfSentence = 0;
  for (const hitLocation of searchQueryHits) {
    if (hitLocation > lastEndOfSentence) {
      for (let i = 0; i < sentenceBoundaries.length; i++) {
        if (sentenceBoundaries[i] > hitLocation) {
          const startOfSentence = i > 0 ? sentenceBoundaries[i - 1] + 1 : 0;
          const endOfSentence = sentenceBoundaries[i];
          lastEndOfSentence = endOfSentence;
          parsedSentence = pageContent.slice(startOfSentence, endOfSentence).trim();
          searchResultText += `${parsedSentence} ... `;
          break;
        }
      }
    }
    const searchResultWords = tokenize(searchResultText);
    const pageBreakers = searchResultWords.filter((word) => word.length > 50);
    if (pageBreakers.length > 0) {
      searchResultText = fixPageBreakers(searchResultText, pageBreakers);
    }
    if (searchResultWords.length >= MAX_SUMMARY_LENGTH) break;
  }
  return ellipsize(searchResultText, MAX_SUMMARY_LENGTH).replace(
    searchQueryRegex,
    "<strong>$&</strong>"
  );
}

function createQueryStringRegex(query) {
  const searchTerms = query.split(" ");
  if (searchTerms.length == 1) {
    return query;
  }
  query = "";
  for (const term of searchTerms) {
    query += `${term}|`;
  }
  query = query.slice(0, -1);
  return `(${query})`;
}

function tokenize(input) {
  const wordMatches = Array.from(input.matchAll(WORD_REGEX), (m) => m);
  return wordMatches.map((m) => ({
    word: m[0],
    start: m.index,
    end: m.index + m[0].length,
    length: m[0].length,
  }));
}

function fixPageBreakers(input, largeWords) {
  largeWords.forEach((word) => {
    const chunked = chunkify(word.word, 20);
    input = input.replace(word.word, chunked);
  });
  return input;
}

function chunkify(input, chunkSize) {
  let output = "";
  let totalChunks = (input.length / chunkSize) | 0;
  let lastChunkIsUneven = input.length % chunkSize > 0;
  if (lastChunkIsUneven) {
    totalChunks += 1;
  }
  for (let i = 0; i < totalChunks; i++) {
    let start = i * chunkSize;
    let end = start + chunkSize;
    if (lastChunkIsUneven && i === totalChunks - 1) {
      end = input.length;
    }
    output += input.slice(start, end) + " ";
  }
  return output;
}

function ellipsize(input, maxLength) {
  const words = tokenize(input);
  if (words.length <= maxLength) {
    return input;
  }
  return input.slice(0, words[maxLength].end) + "...";
}

function showSearchResults() {
  document.querySelector(".primary").classList.add("hide-element");
  document.querySelector(".search-results").classList.remove("hide-element");
  document.getElementById("site-search").classList.add("expanded");
  document.getElementById("clear-search-results-sidebar").classList.remove("hide-element");
}

function scrollToTop() {
  const toTopInterval = setInterval(function () {
    const supportedScrollTop = document.body.scrollTop > 0 ? document.body : document.documentElement;
    if (supportedScrollTop.scrollTop > 0) {
      supportedScrollTop.scrollTop = supportedScrollTop.scrollTop - 50;
    }
    if (supportedScrollTop.scrollTop < 1) {
      clearInterval(toTopInterval);
    }
  }, 10);
}

function getColorForSearchResult(score) {
  const warmColorHue = 171;
  const coolColorHue = 212;
  return adjustHue(warmColorHue, coolColorHue, score);
}

function adjustHue(hue1, hue2, score) {
  if (score > 3) return `hsl(${hue1}, 100%, 50%)`;
  const hueAdjust = (parseFloat(score) / 3) * (hue1 - hue2);
  const newHue = hue2 + Math.floor(hueAdjust);
  return `hsl(${newHue}, 100%, 50%)`;
}
```

I included the code for the `createSearchResultBlurb` and `getColorForSearchResult` functions (and all functions they rely on), in case there was any confusion about the layout/structure I am using for `search.js`.

<div class="code-details">
    <ul>
      <li>
        <p><strong>Lines 94-97: </strong>The algorithm of the <code>renderSearchResults</code> function can be quickly understood just by reading the names of the functions that are called. The steps performed in order to render the results are given below:</p>
        <ol class="requirements teal">
          <li>First, results from the previous search request are cleared.</li>
          <li>Second, the list of search results is updated with the results from the current search request.</li>
          <li>Next, the <code>&lt;div class="primary"&gt;</code> element containing the page content will be hidden (by adding the <code>hide-element</code> class) and the search results will be shown in their place (by removing the <code>hide-element</code> class).</li>
          <li>Finally, the page is automatically scrolled to the top of the page (this is done for mobile devices since the search form is placed at the bottom of the page).</li>
        </ol>
      </li>
      <li>
        <p><strong>Lines 100-103: </strong>Since the search results are rendered as <code>li</code> elements, we clear the list by querying for the <code>ul</code> element they belong to. All <code>li</code> elements are removed from the <code>ul</code> element using a <code>while</code> loop.</p>
      </li>
      <li>
        <p><strong>Line 106: </strong>The first thing we do in the <code>updateSearchResults</code> function is populate a <code>span</code> element above the list of search results to display the search query entered by the user (<a href="#create-search-results-html-template">click here to see the search results HTML template</a>, the <code>query</code> element is in the <code>search-header</code> <code>div</code> element).</p>
      </li>
      <li>
        <p><strong>Lines 107-108: </strong>We populate the list by first querying for the <code>ul</code> element within the search results HTML template. Then, we set the <code>innerHTML</code> value of this element to the text string returned from the <code>results.map</code> method call.</p>
      </li>
      <li>
        <p><strong>Lines 109-110: </strong><code>hit</code> is the current search result that the <code>map</code> method is acting upon in order to construct an HTML representation of a search result. Each search result is represented as a <code>li</code> element that contains two child elements, the title of the page as a clickable link and a paragraph of text generated by the <code>createSearchResultBlurb</code> function.
{{< alert_box >}}
<span class="bold-text">PLEASE NOTE</span> that we are defining a attribute on each <code>li</code> element named <code>data-score</code> and setting the value equal to <code>hit.score</code>, which is the Lunr.js score for the quality of the search result.
{{< /alert_box >}}
        </p>
      </li>
      <li>
        <p><strong>Line 111: </strong>In order to create the page title as a clickable link, first we set the <code>href</code> attribute to the value of <code>hit.href</code>. Next, by using <code>hit.title</code> as the <code>innerHTML</code> value of the <code>a</code> element, the title of the page will be used as the link text.</p>
      </li>
      <li>
        <p><strong>Line 112: </strong>The second child element is created simply by wrapping the text returned from the <code>createSearchResultBlurb</code> function inside a <code>p</code> element.</p>
      </li>
      <li>
        <p><strong>Line 116: </strong>After the <code>map</code> method has iterated through all search results, it returns a list of strings where each list item is the raw HTML for a <code>li</code> element. The <code>join</code> method of this list is called to convert the list into a single string of raw HTML which is set as the <code>innerHTML</code> value of the search results <code>ul</code> element.</p>
      </li>
      <li>
        <p><strong>Line 117: </strong>After generating raw HTML for the search results, we query for all <code>li</code> elements that are children of the search results <code>ul</code> element and store the result in the <code>totalSearchResults</code> variable.</p>
      </li>
      <li>
        <p><strong>Lines 118-119: </strong><a href="#create-search-results-html-template">In the search results HTML template</a>, we created placeholder <code>span</code> elements to display the number of results found above the list of search results. To populate these with the correct values, we find these elements by ID and set the value for each using the <code>totalSearchResults</code> variable.</p>
      </li>
      <li>
        <p><strong>Lines 120-122: </strong>The last thing we do in the <code>updateSearchResults</code> function is the most important &mdash; we finally change the color of the search result page title using the <code>getColorForSearchResult</code> function.</p>
        <p>To do so, we iterate through the <code>li</code> elements in <code>searchResultListItems</code>. For each <code>li</code> element, the page title can be accessed with <code>li.firstElementChild</code>. Also, because we created the <code>data-score</code> attribute on each <code>li</code> element, we can access this value from the <code>dataset</code> object as <code>li.dataset.score</code>.</p>
{{< info_box >}}
If you are unfamiliar with data attributes, they are easy to use and extremely useful. <a href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes/#JavaScript_access">Click here for an MDN article explaining what they are and how to use them.</a>
{{< /info_box >}}
      </li>
      <li>
        <p><strong>Lines 221-224: </strong>After constructing the list of search results in HTML, we need to actually display them since the entire <code>&lt;section class="search-results"&gt;</code> element is hidden when the page initially loads due to the <code>hide-element</code> class.</p>
        <p>The <code>showSearchResults</code> function adds the <code>hide-element</code> class to the <code>&lt;div class="primary"&gt;</code> element (which contains the regular page content) and removes the <code>hide-element</code> class from <code>&lt;section class="search-results"&gt;</code>, displaying them in place of the regular page content.</p>
        <p>The <span class="bold-text">Clear Search Results</span> buttons below the search form text box and above the list of search results are also displayed, which allows the user to restore the page to normal.</p>
      </li>
      <li>
        <p><strong>Lines 227-237: </strong>Finally, after the regular page content has been hidden and the list of search results is displayed, the page automatically scrolls to the top. This is done solely for mobile users, since the search form is displayed at the bottom of the page if the screen width is less than 767px.</p>
        <p>Without the <code>scrollToTop</code> function, when a mobile user submits a search query, they would have to manually scroll to the top in order to see the first (i.e., the highest-quality) search result. You can see the scroll-to-top behavior in <a href="#vid-search_results_mobile">the video demonstrating the mobile search UX from the beginning of this section</a>.</p>
      </li>
    </ul>
</div>

### Clear Search Results

Finally, we need a way to clear the search results and display the page content when the user clicks the **Clear Search Results** button. To do so, add the lines highlighted below to `search.js`:

```javascript {linenos=table,linenostart=252,hl_lines=["1-12","29-33"]}
function handleClearSearchButtonClicked() {
  hideSearchResults();
  clearSearchResults();
  document.getElementById("search").value = "";
}

function hideSearchResults() {
  document.getElementById("clear-search-results-sidebar").classList.add("hide-element");
  document.getElementById("site-search").classList.remove("expanded");
  document.querySelector(".search-results").classList.add("hide-element");
  document.querySelector(".primary").classList.remove("hide-element");
}

initSearchIndex()
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("search-form") != null) {
    const searchInput = document.getElementById("search")
    searchInput.addEventListener("focus", () => searchBoxFocused())
    searchInput.addEventListener("keydown", (event) => {
      if (event.keyCode == 13) handleSearchQuery(event)
    })
    document
      .querySelector(".search-error")
      .addEventListener("animationend", removeAnimation)
    document
      .querySelector(".fa-search")
      .addEventListener("click", (event) => handleSearchQuery(event))
  }
  document
    .querySelectorAll(".clear-search-results")
    .forEach((button) =>
      button.addEventListener("click", () => handleClearSearchButtonClicked())
    )
})
```

<div class="code-details">
    <ul>
      <li>
        <p><strong>Lines 252-256: </strong>The <code>handleClearSearchButtonClicked</code> function is called when the user clicks one of the <span class="bold-text">Clear Search Results</span> buttons. When this occurs, the <code>hideSearchResults</code> function is called first, which hides the search results and un-hides the regular page content (restoring the page to the normal state). Then, the <code>clearSearchResults</code> function is called (this was already defined and explained), and finally any value in the search input text box is cleared.</p>
      </li>
      <li>
        <p><strong>Lines 258-263: </strong>The <code>hideSearchResults</code> function performs the exact opposite set of steps that the <code>showSearchResults</code> function performs. The <span class="bold-text">Clear Search Results</span> buttons are hidden, the <code>&lt;section class="search-results"&gt;</code> element is hidden, and the <code>hide-element</code> class is removed from the <code>&lt;div class="primary"&gt;</code> element (which contains the regular page content).</p>
      </li>
      <li>
        <p><strong>Lines 280-284: </strong>Since there are two <span class="bold-text">Clear Search Results</span> buttons, we can add an event listener for the <code>click</code> event to each by querying for all elements with the <code>clear-search-results</code> class, iterating over the result and assigning the <code>handleClearSearchButtonClicked</code> function as the event handler.</p>
      </li>
    </ul>
</div>

## Conclusion

I hope this post was helpful to you, if you have any questions please leave a comment. Remember, you can view the full, finished CSS and JS using <a href="#codepen-with-final-code">the CodePen I embedded earlier</a>.
