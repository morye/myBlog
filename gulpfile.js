
'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var concatCss = require('gulp-concat-css');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require("gulp-uglify");
var util = require('gulp-util');
var zip = require('gulp-zip');
var uglifycss = require('gulp-uglifycss');
var order = require('gulp-order');

var version = "0.1.0";

var _rootPath = (function(isProd){
    var path = {
        development: ".",
        production: "."
    };
    return isProd ? path.production : path.development;
})(!!util.env.production);

var _config = {
    path: {
        js: {
            src: [
                _rootPath+"/global/**/*.js",
                _rootPath+"/js/*.js",
                _rootPath+"/js/services/**/*.js",
                _rootPath+"/js/components/**/*.js",
                _rootPath+"/js/directives/**/*.js",
                "!" + _rootPath+"/js/**/*_test.js"
            ],
            dist: _rootPath+"/dist/js/",
            file: "app.js",
            libs: [
                    _rootPath+"/assets/libs/angular/1.5.0/angular.min.js",
                    _rootPath+"/assets/libs/angular/1.5.0/angular-route.min.js"
            ],
            libFile: "libs.js"
        },
        styles: {
            scss: _rootPath+"/assets/sass/**/*.scss",
            css: _rootPath+"/assets/css/",
            dist: _rootPath+"/dist/css/",
            file: "main.css"
        },
        zip: {
            dist: "./",
            file: "archive.zip"
        }
    },
    production: !!util.env.production
};

var notifyMessage = function(options){
    return _config.production ? util.noop() : notify(options);
}

// Lint Task
gulp.task('lint', function () {
    return gulp.src(_config.path.js.src)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('sass', function () {
    return gulp.src(_config.path.styles.scss)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(_config.path.styles.css))
        .pipe(notifyMessage({message: "sass build is completed. css file updated at " + _config.path.styles.css, onLast: true }));
});

gulp.task('concatJS', function() {
    return gulp.src(_config.path.js.src)
        .pipe(notifyMessage({message: "JS files concatenation started at " + _config.path.js.dist, onLast: true }))
        .pipe(order([
            //puts stream in specific order for deterministic builds.
            //files listed here are loaded first (in order) and everything else is sorted.
            'global/global.js',
            'js/app.module.js'
        ], {base: './'}))
        .pipe(sourcemaps.init())
        .pipe(concat(_config.path.js.file))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(_config.path.js.dist))
        .pipe(_config.production ? uglify() : util.noop())
        /*.pipe(_config.production ? rename({extname: ".min.js"}) : util.noop())*/
        .pipe(_config.production ? gulp.dest(_config.path.js.dist) : util.noop())

        .pipe(notifyMessage({message: "JS files concatenation is completed. Bundle file updated at " + _config.path.js.dist, onLast: true }));
});

gulp.task('concatCSS', ['sass'], function() {
    return gulp.src(_config.path.styles.css+'**/*.css')
        .pipe(concatCss(_config.path.styles.file))
        .pipe(_config.production ? uglifycss({
            "maxLineLen": 80,
            "uglyComments": true}) : util.noop())
        .pipe(gulp.dest(_config.path.styles.dist))
        .pipe(notifyMessage({message: "css build has been moved to " + _config.path.styles.dist, onLast: true }));
});

gulp.task('html', function() {

});

gulp.task('watch', function () {
    gulp.watch(_config.path.styles.scss, ['concatCSS']);
    gulp.watch(_config.path.js.src, [
        'lint',
        'concatJS'
    ]);
});

gulp.task('js-libs-bundle', function() {
    return gulp.src(_config.path.js.libs)
        .pipe(concat(_config.path.js.libFile))
        .pipe(gulp.dest(_config.path.js.dist))
        .pipe(notifyMessage({message: "JS libs files concatenation is completed. Bundle file updated at " + _config.path.js.dist +_config.path.js.libFile, onLast: true }));
});

gulp.task('default', [
    'concatJS',
    'concatCSS',
    'js-libs-bundle'
], function() {
    if (_config.production) {
        return gulp.src([
                _rootPath + "/assets/**",
                _rootPath + "/js/**",
                _rootPath + "/dist/**",
                _rootPath + "/global/**",
                _rootPath + "/index.html",
                "!" + _rootPath + "/node_modules"
            ], {base: _rootPath })
            .pipe(zip(_config.path.zip.file))
            .pipe(gulp.dest(_config.path.zip.dist))
            .pipe(notifyMessage({message: "Zip file created at " + _config.path.zip.dist +_config.path.zip.file, onLast: true }));
    }
    return 0;
});