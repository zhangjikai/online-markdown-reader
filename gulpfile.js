var gulp = require("gulp");
var browserSync = require('browser-sync');
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var notify = require("gulp-notify");


gulp.task("move", function () {
    return gulp.src(
        ['./bower_components/marked/**/*marked*js',
            './bower_components/highlightjs/**/*highlight*js',
            './bower_components/highlightjs/**/*css',
            './bower_components/jquery/dist/**/*js',
            './bower_components/font-awesome/css/**/*css',
            './bower_components/font-awesome/fonts/*',
            './bower_components/FileSaver.js/**/*FileSaver*js',
            './bower_components/js-beautify/js/lib/*beautify*js',
            './bower_components/loaders.css/*load*css',



        ],
        {
            base: './bower_components'
        }
    ).pipe(gulp.dest('assets/lib'))
});


gulp.task('browserSync', function () {
    browserSync({
        server: {
            baseDir: '.'
        },
        port: 81
    })
});


gulp.task('less', function () {
    gulp.src("src/**/*.less", {base: "src/less"})
        .pipe(plumber({errorHandler: notify.onError("Error: <%=error.message%>")}))
        .pipe(less())
        .pipe(gulp.dest("assets/css/"))
        .pipe(browserSync.reload({
            stream: true
        }));
});


gulp.task("watch", function () {
    gulp.watch("src/**/*.less", ["less"]);
    gulp.watch("./**/*.html", browserSync.reload);
    gulp.watch("src/**/*.js", browserSync.reload);
    gulp.watch("assets/**/*.css", browserSync.reload);
});


gulp.task('default', ['browserSync', 'watch', 'less']);