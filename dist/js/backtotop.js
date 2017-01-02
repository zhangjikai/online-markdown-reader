/*!
 * backtotop - v0.0.1
 * https://github.com/l-lin/backtotop
 */
/*!
 * backtotop - v0.0.1
 * https://github.com/l-lin/backtotop
 */
/*jshint unused: false */
var backToTop = (function() {
    'use strict';
    var DEFAULT_OPTIONS = {
        theme: 'classic',
        animation: 'fade'
    };

    return {
        /**
         * Initialize the modle
         * @param  [options] The options of the module
         */
        init: function(options) {
            var moduleOptions = {};
            if (!options) {
                moduleOptions = DEFAULT_OPTIONS;
            } else {
                moduleOptions.theme = options.theme || DEFAULT_OPTIONS.theme;
                moduleOptions.animation = options.animation || DEFAULT_OPTIONS.animation;
            }

            $('body').append('<a class="back-top ' + moduleOptions.theme + '" href="#"><i class="fa fa-angle-up fa-2x"></i></a>');
            /*$('body').append('<a class="back-top ' + moduleOptions.theme + '" href="#"><i class="fa fa-arrow-up"></i></a>');*/
            $('.back-top').hide();

            $(window).scroll(function() {
                if ($(this).scrollTop() > 10) {
                    if (moduleOptions.animation === 'slide') {
                        $('.back-top').slideDown();
                    } else {
                        $('.back-top').fadeIn();
                    }
                } else {
                    if (moduleOptions.animation === 'slide') {
                        $('.back-top').slideUp();
                    } else {
                        $('.back-top').fadeOut();
                    }
                }
            });

            $('a.back-top').click(function() {
                $('body, html').animate({
                    scrollTop: 0
                }, 800);
                return false;
            });
        }
    };
})();
