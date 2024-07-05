import * as _ from "../index.js";

function clear() {
  return _.del([
    "./archives",
    `${_.path.dest}/{css,img,js}/**`,
    `${_.path.dest}/**/*.html`,
    "./version.json",
  ]);
}

export { clear };
