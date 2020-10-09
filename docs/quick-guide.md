---
layout: default
title: Quick Guide
nav_order: 2
---

# Quick Guide

## ES5 UMD Bundle

```js
var universalHex = microbitUh.createUniversalHex([
  {
    hex: intelHexString1,
    boardId: 0x1,
  },
  {
    hex: intelHexString2,
    boardId: 0x2,
  },
]);

if (microbitUh.isUniversalHex(intelHexStr)) {
  var separatedBinaries = microbitUh.separateUniversalHex(intelHexStr);
}
separatedBinaries.forEach(function (hexObj) {
  console.log(hexObj.boardId);
  console.log(hexObj.hex);
});
```
