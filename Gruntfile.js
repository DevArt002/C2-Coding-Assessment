module.exports = function (grunt) {
    // Configuration
    grunt.initConfig({
        concat: {
            js: {
                src: ["public/js/*.js", "!public/js/scripts.js"],
                dest: "public/js/scripts.js",
            },
            sass: {
                src: ["public/css/sass/*.scss", "!public/css/sass/styles.scss"],
                dest: "public/css/sass/styles.scss",
            },
        },
        sass: {
            build: {
                files: [
                    {
                        src: "public/css/sass/styles.scss",
                        dest: "public/css/styles.css",
                    },
                ],
            },
        },
        uglify: {
            build: {
                files: [
                    {
                        src: "public/js/scripts.js",
                        dest: "public/js/scripts.js",
                    },
                ],
            },
        },
        watch: {
            source: {
                files: [
                    "public/js/*.js",
                    "!public/js/scripts.js",
                    "public/css/sass/*.scss",
                    "!public/css/sass/styles.scss",
                ],
                tasks: ["all"],
                options: {
                    livereload: true, // needed to run LiveReload
                },
            },
        },
    });

    // Load plugins
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-sass");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");

    // Register tasks
    grunt.registerTask("concat-js", ["concat:js"]);
    grunt.registerTask("concat-sass", ["concat:sass"]);
    grunt.registerTask("build-sass", ["sass"]);
    grunt.registerTask("uglify-js", ["uglify"]);
    grunt.registerTask("all", [
        "concat-js",
        "uglify-js",
        "concat-sass",
        "build-sass",
    ]);
};
