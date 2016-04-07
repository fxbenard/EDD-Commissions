module.exports = function(grunt) {

	// Load multiple grunt tasks using globbing patterns
	require('load-grunt-tasks')(grunt);

	var pck = require('./package' );
	var config = pck.config;


	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		makepot: {
			target: {
				options: {
					domainPath: config.makepot.dest, // Where to save the POT file.
					exclude: ['build/.*'],
					mainFile: config.makepot.src, // Main project file.
					potFilename: config.makepot.domain + '.pot', // Name of the POT file.
					potHeaders: {
						poedit: true, // Includes common Poedit headers.
						'x-poedit-keywordslist': true, // Include a list of all possible gettext functions.
					},
					type: config.makepot.type, // Type of project (wp-plugin or wp-theme).
					updateTimestamp: true, // Whether the POT-Creation-Date should be updated without other changes.
					updatePoFiles: true, // Whether to update PO files in the same directory as the POT file.
					processPot: function(pot, options) {
						pot.headers['report-msgid-bugs-to'] = config.makepot.header.bugs;
						pot.headers['last-translator'] = config.makepot.header.last_translator;
						pot.headers['language-team'] = config.makepot.header.team;
						pot.headers['language'] = config.makepot.header.language;
						var translation, // Exclude meta data from pot.
							excluded_meta = [
								'Plugin Name of the plugin/theme',
								'Plugin URI of the plugin/theme',
								'Author of the plugin/theme',
								'Author URI of the plugin/theme'
							];
						for (translation in pot.translations['']) {
							if ('undefined' !== typeof pot.translations[''][translation].comments.extracted) {
								if (excluded_meta.indexOf(pot.translations[''][translation].comments.extracted) >= 0) {
									console.log('Excluded meta: ' + pot.translations[''][translation].comments.extracted);
									delete pot.translations[''][translation];
								}
							}
						}
						return pot;
					}
				}
			}
		},

		checktextdomain: {
			options:{
				text_domain: config.makepot.domain,
				create_report_file: true,
				keywords: [
					'__:1,2d',
					'_e:1,2d',
					'_x:1,2c,3d',
					'esc_html__:1,2d',
					'esc_html_e:1,2d',
					'esc_html_x:1,2c,3d',
					'esc_attr__:1,2d',
					'esc_attr_e:1,2d',
					'esc_attr_x:1,2c,3d',
					'_ex:1,2c,3d',
					'_n:1,2,4d',
					'_nx:1,2,4c,5d',
					'_n_noop:1,2,3d',
					'_nx_noop:1,2,3c,4d',
					' __ngettext:1,2,3d',
					'__ngettext_noop:1,2,3d',
					'_c:1,2d',
					'_nc:1,2,4c,5d'
					]
				},
				files: {
					src: [
						'**/*.php', // Include all files
						'!node_modules/**', // Exclude node_modules/
						'!build/.*'// Exclude build/
						],
					expand: true
				}
			},

		potomo: {
			dist: {
				options: {
					poDel: false // Set to true if you want to erase the .po
				},
				files: [{
					expand: true,
					cwd: config.makepot.dest,
					src: ['*.po'],
					dest: config.makepot.dest,
					ext: '.mo',
					nonull: true
				}]
			}
		},

		// Clean up build directory
		clean: {
			main: ['build/<%= pkg.name %>']
		},

		// Copy the theme into the build directory
		copy: {
			main: {
				src: [
					'**',
					'!node_modules/**',
					'!build/**',
					'!.git/**',
					'!Gruntfile.js',
					'!package.json',
					'!.files.json',
					'!.gitignore',
					'!.gitmodules',
					'!npm-debug.log',
					'!.tx/**',
					'!**/Gruntfile.js',
					'!**/package.json',
					'!**/README.md',
					'!**/*~',
				],
				dest: 'build/<%= pkg.name %>/'
			}
		},

		// Compress build directory into <name>.zip and <name>-<version>.zip
		compress: {
			main: {
				options: {
					mode: 'zip',
					archive: './build/<%= pkg.name %>.zip'
				},
				expand: true,
				cwd: 'build/<%= pkg.name %>/',
				src: ['**/*'],
				dest: '<%= pkg.name %>/'
			}
		}
	});

	// Default task. - grunt makepot
	grunt.registerTask('default', 'makepot');

	//  Checktextdomain and makepot task(s)
	 grunt.registerTask('do-i18n', ['checktextdomain', 'makepot', 'potomo']);

	// Build task(s).
	grunt.registerTask('build', ['clean', 'copy', 'compress']);
};
