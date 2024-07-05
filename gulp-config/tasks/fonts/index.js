import * as _ from "../index.js";

const folderName = "fonts";

const config = {
  path: {
    older: `${_.path.src}/${folderName}/*.{eot,otf,otc,ttc}`,
    svg: `${_.path.src}/${folderName}/*.svg`,
    ttf: `${_.path.src}/${folderName}/*.ttf`,
    woff: `${_.path.src}/${folderName}/*.{woff,woff2}`,
    watch: `${_.path.src}/${folderName}/**/*.{eot,ttf,otf,otc,ttc,woff,woff2,svg}`,
    dest: `${_.path.dest}/${folderName}`,
    fontFaces: `${_.path.src}/scss/${folderName}/_fonts.scss`,
  },
  modules: {
    plumber: {
      errorHandler: _.notify.onError(error => ({
        message: error.message,
      })),
    },
    fonter: {
      formats: ["ttf"],
    },
  },
  fontWeights: {
    thin: 100,
    hairline: 100,
    extralight: 200,
    ultralight: 200,
    light: 300,
    normal: 400,
    regular: 400,
    medium: 500,
    semibold: 600,
    demibold: 600,
    bold: 700,
    extrabold: 800,
    ultrabold: 800,
    black: 900,
    heavy: 900,
  },
};

const fonts = {
  ["del-fonts"]() {
    return _.del([config.path.dest, config.path.fontFaces]);
  },
  ["older-to-woff"]() {
    return _.gulp.src(config.path.older)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.fonter(config.modules.fonter))
      .pipe(_.ttf2woff2())
      .pipe(_.gulp.dest(config.path.dest));
  },
  ["svg-to-woff"]() {
    return _.gulp.src(config.path.svg)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.svg2ttf())
      .pipe(_.ttf2woff2())
      .pipe(_.gulp.dest(config.path.dest));
  },
  ["ttf-to-woff"]() {
    return _.gulp.src(config.path.ttf)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.ttf2woff2())
      .pipe(_.gulp.dest(config.path.dest));
  },
  ["woff"]() {
    return _.gulp.src(config.path.woff)
      .pipe(_.plumber(config.modules.plumber))
      .pipe(_.gulp.dest(config.path.dest));
  },
  ["font-face"]() {
    _.fs.readdir(`${config.path.dest}/`, (error, fontFiles) => {
      if (fontFiles) {
        if (!_.fs.existsSync(config.path.fontFaces)) {
          let isNewer;

          _.fs.writeFile(config.path.fontFaces, "", callback);

          [...fontFiles].forEach(fontFile => {
            const [fileName, extension] = fontFile.split(".");

            if (isNewer !== fileName) {
              const [fontName, weight, style] = fileName.split("-");

              _.fs.appendFile(config.path.fontFaces,
                `@font-face {\n\tfont-family: "${fontName.replaceAll(/\_/g, " ").trim() || "Font"}";\n\tsrc: url("../${folderName}/${fontFile}") format("${extension}");\n\tfont-weight: ${config.fontWeights[`${weight}`.toLocaleLowerCase().trim()] || weight || 400};\n\tfont-style: ${style?.toLocaleLowerCase().trim() || "normal"};\n\tfont-display: swap;\n}\r\n\n`,
                callback);

              isNewer = fileName;
            }
          });
        } else {
          throw new Error(`Файл ${config.path.fontFaces} уже существует. Для обновления файла нужно его удалить!`);
        }
      }
    });

    return _.gulp.src(_.path.src);

    function callback() { }
  },
};

const fontsTask = _.gulp.series(fonts["del-fonts"], _.gulp.parallel(fonts["older-to-woff"], fonts["svg-to-woff"], fonts["ttf-to-woff"], fonts["woff"]), fonts["font-face"]);

export { fontsTask };
