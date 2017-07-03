var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var autoprefixerOptions = {
    browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4']
};
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
//var pug = require('gulp-pug');
var plumber = require('gulp-plumber');

// Development Tasks
// -----------------

// Start browserSync server
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    }
  })
})

// Pug compiling
// gulp.task('pug', function buildHTML() {
//     return gulp.src('app/pug/*.pug')
//         .pipe(plumber())
//         .pipe(pug({pretty: true}))
//         .pipe(gulp.dest('app/'));
// });
// Pug additional watcher
// gulp.task('pug-watch', ['pug'], function (done) {
//     browserSync.reload();
//     //console.log('pug reload');
//     done();
// });
// SASS compiling
gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest('app/css')) // Outputs it in the css folder
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
    }));
});

// Watchers
gulp.task('watch', function() {
  gulp.watch('app/scss/**/*.scss', ['sass']);
  //gulp.watch('app/pug/*.pug', ['pug']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/css/print.css', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});

// Optimization Tasks 
// ------------------

// Optimizing CSS and JavaScript 
gulp.task('useref', function() {

  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'));
});

// Optimizing Images 
gulp.task('images', function() {
  return gulp.src('app/img/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching img that ran through imagemin
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest('dist/img'))
});

// Copying fonts 
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
});

// Copying js libs
gulp.task('copy-js-libs', function() {
    return gulp.src('app/js/libs/**/*')
        .pipe(gulp.dest('dist/js/libs'))
});
// Copying favicon
gulp.task('copy-favicon', function() {
    return gulp.src('app/favicon.ico')
        .pipe(gulp.dest('dist'))
});
// Copying print
gulp.task('copy-css-files', function() {
    return gulp.src('app/css/print.css')
        .pipe(gulp.dest('dist/css'))
});
// Copying style
gulp.task('copy-css-files2', function() {
    return gulp.src('app/css/style.css')
        .pipe(gulp.dest('dist/css'))
});

// Cleaning 
gulp.task('clean', function() {
  return del.sync('dist').then(function(cb) {
    return cache.clearAll(cb);
  });
});

gulp.task('clean:dist', function() {
  return del.sync(['dist/**/*', '!dist/img', '!dist/img/**/*']);
});

// Build Sequences
// ---------------

// gulp.task('default', function(callback) {
//   runSequence(['pug','sass','browserSync'], 'watch',
//     callback
//   )
// });
gulp.task('default', function(callback) {
    runSequence(['sass','browserSync'], 'watch',
        callback
    )
});

gulp.task('build', function(callback) {
  runSequence(
    'clean:dist',
    'sass',
    ['useref', 'images', 'fonts','copy-favicon','copy-css-files','copy-css-files2'],
    callback
  )
});
