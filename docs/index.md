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

- [micro:bit Universal Hex Specification](https://github.com/microbit-foundation/spec-universal-hex) contains a lot more information
  about the file data format.
- [GitHub](https://microbit-foundation.github.io/microbit-universal-hex/) contains general documentation for this
  library.
- [The micro:bit Tech Site](https://tech.microbit.org) contains general technical information about the
  micro:bit.

---

This is the documentation for the micro:bit Universal Hex library.

Here you will find the available public API to convert Intel Hex strings into Universal Hex strings and vice-versa.

Originally the micro:bit hex files used the
[Intel Hex format](https://en.wikipedia.org/wiki/Intel_HEX) and with the
micro:bit V2 release a new hex format was created to be able to flash any
micro:bit board version with a single file.

The Universal Hex file format can contain the binary data for multiple micro:bit
board versions and this TypeScript/JavaScript library can be used to create a
micro:bit Universal Hex from two or more micro:bit Intel Hex files.

## Navigation

- ⬆️ The header at the top contains a search bar
- ⬅️ The menu on the left shows you the available documentation pages
- ⬇️ If you'd like to contribute to the docs there is an edit link at the footer

## License

This documentation, as well as the rest of the source files located in the
https://github.com/microbit-foundation/microbit-universal-hex repository, is
released under the MIT open source license.

SPDX-License-Identifier: MIT
