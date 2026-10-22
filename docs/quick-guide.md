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

See the [Universal Hex Creator demo](https://microbit-foundation.github.io/microbit-universal-hex/examples/webtool.html) ([source](https://github.com/microbit-foundation/microbit-universal-hex/blob/main/docs/examples/webtool.html)).

```js
import {
  createUniversalHex,
  microbitBoardId,
} from '@microbit/microbit-universal-hex';

const universalHex = createUniversalHex([
  { hex: intelHexStringV1, boardId: microbitBoardId.V1 },
  { hex: intelHexStringV2, boardId: microbitBoardId.V2 },
]);
```

To separate a Universal Hex into its Intel Hex strings, use {@link separateUniversalHex}.

See the [Universal Hex Splitter demo](https://microbit-foundation.github.io/microbit-universal-hex/examples/separate.html) ([source](https://github.com/microbit-foundation/microbit-universal-hex/blob/main/docs/examples/separate.html)).

```js
import {
  isUniversalHex,
  separateUniversalHex,
} from '@microbit/microbit-universal-hex';

if (isUniversalHex(intelHexStr)) {
  for (const { boardId, hex } of separateUniversalHex(intelHexStr)) {
    console.log(boardId);
    console.log(hex);
  }
}
```
