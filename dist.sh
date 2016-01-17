#!/bin/sh

if [ -d "dist" ]; then
  rm -r dist
fi
mkdir dist
cp -r templates carousel.js content-script.js event-page.js icon* key.pem manifest.json dist
zip -r mm.zip dist
