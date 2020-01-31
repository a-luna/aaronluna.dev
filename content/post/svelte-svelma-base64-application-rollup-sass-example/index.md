---
title: "Codesandbox: Base64 Visualizer Created with Svelte + Svelma"
slug: "svelte-svelma-base64-application-rollup-sass-example"
date: "2020-01-30"
categories: ["svelte", "Javascript"]
summary: "This is a simple application I created using svelte 3.0, that encodes/decodes ASCII text or hex strings to/from base64 and provides reactive ui components to help illustrate the encoding process."
resources:
  - name: cover
    src: images/cover.jpg
    params:
      credit: "Photo by Joshua Sortino on Unsplash"
---
This is a simple application that encodes/decodes ASCII text or hex strings to/from base64 and provides reactive UI components to help illustrate the encoding process.

- ### Base64 Encoder/Decoder

  - Input/output strings displayed in hex, decimal, binary, and base64 to demonstrate how input bytes are encoded to base64
  - Mouseover/touch any part of the Hex/Base64 output to highlight all related bit groups and the matching base64/ASCII characters in the Lookup Tables
  - Hex strings must contain only numbers and/or upper and lowercase hex digits (a-f, A-F, 0-9)
  - Hex strings can be prefixed by "0x", but not required
  - Encoded strings must be valid [base64 (standard)](https://tools.ietf.org/html/rfc4648#section-4) or [base64url (url/filename safe)](https://tools.ietf.org/html/rfc4648#section-5) values

- ### CSS Preprocessing

  - [Svelte 3](https://github.com/sveltejs/svelte) + [Svelma](https://github.com/c0bra/svelma) integrated via [`svelte-preprocess`](https://github.com/kaisermann/svelte-preprocess)
    - Svelma is a set of UI components for Svelte based on the Bulma CSS framework.
  - [Bulma CSS](https://github.com/jgthms/bulma)/FontAwesome 5 integrated via [`node-sass`](https://github.com/sass/node-sass)

- ### Rollup & Plugins Config

  - Configured to process and minify SASS/SCSS files and copy to`public/build` folder (`node-sass`, `postcss`/`cssnano`)
  - Configured to copy FA font files from `node_modules` folder and copy to `public` folder
  - Configured to minify entire bundle when building for production
  - [resolve](https://www.npmjs.com/package/@rollup/plugin-node-resolve), [commonjs](https://www.npmjs.com/package/@rollup/plugin-commonjs), and [terser](https://github.com/TrySound/rollup-plugin-terserhttps://github.com/TrySound/rollup-plugin-terser) rollup plugins configured

- ### Tests

  - Cypress E2E tests created for basic encode/decode scenarios
  - 1/5 test cases is failing due to bug that can not be reproduced outside of Cypress
  - 5 test cases are each executed with 4 different screen types/orientations
  - Input and expected output for both ASCII and Hex strings taken directly from the [Examples and Illustrations](https://tools.ietf.org/html/rfc4648#section-9) and [Test Vectors](https://tools.ietf.org/html/rfc4648#section-10) sections of RFC4648 which is the original specification for Base64 and other print-safe binary encodings

I've embedded the application below, you can easily view and fork it on codesandbox:

<div class="cs-embed-wrapper">
  <div class="cs-embed">
    <iframe
        src="https://codesandbox.io/embed/github/a-luna/svelte-base64?codemirror=1&fontsize=12&hidenavigation=1&theme=dark&view=preview"
        style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
        title="svelte-base64"
        allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
        sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
      ></iframe>
  </div>
</div>
