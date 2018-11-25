const zip = require('electron-installer-zip');
const {readdirSync, statSync} = require('fs');
const {join} = require('path');

const tmp = join(__dirname, '../tmp');
const dist = join(__dirname, '../dist');
const dirs = readdirSync(tmp).filter((f) => statSync(join(tmp, f)).isDirectory());

dirs.forEach((dir) => {
  zip({
    dir: join(tmp, dir),
    out: join(dist, dir + '.zip')
  }, function(err, res) {
    if (err) {
      console.error(err);
    }
    console.log('Zip file written to: ', join(dist, dir + '.zip'));
  });
});

zip({
  dir: join(__dirname, './app/build'),
  out: join(dist, 'LineUpApp.zip')
}, function(err) {
  if (err) {
    console.error(err);
  }
  console.log('Zip file written to: ', join(dist, 'LineUpApp.zip'));
});
