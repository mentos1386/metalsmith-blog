module.exports = function( grunt ) {

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browser-sync');

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-exec');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.initConfig({
        // BrowserSync
        browserSync: {
            dev: {
                bsFiles: {
                    src : [
                        'build/**/*.*',
                    ]
                },
                options: {
                    watchTask: true,
                    server: './build'
                }
            }
        },

        // File Watching
        watch: {
            sass: {
                files: [
                    './src/scss/**/*.sass',
                    './src/scss/**/*.scss'
                ],
                tasks: [ 'sass', 'cssmin' ]
            },
            js: {
                files: [
                    './src/js/**/*.js'
                ],
                tasks: [ 'jshint', 'babel', 'uglify' ]
            },
            layouts: {
                files: [
                    './layouts/**/*.*',
                    './build.js'
                ],
                tasks: [ 'exec:metalsmith' ]
            },
            assets: {
                files: [
                    './src/fonts/**/*.*',
                    './src/img/**/*.*',
                ],
                tasks: [ 'copy:img', 'copy:fonts']
            },
            markdown: {
                files: [ './site/**/*.md' ],
                tasks: [ 'exec:metalsmith' ]
            }
        },

        // CSS/SASS FILES
        sass: {
            dist: {
                options: {
                    lineNumbers: true,
                    sourcemap: 'none'
                },
                files: [{
                    expand: true,
                    cwd: './src/scss',
                    src: [ '**/*.sass', '**/*.scss', '!modules/**/*.*'],
                    dest: './build/css',
                    ext: '.css'
                }]
            }
        },
        cssmin: {
            my_target: {
                files: [{
                    expand: true,
                    cwd: './build/css/',
                    src: [ '*.css', '!*.min.css' ], // 1
                    dest: './build/css/',
                    ext: '.min.css'
                }]
            }
        },

        // JAVASCRIPT FILES
        babel: {
            options: {
                sourceMap: false,
                presets: ['babel-preset-es2015']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: './src/js',
                    src: [ '**/*.js', '!modules/**/*.*'],
                    dest: './build/js',
                    ext: '.js'
                }]
            }
        },
        jshint: {
            all: ['Gruntfile.js', 'src/js/**/*.js'],
            options: {
                esversion: 6
            }
        },
        uglify: {
            my_target: {
                files: {
                    './build/js/main.min.js': './build/js/main.js'
                }
            }
        },

        // Metalsmith FILES
        exec: {
            metalsmith: 'node .'
        },

        // Copy node_modules to build
        copy: {
            Materialicons_fonts: {
                expand: true,
                cwd: 'node_modules/material-design-icons/iconfont/',
                src: ['*.ijmap', '*.svg', '*.ttf', '*.eot', '*.woff', '*.woff2'],
                dest: 'build/fonts/'
            },
            normalize: {
                expand: true,
                cwd: 'node_modules/normalize.css/',
                src: ['normalize.css'],
                dest: 'build/css/'
            },
            tether: {
                expand: true,
                cwd: 'node_modules/tether/dist/js',
                src: ['**'],
                dest: 'build/js/'
            },
            moment: {
                expand: true,
                cwd: 'node_modules/moment/',
                src: ['moment.js'],
                dest: 'build/js/'
            },
            img: {
                expand: true,
                cwd: 'src/img',
                src: ['**'],
                dest: 'build/img/'
            },
            fonts: {
                expand: true,
                cwd: 'src/fonts',
                src: ['**'],
                dest: 'build/fonts/'
            }
        },
        clean: {
            build: [ './build' ]
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('init', ['clean:build', 'copy']);
    grunt.registerTask('build', [ 'exec:metalsmith', 'sass', 'cssmin', 'babel']);
    grunt.registerTask('dev', [ 'init', 'build', 'browserSync', 'watch']);
};