import * as _ from "../index.js";

const build = {
  dev: _.gulp.series(
    _.clear,
    _.gulp.parallel(_.htmlDevTask, _.scssDevTask, _.jsDevTask, _.imgDevTask),
    _.gulp.parallel(_.watcher, _.server)
  ),
  prod: _.gulp.series(
    _.clear,
    _.gulp.parallel(_.htmlProdTask, _.scssProdTask, _.jsProdTask, _.imgProdTask),
    _.zipTask
  ),
}

export { build };
