---
layout: default
title: Quick Guide
nav_order: 2
---

# Quick Guide

## ES5 UMD Bundle

Download the UMD bundle from the
[latest GitHub release](https://github.com/microbit-foundation/microbit-universal-hex/releases/latest)
and add it to the page:

```html
<script src="microbit-uh.umd.min.js"></script>
```

Then to create a Universal Hex from two Intel Hex strings:

```js
var universalHex = microbitUh.createUniversalHex([
  {
    hex: intelHexStringV1,
    boardId: microbitUh.microbitBoardId.V1,
  },
  {
    hex: intelHexStringV2,
    boardId: microbitUh.microbitBoardId.V2,
  },
]);
```

Separate a Universal Hex into its Intel Hex strings:

```js
if (microbitUh.isUniversalHex(intelHexStr)) {
  var separatedBinaries = microbitUh.separateUniversalHex(intelHexStr);
}
separatedBinaries.forEach(function (hexObj) {
  console.log(hexObj.boardId);
  console.log(hexObj.hex);
});
```

## npm package

You can integrate this library in your project using the npm package:
[https://www.npmjs.com/package/@microbit/microbit-universal-hex](https://www.npmjs.com/package/@microbit/microbit-universal-hex)

For information on how to use this library check the API documentation.
