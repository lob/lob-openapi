"use strict";

const argv = require("yargs").argv;
const browserify = require("browserify");
const gulp = require("gulp");
const gulpUtil = require("gulp-util");
const plugins = require("gulp-load-plugins")({ camelize: true });
const sass = require("gulp-sass")(require("sass"));
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");

var paths = {
  sassFiles: [
    "./styles/main.scss",
    "./styles/prettify.scss",
    "./styles/rebrand-nav-footer.scss",
  ],
  dist: {
    js: "./docs/js/",
    css: "./docs/css/",
  },
  styleFiles: "./styles/**/*.scss",
};

gulp.task("browserify", () => {
  return browserify("./js/main.js", {
    insertGlobals: true,
    debug: true,
  })
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(plugins.streamify(plugins.uglify().on("error", gulpUtil.log)))
    .pipe(gulp.dest(paths.dist.js));
});

gulp.task("sass", () => {
  return gulp
    .src(paths.sassFiles)
    .pipe(sass({ errLogToConsole: true }))
    .pipe(plugins.minifyCss())
    .pipe(plugins.rename({ suffix: ".min" }))
    .pipe(gulp.dest(paths.dist.css));
});

gulp.task(
  "distribute",
  gulp.series("sass", "browserify", (done) => {
    done();
  })
);
