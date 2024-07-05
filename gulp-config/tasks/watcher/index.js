import * as _ from "../index.js";

function watcher() {
  _.gulp.watch(_.htmlWatch, _.htmlDevTask).on("all", _.bs.reload);
  _.gulp.watch(_.scssWatch, _.scssDevTask).on("all", _.bs.reload);
  _.gulp.watch(_.jsWatch, _.jsDevTask).on("all", _.bs.reload);
  _.gulp.watch(_.imgWatch, _.imgDevTask).on("all", _.bs.reload);
}

export { watcher };
