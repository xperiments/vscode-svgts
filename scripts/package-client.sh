#!/bin/sh

cd client
npm run build

touch dist/vscode-svgts-client/build.js

cat dist/vscode-svgts-client/runtime.*.js dist/vscode-svgts-client/polyfills.*.js dist/vscode-svgts-client/main.*.js >> dist/vscode-svgts-client/build.js

cd ..
cd scripts  
node ./replace-index.js
