// Cucumber.js configuration file.
// Cucumber-js automatically loads a file named "cucumber.js" (or cucumber.cjs / cucumber.mjs)
// at the project root and reads the profile named "default" unless another profile is
// requested on the command line (e.g. `cucumber-js --profile ci`).
module.exports = {
  default: {
    // Glob patterns for support code (World definition + hooks) that must be
    // loaded before step definitions so `this.page` etc. are available.
    require: [
      'features/support/**/*.js',
      'features/step_definitions/**/*.js'
    ],
    // Glob pattern for the .feature files that make up the suite.
    paths: ['features/**/*.feature'],
    // Print a live progress bar in the terminal and additionally emit a
    // self-contained HTML report for humans to open after the run.
    format: [
      'progress-bar',
      ['html', 'reports/cucumber-report.html']
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    }
  }
};
