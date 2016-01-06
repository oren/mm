#!/bin/sh

mkdir dist
cp -r templates carousel.js content-script.js event-page.js icon* key.pem manifest.json dist
zip -r mm.zip dist
