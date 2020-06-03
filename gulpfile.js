const { series, parallel, src, dest, watch } = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const filter = require('gulp-filter');

var sass = require('gulp-sass');
sass.compiler = require('node-sass');

const destination = 'dist/';

const browserSync = require('browser-sync').create();
const reload      = browserSync.reload;

function clean(cb) {
  // body omitted
  cb();
}

function html() {
  return src('src/*.html')
    .pipe(dest(destination));
}

function css() {
  return src('src/styles/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest(destination + 'css'))
    .pipe(filter('**/*.css')) // Filtering stream to only css files
    .pipe(reload({stream:true}));
}

function javascript() {
  return src('src/scripts/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(src('vendor/*.js'))
    .pipe(uglify())
    // So use gulp-rename to change the extension
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest(destination + 'js'));
}

function serve() {
  // Serve files from the root of this project
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });

  watch('src/*.html').on('change', series(html, reload));
  watch('src/scripts/**/*.js').on('change', series(javascript, reload));
  watch('src/styles/**/*.scss', series(css));
}

const build = series(clean, parallel(html, css, javascript));

exports.build = build;
exports.default = series(build, serve);