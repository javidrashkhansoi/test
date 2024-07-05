import * as _ from "./gulp-config/index.js";

const fonts = _.fontsTask;
const html = _.htmlTask;
const scss = _.scssTask;
const js = _.jsTask;
const img = _.imgTask;
const zip = _.zipTask;
const dev = _.build.dev;
const prod = _.build.prod;

export { fonts };
export { html };
export { scss };
export { js };
export { img };
export { zip };
export { dev };
export { prod };
