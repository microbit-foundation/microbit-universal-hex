---
layout: default
title: Quick Guide
---

# Quick Guide

## npm package

You can integrate this library in your project using the [npm package](https://www.npmjs.com/package/@microbit/microbit-universal-hex):

```bash
npm install @microbit/microbit-universal-hex
```

## Usage

To create a Universal Hex from two Intel Hex strings, use {@link createUniversalHex}.

Implementation for [Universal Hex Creator demo](./examples/webtool.html) can be found in [webtool.html](https://github.com/microbit-foundation/microbit-universal-hex/blob/main/docs/examples/webtool.html) file.

```js
import * as microbitUh from '@microbit/microbit-universal-hex';

const universalHex = microbitUh.createUniversalHex([
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

To separate a Universal Hex into its Intel Hex strings, use {@link separateUniversalHex}.

Implementation example for [Universal Hex Separator demo](./examples/separate.html) can be found in the [seperate.html](https://github.com/microbit-foundation/microbit-universal-hex/blob/main/docs/examples/separate.html) file.

```js
import * as microbitUh from '@microbit/microbit-universal-hex';

if (microbitUh.isUniversalHex(intelHexStr)) {
  const separatedBinaries = microbitUh.separateUniversalHex(intelHexStr);
  separatedBinaries.forEach(function (hexObj) {
    console.log(hexObj.boardId);
    console.log(hexObj.hex);
  });
}
```

See [Universal Hex Splitter demo](./examples/separate.html) for example.
