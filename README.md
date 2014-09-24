# latex-to-unicode.js

Convert LaTeX strings to unicode.

### Installing

Install via `npm`.

```sh
npm install latex-to-unicode
```

### Usage

```js
var latexToUnicode = require('latex-to-unicode');

latexToUnicode('\frak{A} + \\alpha = 3')
// > 𝔄 + α = 3
```

### Credits

This is a Node port of [latex-to-unicode](https://github.com/ypsu/latex-to-unicode)
by [@ypsu](https://github.com/ypsu).
