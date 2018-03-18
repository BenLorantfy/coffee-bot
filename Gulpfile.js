var gulp = require("gulp");
var babel = require("gulp-babel");
var package = require('./package.json');
var glob = require("glob");
var log = require('fancy-log');
var colors = require('colors/safe');
var { exec } = require('child_process');

function neverEnd() {
  return new Promise(function(){});
}

function mergeArrays(arrayOfArrays) {
  return Array.prototype.concat.apply([], arrayOfArrays);
}

function getPackages() {
  const folders = [];
  const workspaces = package.workspaces || [];
  const promises = workspaces.map((pattern) => new Promise(function(resolve, reject) {
    glob(pattern, function(err, folders) {
      if (err) {
        return reject(err);
      }

      return resolve(folders);
    })
  }));

  return Promise.all(promises).then((responses) => {
    const folders = mergeArrays(responses);
    return folders;
  })
}

function getFileGlobs(folders) {
  return folders.map(folder => `${folder}/**/src/**/*.js`);
}

function getDestFromSrc(path) {
  // Change 'src' to 'lib' and remove the file name
  // https://regex101.com/r/YrIHNU/1
  return path.replace('src', 'lib');
}

function removeFilenameFromPath(path) {
  return path.replace(/\/[^\/]+$/, '');
}

function getRelativePath(path) {
  return path.replace(`${__dirname}/`, '');
}

function getPackageNameFromPath(path){
  return 'fulfillment-server';
}

function restartPackage(name) {
  log.info(`Restarting ${colors.blue(name)}`);
  exec(`pm2 restart ${name}`, function(err) {
    if (err) {
      log.error(`Failed to restart ${name}`);
      return
    }

    log.info(`Restarted ${colors.green(name)}`);
  });
}

function watchAndBuild(globs) {
  gulp.watch(globs, function(change) {
    log.info(`Building ${colors.blue(getRelativePath(change.path))}`);
    const src = change.path;
    const dest = getDestFromSrc(src);

    gulp.src(src)
      .pipe(babel())
      .pipe(gulp.dest(removeFilenameFromPath(dest)))
      .on('finish', () => {
        log.info(`Built to ${colors.green(getRelativePath(dest))}`);
        const packageName = getPackageNameFromPath(dest);
        restartPackage(packageName);
      });
  });
  return neverEnd();
}

function buildPackages(folders) {
  return Promise.all(folders.map(folder => {
    log.info(`Building ${colors.blue(folder)}`);
    return new Promise((resolve, reject) => {
      gulp.src(`${folder}/src/**`)
        .pipe(babel())
        .pipe(gulp.dest(`${folder}/lib`))
        .on('finish', () => {
          log.info(`Built ${colors.green(folder)}`);
          resolve();
        })
    });
  }));
}

function build() {
  return getPackages()
    .then(buildPackages);
}

function watch() {
  return getPackages()
    .then(getFileGlobs)
    .then(watchAndBuild);
}

gulp.task("build", build);
gulp.task("watch", watch);
