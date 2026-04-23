+++
title = "CurseDelete"
draft = false
type = "page"
showTableOfContents = true
description = "CurseDelete is a cross-platform command-line utility for recursively deleting directories at high speed. Built by RePass Cloud Pty Ltd and available open source on GitHub."
metaDescription = "CurseDelete is a fast, cross-platform command-line tool for recursively deleting directories and their contents. Built in C# on .NET. Open source. Available for Windows, macOS, and Linux."
metaKeywords = ["CurseDelete", "recursive delete", "fast file deletion", "command line delete tool", "bulk delete utility", "Windows delete tool", "cross-platform delete", "open source", "RePass Cloud"]
+++

## Service Status

<div style="display: flex; gap: 4px; align-items: center;">
  <a href="https://github.com/repasscloud/CurseDelete/actions/workflows/release.yml">
    <img src="https://github.com/repasscloud/CurseDelete/actions/workflows/release.yml/badge.svg" alt="Release">
  </a>
  <a href="https://github.com/repasscloud/CurseDelete/releases/latest">
    <img src="https://img.shields.io/github/v/tag/repasscloud/CurseDelete?label=version&sort=semver" alt="Latest Version">
  </a>
</div>

CurseDelete is **no longer actively maintained** by RePass Cloud Pty Ltd. The source code is available open source on GitHub for community use.

This page is retained for historical reference only.

## About CurseDelete

CurseDelete is a command-line utility designed to recursively delete all files and folders under a specified directory as quickly as possible. It was built to address the performance limitations of standard OS-level deletion tools when dealing with directories containing large numbers of files or deeply nested folder structures.

It is the tool behind the fast delete capability referenced in our [Business Operations & IT Tooling](/about/#3-business-operations--it-tooling) work — built to handle bulk deletion across SMB shares, UNC paths, and direct drive paths at scale.

### What It Does

CurseDelete takes a single target directory path as input and deletes everything beneath it recursively. It is intentionally minimal — no interactive prompts, no partial operations, no recovery. It is designed to be fast and reliable when called from scripts, pipelines, or administrative tooling.

### Platform Support

CurseDelete was built on .NET and released as a native AOT-compiled binary for multiple platforms:

- Windows (x64)
- macOS (x64 and ARM64)
- Linux (x64)

### Usage

```sh
CurseDelete.exe [target_folder]
```

### When It Was Used

CurseDelete was built for environments where standard deletion tooling is too slow — for example, clearing directories containing hundreds of thousands of files across network shares, or automating cleanup steps in build and deployment pipelines where wait time matters.

## Open Source Availability

CurseDelete is available open source on GitHub under the MIT licence. Any use of the source code is at your own risk and subject to the licence terms in the repository.

[View on GitHub](https://github.com/repasscloud/CurseDelete)

## Contact

For questions relating to CurseDelete or open source licensing, contact:

**Contact:** [contact page](/contact)
