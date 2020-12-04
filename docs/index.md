---
layout: default
title: Home
homepage: true
permalink: /
nav_order: 1
---

# micro:bit Universal Hex

{: .fs-9 }

<img alt="microbit-universal-hex logo" src="img/microbit-uh-logo.png" style="max-height: 160px; float: left; padding-right: 16px;">

Create Universal Hex files for the micro:bit.
{: .fs-6 .fw-300 }

[Quick Guide](quick-guide.html){: .btn .btn-primary .mb-4 .mb-md-0 .mr-2 }
[API](api/){: .btn .btn-purple .mb-4 .mb-md-0 .mr-2 }
[View it on GitHub](https://github.com/microbit-foundation/microbit-universal-hex/){: .btn .mb-4 .mb-md-0 }

<br>

---

This is the documentation for the micro:bit Universal Hex library.

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
