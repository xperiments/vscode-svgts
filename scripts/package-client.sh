#!/bin/sh

cd client
npm run build

touch dist/xvs-svg2ts/build.js

cat dist/xvs-svg2ts/runtime.*.js dist/xvs-svg2ts/polyfills.*.js dist/xvs-svg2ts/main.*.js >> dist/xvs-svg2ts/build.js

cd ..
cd scripts  
node ./replace-index.js
