var gulp = require("gulp");
var browserSync = require('browser-sync');


gulp.task("move", function () {
    return gulp.src(
        ['./bower_components/marked/**/*marked*js',
        './bower_components/highlightjs/**/*highlight*js',
        './bower_components/highlightjs/**/*css'




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
        port: 80
    })
});

gulp.task("watch", function () {
    gulp.watch("./**/*.html", browserSync.reload);
    gulp.watch("assets/**/*.js", browserSync.reload);
    gulp.watch("assets/**/*.css", browserSync.reload);
});


gulp.task('default', ['browserSync', 'watch', ]);