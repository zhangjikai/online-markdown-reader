var gulp = require("gulp");
var browserSync = require('browser-sync');
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var notify = require("gulp-notify");
var cleanCSS = require("gulp-clean-css");
var minifyJs = require("gulp-minify");
var rename = require("gulp-rename");


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
            './bower_components/emojify.js/dist/css/**/*css',
            './bower_components/emojify.js/dist/js/**/*js',
            './bower_components/remodal/dist/**/*css',
            './bower_components/remodal/dist/**/*js',
            './bower_components/bower-webfontloader/**/*webfont*js',
            './bower_components/snap.svg/dist/**/*snap*js',
            './bower_components/underscore/**/*underscore*js',
            './bower_components/js-sequence-diagrams/dist/**/*sequence-diagram*js',
            './bower_components/js-sequence-diagrams/dist/**/*sequence-diagram*css',
            './bower_components/js-sequence-diagrams/dist/**/*sequence-diagram*map',
            './bower_components/magic-check/**/*magic-check*css',
            './bower_components/echarts/dist/**/*js',


        ],
        {
            base: './bower_components'
        }
    ).pipe(gulp.dest('assets/lib'))
});

gulp.task("lib", function() {
    return gulp.src(
        ['assets/lib/highlightjs/**/*',
            'assets/lib/prism/**/*',
            'assets/lib/bower-webfontloader/**/*',
            'assets/lib/js-sequence-diagrams/**/*',
            'assets/lib/magic-check/**/*',
        ],
        {
            base: './assets'
        }
    ).pipe(gulp.dest("dist"));
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



gulp.task('minify-css', function() {
    return gulp.src('assets/css/*.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('copy-css', function() {
    return gulp.src('assets/css/*.css')
        .pipe(gulp.dest('dist/css'));
});

gulp.task('minify-js', function() {
    gulp.src('src/js/*.js')
        .pipe(minifyJs({
            ext:{
                src:'.js',
                min:'.min.js'
            },
            exclude: ['tasks'],
            ignoreFiles: ['.combo.js', '-min.js']
        }))
        .pipe(gulp.dest('dist/js'))
});

gulp.task("compress", ['minify-css', 'copy-css', 'minify-js']);

gulp.task("watch", function () {
    gulp.watch("src/**/*.less", ["less"]);
    gulp.watch("./**/*.html", browserSync.reload);
    gulp.watch("src/**/*.js", browserSync.reload);
    gulp.watch("assets/**/*.css", browserSync.reload);
});


gulp.task('default', ['browserSync', 'watch', 'less']);