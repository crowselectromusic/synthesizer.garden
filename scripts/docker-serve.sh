#!/bin/bash

cd "$(dirname "$(realpath "$0")")/../" || exit 255

docker run -u "$(id -u):$(id -g)" -v "$(pwd)":/app --workdir /app -p 8080:8080 ghcr.io/getzola/zola:v0.17.1 serve --interface 0.0.0.0 --port 8080 --base-url localhost
