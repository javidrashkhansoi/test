import * as _ from "../index.js";

const config = {
  path: {
    src: `${_.path.src}/html/*.html`,
    watch: `${_.path.src}/html/**/*.{html,svg}`,
    dest: _.path.dest,
  },
  modules: {
    plumber: {
      errorHandler: _.notify.onError(error => ({
        message: error.message,
      })),
    },
    htmlmin: {
      collapseWhitespace: true,
    },
    versionNumber: {
      "value": "%DT%",
      "append": {
        "key": "_v",
        "cover": 0,
        "to": ["css", "js",],
      },
      "output": {
        "file": "./version.json",
      },
    },
  },
};

const html = {
  ["del-html"]() {
    return _.del([`${_.path.dest}/**/*.html`]);
  },
  ["html-dev"]() {
    return _.gulp.src(config.path.src)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.fileinclude())
      .pipe(_.replace(/@img\//g, "img/"))
      .pipe(_.gulp.dest(config.path.dest));
  },
  ["html-prod"]() {
    return _.gulp.src(config.path.src)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.fileinclude())
      .pipe(_.webpHtmlNosvg())
      .pipe(_.htmlmin(config.modules.htmlmin))
      .pipe(_.replace(/@img\//g, "img/"))
      .pipe(_.versionNumber(config.modules.versionNumber))
      .pipe(_.gulp.dest(config.path.dest));
  },
};

const htmlWatch = config.path.watch;
const htmlDevTask = html["html-dev"];
const htmlProdTask = html["html-prod"];
const htmlTask = _.gulp.series(html["del-html"], htmlProdTask, _.zipTask);

export { htmlWatch, htmlDevTask, htmlProdTask, htmlTask };
