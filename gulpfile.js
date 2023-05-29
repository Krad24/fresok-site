const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();
const svgSprite = require('gulp-svg-sprite');
const replace = require('gulp-replace');
const cheerio = require('gulp-cheerio');
const fileInclude = require('gulp-file-include');
const webp = require('gulp-webp');
const avif = require('gulp-avif');
const newer = require('gulp-newer')
const pictureHtml = require('gulp-webp-avif-html-nosvg-nogif-lazyload');

const htmlInclude = () => {
    return src(['app/html/*.html'])
    .pipe(fileInclude ({
        prefix: '@',
        basepath: '@file',
    }))
    .pipe(pictureHtml({
        primaryFormat: 'avif',
        secondaryFormat: 'webp',
    }))
    .pipe(dest('app'))
    .pipe(browserSync.stream());
}

const svgSprites = () => {
    return src (['app/images/icon/icon-svg/*.svg'])
    .pipe(cheerio({
        run: function($) {
            $('[fill]').removeAttr('fill');
            $('[stroke]').removeAttr('stroke');
            $('[style]').removeAttr('style');
        }, 
        parserOptions : {xmlMode: true}
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
        mode: {
            stack: {
                sprite : "../sprite.svg"
            }
        },
    }))
    .pipe(dest('app/images'))
}


function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        },
        notify: false
    })
}

function styles() {
    return src('app/scss/style.scss')
        .pipe(scss({
            outputStyle: 'compressed'
        }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function scripts() {
    return src([
            'node_modules/jquery/dist/jquery.js',
            'node_modules/slick-carousel/slick/slick.js',
            'node_modules/mixitup/dist/mixitup.js',
            'node_modules/ion-rangeslider/js/ion.rangeSlider.js',
            'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
            'node_modules/rateyo/src/jquery.rateyo.js',
            'node_modules/@fancyapps/ui/dist/fancybox.umd.js',
            'node_modules/swiper/swiper-bundle.js',
            'node_modules/simplebar/dist/simplebar.js',
            'app/js/main.js'
        ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}


function images() {
    return src(['app/images/**/*.*', '!app/images/**/*.svg', '!app/images/**/*.webp'])
      .pipe(newer('app/images'))
      .pipe(avif({ quality: 50 }))
  
      .pipe(src('app/images/**/*.*'))
      .pipe(newer('app/images'))
      .pipe(webp())
  
      .pipe(src('app/images/**/*.*', '!app/images/sprite.svg', '!app/images/icon/icon-svg/*.svg'))
      .pipe(newer('app/images'))
      .pipe(imagemin())
  
      .pipe(dest('app/images'))
  } 

function build(){
    return src([
        'app/**/*.html',
        'app/css/style.min.css',
        'app/js/main.min.js',
        'app/fonts/*.*',
    ], {base: 'app'})
    .pipe(dest('dist'))
}

function cleanDist(){
    return del('dist')
}

function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/**/*.html']).on('change', browserSync.reload);
    watch(['app/images/src'], images)
    watch(['app/images/icon/icon-svg/*.svg'], svgSprites);
    watch(['app/images/icon/icon-svg/*.svg']).on('change', browserSync.reload);
    watch(['app/html/**/*.html'], htmlInclude);
    watch(['app/scss/**/*.scss']).on('change', browserSync.reload);
}

exports.htmlInclude = htmlInclude;
exports.svgSprites = svgSprites;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, images, svgSprites, htmlInclude, browsersync, watching);