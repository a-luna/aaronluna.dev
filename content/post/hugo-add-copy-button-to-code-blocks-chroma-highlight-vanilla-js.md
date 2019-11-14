---
title: "Hugo: Add Copy-to-Clipboard Button to Code Blocks with Vanilla JS"
slug: "hugo-add-copy-button-to-code-blocks-chroma-highlight-vanilla-js"
date: "2019-11-13"
categories: ["Hugo", "JavaScript"]
draft: true
---

I am currently working on a multi-part tutorial series that

The <a href="https://gohugo.io/content-management/syntax-highlighting/" target="_blank">Hugo highlight shortcode</a> accepts a "line-nos" parameter. If "line-nos" is not specified or "line-nos=inline", the rendered HTML has this structure:

```html
  <div class="highlight">
    <pre class="chroma">
      <code class="language-xxxx">
        (your code! it yearns to be copied and pasted)
      </code>
    </pre>
  </div>
```

If "line-nos=table", the rendered HTML is slightly more complicated:
