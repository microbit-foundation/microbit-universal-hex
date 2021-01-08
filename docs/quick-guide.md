---
layout: default
title: Quick Guide
nav_order: 2
---

# Quick Guide

## ES5 UMD Bundle

Create a Universal Hex from two Intel Hex strings:

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
