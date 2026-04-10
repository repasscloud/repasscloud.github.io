#!/bin/bash

for f in static/mermaid-src/*.mmd; do
    filename=$(basename "$f" .mmd)
    mmdc -i "$f" -o "static/images/${filename}.svg"
done
