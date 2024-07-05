import * as _ from "../index.js";

const config = {
  path: {
    src: ["{gulpfile.js,gulp-config/**/*.*,src/**/*.*,package.json}", "!**/*.db"],
    public: [`${_.path.dest}/**/*.*`, `!${_.path.dest}/{.git/**,.gitignore,*.md,*.zip,**/*.db}`],
    dest: "./archives",
  },
  modules: {
    plumber: {
      errorHandler: _.notify.onError(error => ({
        message: error.message,
      })),
    },
  }
};

const zip = {
  ["del-zip"]() {
    return _.del(["./archives"]);
  },
  ["zip-dev"]() {
    return _.gulp.src(config.path.src)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.GulpZip("development.zip"))
      .pipe(_.gulp.dest(config.path.dest));
  },
  ["zip-prod"]() {
    return _.gulp.src(config.path.public)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.GulpZip("production.zip"))
      .pipe(_.gulp.dest(config.path.dest));
  },
}

const zipTask = _.gulp.series(zip["del-zip"], _.gulp.parallel(zip["zip-dev"], zip["zip-prod"]));

export { zipTask };
