import * as _ from "../index.js";

const config = {
  path: {
    raster: `${_.path.src}/img/**/*.{png,jpg,jpeg,gif,webp}`,
    vector: `${_.path.src}/img/**/*.svg`,
    watch: `${_.path.src}/img/**/*.{png,jpg,jpeg,gif,webp,svg}`,
    dest: `${_.path.dest}/img`,
  },
  modules: {
    plumber: {
      errorHandler: _.notify.onError(error => ({
        message: error.message,
      })),
    },
    imagemin: {
      verbose: true,
      progressive: true,
      svgoPlugins: [
        {
          removeViewBox: false,
        },
      ],
      interlaced: true,
      optimizationLevel: 3,
    },
  }
};

const img = {
  ["del-img"]() {
    return _.del([`${_.path.dest}/img`]);
  },
  ["img-raster-dev"]() {
    return _.gulp.src(config.path.raster)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.newer(config.path.dest))
      .pipe(_.gulp.dest(config.path.dest));
  },
  ["img-raster-prod"]() {
    return _.gulp.src(config.path.raster)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.imagemin(config.modules.imagemin))
      .pipe(_.gulp.dest(config.path.dest));
  },
  ["img-raster-webp"]() {
    return _.gulp.src(config.path.raster)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.webp())
      .pipe(_.gulp.dest(config.path.dest));
  },
  ["img-vector-dev"]() {
    return _.gulp.src(config.path.vector)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.newer(config.path.dest))
      .pipe(_.gulp.dest(config.path.dest));
  },
  ["img-vector-prod"]() {
    return _.gulp.src(config.path.vector)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.gulp.dest(config.path.dest));
  },
};

const imgWatch = config.path.watch;
const imgDevTask = _.gulp.parallel(img["img-raster-dev"], img["img-vector-dev"]);
const imgProdTask = _.gulp.parallel(img["img-raster-prod"], img["img-raster-webp"], img["img-vector-prod"]);
const imgTask = _.gulp.series(img["del-img"], imgProdTask, _.zipTask);

export { imgWatch, imgDevTask, imgProdTask, imgTask };
