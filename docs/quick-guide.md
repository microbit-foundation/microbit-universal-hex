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

See [Universal Hex Creator demo](./examples/webtool.html) for example.

Separate a Universal Hex into its Intel Hex strings, use {@link separateUniversalHex}

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
