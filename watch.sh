#!/usr/bin/env bash

sass --style compact --sourcemap=none --no-cache --update -f uploader.scss:uploader.css
sass --style compact --sourcemap=none --no-cache --watch uploader.scss:uploader.css
