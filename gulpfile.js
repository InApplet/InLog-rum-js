const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const watch = require('gulp-watch');

function combineAndMinifyJS() {
  return gulp.src('site/public/js/*.js') // Todos os arquivos .js na pasta /public/js
    .pipe(concat('inlog-rum.build.js'))
    .pipe(uglify())
    .pipe(gulp.dest('site/public/builds')); // Diretório de saída para o arquivo minificado
}

function watchJS() {
  return watch('site/public/js/*.js', gulp.series(combineAndMinifyJS));
}

exports.default = gulp.series(combineAndMinifyJS, watchJS);