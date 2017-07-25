var gulp = require("gulp"),
	newer = require("gulp-newer"),
	concat = require("gulp-concat"),
	uglify = require("gulp-uglify"),
	gulpif = require("gulp-if"),
	print = require("gulp-print"),
	argv = require("yargs").argv,
	del = require("del");

gulp.task("build", function() {
	var files = [
		"es6-promise.auto.js",
		"jquery.js",
		"bootstrap.js",
		"databind.js",
		"components.js",
	]
	.map(file => `web/js/${file}`);

	gulp.src(files)
		.pipe(newer("web/js/pack.js"))
		.pipe(concat("pack.js"))
		.pipe(gulpif(!argv.d, uglify({compress: {evaluate: false}})))
		.pipe(print())
		.pipe(gulp.dest("web/js"));
});
