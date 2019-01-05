import fs = require('fs');

export function fileWatcher(file: string) {
  console.log(`Watching for file changes on ${file}`);
  const original = fs.readFileSync(file, 'utf8');
  let watcher: fs.FSWatcher;
  const promise = new Promise<fs.FSWatcher>((resolve, reject) => {
    let fsWait = null;
    watcher = fs.watch(file, (event, filename) => {
      if (event === 'change') {
        const current = fs.readFileSync(file, 'utf8');
        if (original !== current) {
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
