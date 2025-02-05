---
layout: default
title: Home
homepage: true
permalink: /
nav_order: 1
---

# micro:bit Universal Hex

<img alt="microbit-universal-hex logo" src="img/microbit-uh-logo.png" width="300px">

Create Universal Hex files for the micro:bit.

This is the documentation for the micro:bit Universal Hex library.

Here you will find the available public API to convert Intel Hex strings into Universal Hex strings and vice-versa.

## Universal Hex format

The micro:bit Universal Hex format is a superset of the
[Intel Hex file format](https://en.wikipedia.org/wiki/Intel_HEX) designed to be
able to include data for multiple targets into a single file. A Universal Hex file can contain the binary data for multiple micro:bit
board versions. This allows the creation of a hex file that will work on micro:bit V1 and V2.

Detailed information of the Universal Hex format can be found in the [specification](https://github.com/microbit-foundation/spec-universal-hex).

This TypeScript/JavaScript library can be used to create a
micro:bit Universal Hex from two or more micro:bit Intel Hex files.

## Online tool

An implementation example can be found in the [webtool.html](./examples/webtool.html)
in the repository and it is hosted in the
[micro:bit Tech Site](ttps://tech.microbit.org).

This web tool can generate a Universal Hex from an Intel Hex file for micro:bit
V1 and an Intel Hex file for micro:bit V2.

- [Universal Hex Creator](https://tech.microbit.org/software/universal-hex-creator/)
- [Universal Hex Separator](https://microbit-foundation.github.io/microbit-universal-hex/examples/separate.html)

## Related documentation

[micro:bit Universal Hex Specification](https://github.com/microbit-foundation/spec-universal-hex) contains a lot more information
about the file data format.

[GitHub](https://microbit-foundation.github.io/microbit-universal-hex/) contains general documentation for this
library.

[The micro:bit Tech Site](https://tech.microbit.org) contains general technical information about the
micro:bit.

## License

This documentation, as well as the rest of the source files located in the
https://github.com/microbit-foundation/microbit-universal-hex repository, is
released under the MIT open source license.

SPDX-License-Identifier: MIT
