const fs = require('fs');

const cssFile = fs.readdirSync(__dirname + '/../client/dist/vscode-svgts-client').filter(name => name.includes('.css'));
const index = fs.readFileSync(__dirname + '/../client/dist-index.html', 'utf8');
const js = fs.readFileSync(__dirname + '/../client/dist/vscode-svgts-client/build.js', 'utf8');
const css = fs.readFileSync(__dirname + '/../client/dist/vscode-svgts-client/' + cssFile, 'utf8');

const result = index
  .replace('<style></style>', '<style>' + css + '</style>')
  .replace('<script></script>', '<script>' + js + '</script>');

fs.writeFileSync(__dirname + '/../out/src/index.html', result, 'utf8');
fs.writeFileSync(__dirname + '/../docs/index.html', result.replace('__icons__', 'null'), 'utf8');
