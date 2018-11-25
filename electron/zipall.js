const zip = require('electron-installer-zip');
const {readdirSync, statSync} = require('fs');
const {join} = require('path');

const base = join(__dirname, '../dist');
const dirs = readdirSync(base).filter((f) => statSync(join(base, f)).isDirectory());

dirs.forEach((dir) => {
  zip({
    dir: join(base, dir),
    out: join(base, dir + '.zip')
  }, function(err, res) {
    if (err) {
      console.error(err);
    }
    console.log('Zip file written to: ', join(base, dir + '.zip'));
  });
});

zip({
  dir: join(__dirname, './app/build'),
  out: join(base, 'LineUpApp.zip')
}, function(err) {
  if (err) {
    console.error(err);
  }
  console.log('Zip file written to: ', join(base, 'LineUpApp.zip'));
});
