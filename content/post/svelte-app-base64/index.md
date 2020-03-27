---
title: "My First Svelte Application: Base64 Encoder/Decoder"
slug: "svelte-app-base64"
date: "2020-01-30"
aliases:
    - /blog/svelte-svelma-base64-rollup-global-sass/
menu_section: "blog"
categories: ["svelte", "Javascript"]
summary: "This is a simple application I created using svelte 3.0, that encodes/decodes ASCII text or hex strings to/from base64 and provides reactive ui components to help illustrate the encoding process."
resources:
  - name: cover
    src: images/cover.jpg
    params:
      credit: "Photo by Joshua Sortino on Unsplash"
  - name: cypress
    src: media/base64.js.mp4
    title: Automated Cypress Tests (4 Tests on 2 Screen Sizes Shown)
---
I am currently teaching myself svelte and I have enjoyed pretty much everything about it. I decided to create a simple application that encodes ASCII text or hex strings to base64, and vice-versa. In order to take advantage of svelte's strengths, the application contains reactive UI components to help illustrate the encoding process.

<div class="hero-buttons">
  <a href="https://aaronluna.dev/base64" target="_blank">Launch App</a>
  <a href="https://github.com/a-luna/svelte-base64" target="_blank">View Github Repo</a>
</div>

I deployed this project to Netlify (click the **Launch App** button above to open the application in a new tab/window). I also included a button to view/fork the project with codesandbox (below), please feel free to <a href="https://github.com/a-luna/svelte-base64/issues" target="_blank">log a github issue</a> if you find any bugs. Thank you!

<div class="cs-embed-buttons">
  <a href="https://codesandbox.io/s/github/a-luna/svelte-base64/tree/master/?fontsize=12&hidenavigation=1&theme=dark" target="_blank">
    <img alt="Edit svelte-base64" src="https://codesandbox.io/static/img/play-codesandbox.svg">
  </a>
</div>


## Base64 Encoder/Decoder

- Input/output strings displayed in hex, decimal, binary, and base64 to demonstrate how input bytes are encoded to base64.
- Mouseover/touch any part of the Hex/Base64 output to highlight all related bit groups and the matching base64/ASCII characters in the Lookup Tables.
- Hex strings must contain only numbers and/or upper and lowercase hex digits (a-f, A-F, 0-9).
- Hex strings can be prefixed by "0x", but this is **not** required.
  - e.g., `0xFE` and `FE` both represent the value 254 and both will produce the same output when encoded to base64
- Encoded strings must be valid [base64 (standard)](https://tools.ietf.org/html/rfc4648#section-4) or [base64url (url/filename safe)](https://tools.ietf.org/html/rfc4648#section-5) values
- If a decoded string is composed entirely of ASCII-printable characters, it will be rendered as text.
- If a decoded string contains a single byte that is outside of the range of ASCII-printable characters (`0x20` - `0x7E`), the entire string will be rendered as hex digits.

## CSS Preprocessing & Rollup Config

- [Svelte 3](https://github.com/sveltejs/svelte) + [Svelma](https://github.com/c0bra/svelma) integrated via [`svelte-preprocess`](https://github.com/kaisermann/svelte-preprocess).
  - Svelma is a set of UI components for Svelte based on the Bulma CSS framework.
- [Bulma](https://github.com/jgthms/bulma)/FontAwesome 5 integrated via [`node-sass`](https://github.com/sass/node-sass)
- SASS/SCSS files are bundled and copied to `public/build` folder (`node-sass`, `postcss`/`cssnano`).
- FontAwesome font files are copied from from `node_modules` folder to `public/webfonts` folder.
- When building for production, bundled CSS and JS files are minified.
- [resolve](https://www.npmjs.com/package/@rollup/plugin-node-resolve), [commonjs](https://www.npmjs.com/package/@rollup/plugin-commonjs), and [terser](https://github.com/TrySound/rollup-plugin-terserhttps://github.com/TrySound/rollup-plugin-terser) rollup plugins configured.

## Tests

- Cypress E2E tests created for basic encode/decode scenarios.
- 5 test cases are each executed with 4 different screen types/orientations.
- Input and expected output for both ASCII and Hex strings taken directly from the [Examples and Illustrations](https://tools.ietf.org/html/rfc4648#section-9) and [Test Vectors](https://tools.ietf.org/html/rfc4648#section-10) sections of RFC4648 which is the original specification for Base64 and other print-safe binary encodings.
- Github action configured to run all Cypress tests on each push to master branch, build is deployed only if all tests pass.

{{< autoplay_video cypress >}}
