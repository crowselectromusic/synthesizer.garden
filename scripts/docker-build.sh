#!/bin/bash

cd "$(dirname "$(realpath "$0")")/../" || exit 255

docker run -u "$(id -u):$(id -g)" -v "$(pwd)":/app --workdir /app ghcr.io/getzola/zola:v0.17.1 build
