import fs = require('fs');

export function fileWatcher(file: string) {
  console.log(`Watching for file changes on ${file}`);
  const original = fs.readFileSync(file, 'utf8');
  let watcher: fs.FSWatcher;
  const promise = new Promise<fs.FSWatcher>((resolve, reject) => {
    watcher = fs.watch(file, (event, filename) => {
      if (event === 'change') {
        const current = fs.readFileSync(file, 'utf8');
        if (JSON.stringify(JSON.parse(original).files) !== JSON.stringify(JSON.parse(current).files)) {
          watcher.close();
          resolve(watcher);
        }
      }
    });
  });
  return {
    watcher,
    promise
  };
}
