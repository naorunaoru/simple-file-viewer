var gulp = require('gulp');
var stylus = require('gulp-stylus');
var watch = require('gulp-watch');
var gls = require('gulp-live-server');
var uglify = require('gulp-uglify');

gulp.task('style', function () {
  gulp.src('./styles/app.styl')
    .pipe(stylus({
	      compress: true
	    }))
    .pipe(gulp.dest('./public/'));
});

gulp.task('script', function() {
	gulp.src('./scripts/app.js')
		.pipe(uglify())
		.pipe(gulp.dest('./public/'));
});

gulp.task('watch', function () {
  gulp.watch('./styles/*.styl', ['style']);
	gulp.watch('./scripts/*.js', ['script']);
});

gulp.task('serve', function() {
  var server = gls.new(['index.js', '3000']);
  server.start();

	gulp.watch(['./public/**'], function(file) {
		server.notify.apply(server, [file]);
	})
});

gulp.task('default', ['watch', 'script', 'style', 'serve']);

gulp.task('build', ['script', 'style']);
