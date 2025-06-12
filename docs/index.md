---
layout: default
title: Home
homepage: true
permalink: /
nav_order: 1
---

# micro:bit Universal Hex

<img alt="microbit-universal-hex logo" src="img/microbit-uh-logo.png" width="300px">

## Introduction

Create Universal Hex files for the micro:bit.

This is the documentation for the micro:bit Universal Hex library.

Here you will find the available public API to convert Intel Hex strings into Universal Hex strings and vice-versa.

## Getting started

Read the [Quick guide](quick-guide.md).

## Universal Hex format

The micro:bit Universal Hex format is a superset of the
[Intel Hex file format](https://en.wikipedia.org/wiki/Intel_HEX) designed to be
able to include data for multiple targets into a single file. A Universal Hex file can contain the binary data for multiple micro:bit
board versions. This allows the creation of a hex file that will work on micro:bit V1 and V2.

Detailed information of the Universal Hex format can be found in the [specification](https://github.com/microbit-foundation/spec-universal-hex).

This TypeScript/JavaScript library can be used to create a
micro:bit Universal Hex from two or more micro:bit Intel Hex files.

## Web tool

This [Universal Hex Creator web tool](https://tech.microbit.org/software/universal-hex-creator/) can
generate a Universal Hex from two Intel Hex files (one for micro:bit V1 and another for micro:bit V2).

An implementation example can be found in the [webtool.html](https://github.com/microbit-foundation/microbit-universal-hex/blob/main/docs/examples/webtool.html) file, which produces this [Universal Hex Creator demo](./examples/webtool.html).

An implementation example showing the reverse process of separating a Universal Hex into individual Intel Hex files can be found in the [seperate.html](https://github.com/microbit-foundation/microbit-universal-hex/blob/main/docs/examples/separate.html) file. It produces this [Universal Hex Separator demo](./examples/separate.html).

## Related documentation

- [micro:bit Universal Hex Specification](https://github.com/microbit-foundation/spec-universal-hex) contains a lot more information
  about the file data format.

- [GitHub](https://microbit-foundation.github.io/microbit-universal-hex/) contains general documentation for this
  library.

- [The micro:bit Tech Site](https://tech.microbit.org) contains general technical information about the micro:bit.

## License

This documentation, as well as the rest of the source files located in the
https://github.com/microbit-foundation/microbit-universal-hex repository, is
released under the MIT open source license.

SPDX-License-Identifier: MIT
