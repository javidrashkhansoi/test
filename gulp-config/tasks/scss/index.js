import * as _ from "../index.js";

const config = {
  path: {
    src: `${_.path.src}/scss/style.scss`,
    watch: `${_.path.src}/scss/**/*.scss`,
    dest: `${_.path.dest}/css`,
  },
  modules: {
    plumber: {
      errorHandler: _.notify.onError(error => ({
        message: error.message,
      })),
    },
    rename: {
      suffix: ".min",
    },
    webpcss: {
      webpClass: ".webp",
      noWebpClass: ".no-webp",
    },
  },
};

const scss = {
  ["del-css"]() {
    return _.del([`${_.path.dest}/css`]);
  },
  ["scss-dev"]() {
    return _.gulp.src(config.path.src)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.gulpSass(_.sass)())
      .pipe(_.replace(/@img\//g, "../img/"))
      .pipe(_.rename(config.modules.rename))
      .pipe(_.gulp.dest(config.path.dest));
  },
  ["scss-prod"]() {
    return _.gulp.src(config.path.src)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.gulpSass(_.sass)())
      .pipe(_.replace(/@img\//g, "../img/"))
      .pipe(_.webpcss(config.modules.webpcss))
      .pipe(_.autoPrefixer())
      .pipe(_.groupCssMediaQueries())
      .pipe(_.gulp.dest(config.path.dest))
      .pipe(_.rename(config.modules.rename))
      .pipe(_.csso())
      .pipe(_.gulp.dest(config.path.dest));
  },
};

const scssWatch = config.path.watch;
const scssDevTask = scss["scss-dev"];
const scssProdTask = scss["scss-prod"];
const scssTask = _.gulp.series(scss["del-css"], scssProdTask, _.zipTask);

export { scssWatch, scssDevTask, scssProdTask, scssTask };
