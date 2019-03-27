import gulp from "gulp";
import { attempt, isError } from 'lodash';
import cp from "child_process";
import gutil from "gulp-util";
import postcss from "gulp-postcss";
import cssImport from "postcss-import";
import nestedcss from "postcss-nested";
import colorfunctions from "postcss-color-function";
import cssvars from "postcss-simple-vars-async";
import cssextend from "postcss-simple-extend";
import styleVariables from "./config/variables";
import BrowserSync from "browser-sync";
import webpack from "webpack";
import webpackConfig from "./webpack.conf";
import reduce from "gulp-reduce-async";
import rename from "gulp-rename";
import runSequence from "run-sequence";
import S from "string";
import fs from "fs";
import imagemin from "gulp-imagemin";
import responsive from "gulp-responsive";
import imgRetina from "gulp-responsive-imgz";
import lostgrid from "lost";

const $ = require('gulp-load-plugins')();
const development = process.env.ALGOLIA_ID === undefined;
let algoliaIndex;
let env;

if (development) {
  env = attempt(() => require("./config/env.js"));
  env = isError(env) ? null : env.default;
}

const browserSync = BrowserSync.create();
const hugoBin = "hugo";
const defaultArgs = ["-d", "../dist", "-s", "site", "-v"];
const DEST = "./dist/";

gulp.task("hugo", (cb) => buildSite(cb));
gulp.task("hugo-preview", (cb) => buildSite(cb, ["--buildDrafts", "--buildFuture"]));
gulp.task("hugo-production", (cb) => buildSite(cb));
gulp.task("hugo-branch", (cb) => buildSite(cb));

gulp.task("build", function(callback) {
  runSequence(["css", "js", "fonts", "images", "hugo"], "optimize");
});
gulp.task("build-preview", function(callback) {
  runSequence(["css", "js", "fonts", "images", "hugo-preview"], "optimize");
});
gulp.task("build-branch", function(callback) {
  runSequence(["css", "js", "fonts", "images", "hugo-branch"], "optimize");
});

gulp.task("css", () => (
  gulp.src("./src/css/*.css")
    .pipe(postcss([
      cssImport({from: "./src/css/main.css"}),
      nestedcss(),
      cssextend(),
      cssvars({variables: styleVariables}),
      lostgrid(),
      colorfunctions()]))
    .pipe(gulp.dest(DEST+"css"))
    .pipe(browserSync.stream())
));

gulp.task("js", (cb) => {
  const myConfig = Object.assign({}, webpackConfig);

  webpack(myConfig, (err, stats) => {
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
      colors: true,
      progress: true
    }));
    browserSync.reload();
    cb();
  });
});

gulp.task("fonts", () => (
  gulp.src("./src/fonts/**/*")
    .pipe(gulp.dest(DEST+"fonts"))
    .pipe(browserSync.stream())
));

gulp.task("images", () => (
  gulp.src(["./src/img/**/*"])
    .pipe(gulp.dest(DEST+"img"))
    .pipe(browserSync.stream())
));

gulp.task("server", ["hugo", "css", "js", "fonts", "images"], () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    },
    notify: false
  });
  gulp.watch("./src/js/**/*.js", ["js"]);
  gulp.watch("./src/css/**/*.css", ["css"]);
  gulp.watch("./src/img/**/*", ["images"]);
  gulp.watch("./src/fonts/**/*", ["fonts"]);
  gulp.watch("./site/**/*", ["hugo"]);
});

gulp.task("optimize", () => (
  // resize and compress images
   gulp.src(["dist/img/**/*.{jpg,png}"])
    .pipe($.responsive({
        "**/*.{jpg,png}": [{
          width: "33%",
        }, {
          width: "66%",
          rename: {suffix: "@2x"}
        }, {
          width: "100%",
          rename: {suffix: "@3x"}
        }]
      }, {
        withoutEnlargement: true,
        skipOnEnlargement: false,
        errorOnEnlargement: false,
        errorOnUnusedConfig: false,
        errorOnUnusedImage: false,
        passThroughUnused: true,
        strictMatchImages: false
      }))
      .pipe(imagemin({
        interlaced: true,
        progressive: true,
        optimizationLevel: 7,
      }))
    .pipe(gulp.dest(DEST+"img")),

  gulp.src(["dist/img/**/*.svg", "dist/img/**/*.gif"])
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true,
        optimizationLevel: 3
      }),
      imagemin.svgo({plugins: [{
        removeViewBox: true,
        cleanupAttrs: true,
        inlineStyles: true,
        removeDoctype: true,
        removeXMLProcInst: true,
        removeComments: true,
        removeMetadata: true,
        removeTitle: true,
        removeDesc: true,
        removeUselessDefs: true,
        removeXMLNS: true,
        removeEditorsNSData: true,
        removeEmptyAttrs: true,
        removeHiddenElems: true,
        removeEmptyText: true,
        removeEmptyContainers: true,
        removeViewBox: true,
        cleanupEnableBackground: true,
        minifyStyles: true,
        removeNonInheritableGroupAttrs: true,
        removeUselessStrokeAndFill: true,
        removeUnusedNS: true,
        cleanupIDs: true,
        cleanupNumericValues: true,
        cleanupListOfValues: true,
        collapseGroups: true,
        mergePaths: true,
        convertShapeToPath: true,
        sortAttrs: true,
        removeAttrs: true,
        removeElementsByAttr: true,
        removeStyleElement: true,
        removeScriptElemen: true
      }]})
    ]))
    .pipe(gulp.dest(DEST+"img")),

  gulp.src(["dist/img/favicon/**/*"])
    .pipe(gulp.dest(DEST+"img/favicon")),

  // add srcset to images
  gulp.src("dist/**/*.html")
    .pipe(imgRetina())
    .pipe(gulp.dest(DEST))
));

function buildSite(cb, options) {
  const args = options ? defaultArgs.concat(options) : defaultArgs;

  return cp.spawn(hugoBin, args, {stdio: "inherit"}).on("close", (code) => {
    if (code === 0) {
      browserSync.reload();
      cb();
    } else {
      browserSync.notify("Hugo build failed :(");
      cb("Hugo build failed");
    }
  });
}
