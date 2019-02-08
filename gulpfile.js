const nunjucksRender = require("gulp-nunjucks-render");
const sass = require("gulp-sass");
const del = require("del");
const server = require('browser-sync').create();
const { src, series, parallel, watch, dest } = require("gulp");

const config = {
  env: "development",

  src: {
    root: "src",
    sass: "src/sass"
  },

  dest: {
    root: "build",
    css: "build/css"
  }
};

const setEnv = function(env) {
  if (typeof env !== "string") return;
  this.env = env;
  process.env.NODE_ENV = env;
};

const defaultTask = function(cb) {
  cb();
};

const build = function(cb) {
  //   series(
  cleanTask();
  sassTask();
  nunjucksTask();
  // copyTask
  //   );

  cb();
};

const cleanTask = function(cb) {
  del([config.dest.root]);
};

const buildDevTask = function(cb) {
  setEnv("development");
  build(cb);
};

const buildTask = function(cb) {
  setEnv("production");
  build(cb);
};

const watchTask = function(cb) {
  nunjucksWatchTask();
  sassWatchTask();
};

const sassWatchTask = function() {
  watch(config.src.sass + "/**/*.{sass,scss}", sassTask);
};

const sassTask = function() {
  return src(config.src.sass + "/**/*.{sass,scss}")
    .pipe(
      sass({
        outputStyle: "expanded",
        precision: 5
      })
    )
    .pipe(dest(config.dest.css));
};

const nunjucksWatchTask = function() {
  watch(config.src.root + "/**/*.{html,njk}", nunjucksTask);
};

const nunjucksTask = function(cb) {
  nunjucksRender.nunjucks.configure({
    watch: false,
    trimBlocks: true,
    lstripBlocks: true
  });

  return src(config.src.root + "/**/*.html")
    .pipe(nunjucksRender({ path: "src" }))
    .pipe(dest(config.dest.root));
};

const serverTask = function(cb) {
    server.init({
        server: {
            baseDir: [config.dest.root, config.src.root],
            directory: false,
            serveStaticOptions: {
                extensions: ['html']
            }
        },
        files: [
            config.dest.root + '/*.html',
            config.dest.css + '/*.css'
        ],
        port: 8080,
        logLevel: "info",
        logConnections: false,
        logFileChanges: true,
        open: true,
        notify: false,
        ghostMode: false,
        online: false,
        tunnel: null
    });
}

exports.default = function(cb) {
    buildDevTask(cb);
    watchTask(cb);
    serverTask();
};
exports["build:dev"] = exports.default;
exports.build = buildTask;
exports.nunjucks = nunjucksTask;
exports.clean = cleanTask;
exports.server = serverTask;
