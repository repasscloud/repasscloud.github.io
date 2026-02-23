+++
title = "Using find with -prune to Exclude Directories (Linux / macOS Guide)"
date = 2026-02-23
description = "Technical guide explaining how to use the find command with -prune to efficiently exclude directories such as node_modules, .git, dist, and build folders."
draft = false
showTableOfContents = true
type = "post"
tags = [
  "linux",
  "macos",
  "unix",
  "cli",
  "find",
  "devops",
  "filesystem",
  "engineering",
  "shell",
  "bash"
]
categories = [
  "Technical Guides",
  "CLI",
  "DevOps"
]
authors = ["RePass Cloud"]
+++

## Problem

When running find in large repositories, directories like node_modules, .git, and build folders can contain tens of thousands of files.

This makes searches slow and wastes CPU time.

The -prune option prevents find from descending into those directories, significantly improving performance.

## Using `find` with `-prune` to Exclude Directories

This guide explains how to use the `-prune` option with the Unix `find`
command to efficiently exclude directories from searches.

This is useful for ignoring directories such as:

- `node_modules`
- `.git`
- `dist`
- `build`
- cache folders
- generated output directories

Using `-prune` prevents `find` from descending into excluded
directories, improving performance and reducing unnecessary filesystem
traversal.

## Basic Syntax

``` bash
find . -type d -name "dir_to_exclude" -prune -o -type f -name "*.svg" -print
```

### Explanation

- `-type d -name "dir_to_exclude" -prune`\
  Stops descending into the specified directory.
- `-o`\
  Logical OR operator.
- `-type f -name "*.svg" -print`\
  Matches and prints SVG files.

## Example: Exclude a Single Directory

Exclude `node_modules`:

``` bash
find . -type d -name "node_modules" -prune -o -type f -name "*.svg" -print
```

## Example: Exclude Multiple Directories

Exclude `node_modules`, `.git`, and `dist`:

``` bash
find . \
  -type d \( -name "node_modules" -o -name ".git" -o -name "dist" \) -prune \
  -o -type f -name "*.svg" -print
```

## Example: Exclude by Full Path (More Precise)

``` bash
find . \
  -path "./node_modules" -prune -o \
  -path "./dist" -prune -o \
  -type f -name "*.svg" -print
```

This is useful when directory names may appear multiple times in
different locations.

## Recommended Real‑World Version

This version excludes common build and dependency directories:

``` bash
find . \
  -type d \( -name ".git" -o -name "node_modules" -o -name "dist" -o -name "build" \) -prune \
  -o -type f -name "*.svg" -print
```

This is the recommended approach for most projects.

## Alternative Method Using `-not -path`

``` bash
find . -type f -name "*.svg" \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*"
```

### Important Note

This method still traverses excluded directories, making it slower than
using `-prune`.

Use `-prune` whenever performance matters.

## Summary

| Method | Traverses excluded directories | Performance | Recommended |
| --- | --- | --- | --- |
| `-prune` | No | Fast | Yes |
| `-not -path` | Yes | Slower | No |

## When to Use

Use `-prune` when:

- Working with large repositories
- Ignoring dependency directories
- Ignoring build output
- Optimizing filesystem searches

## Example Use Case

Find all SVG files in a project while ignoring dependency and build
directories:

``` bash
find . \
  -type d \( -name ".git" -o -name "node_modules" -o -name "dist" -o -name "build" \) -prune \
  -o -type f -name "*.svg" -print
```
