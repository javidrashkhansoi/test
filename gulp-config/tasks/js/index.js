import * as _ from "../index.js";

const config = {
  path: {
    src: `${_.path.src}/js/script.js`,
    watch: `${_.path.src}/js/**/*.js`,
    dest: `${_.path.dest}/js`,
  },
  modules: {
    plumber: {
      errorHandler: _.notify.onError(error => ({
        message: error.message,
      })),
    },
    webpack(isDev, isMinimize) {
      return {
        mode: isDev ? "development" : "production",
        optimization: {
          minimize: isMinimize,
          minimizer: [
            new _.terser({
              terserOptions: {
                format: {
                  comments: false,
                },
              },
              extractComments: false,
            }),
          ],
        },
        entry: {
          script: "./src/js/script.js",
        },
        output: {
          filename: !isDev && !isMinimize ? "[name].js" : "[name].min.js",
        },
        module: {
          rules: [
            {
              test: /\.css$/,
              use: [
                {
                  loader: "style-loader",
                  options: {
                    injectType: "singletonStyleTag",
                  },
                },
                "css-loader",
              ],
            },
          ],
        },
      };
    },
  },
};

const js = {
  ["del-js"]() {
    return _.del([`${_.path.dest}/js`]);
  },
  ["js-dev"]() {
    return _.gulp.src(config.path.src)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.webpackStream(config.modules.webpack(true, false)))
      .pipe(_.gulp.dest(config.path.dest));
  },
  ["js-ex"]() {
    return _.gulp.src(config.path.src)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.webpackStream(config.modules.webpack(false, false)))
      .pipe(_.gulp.dest(config.path.dest));
  },
  ["js-prod"]() {
    return _.gulp.src(config.path.src)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.webpackStream(config.modules.webpack(false, true)))
      .pipe(_.babel())
      .pipe(_.uglify())
      .pipe(_.gulp.dest(config.path.dest));
  },
};

const jsWatch = config.path.watch;
const jsDevTask = js["js-dev"];
const jsProdTask = _.gulp.parallel(js["js-ex"], js["js-prod"]);
const jsTask = _.gulp.series(js["del-js"], jsProdTask, _.zipTask);

export { jsWatch, jsDevTask, jsProdTask, jsTask };
