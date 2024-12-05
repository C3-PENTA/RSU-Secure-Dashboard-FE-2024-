// Configuration for commitlint to enforce conventional commit messages.
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'improve', // Code improvement
        'refactor', // Code refactor
        'docs', // Documentation changes
        'chore', // Maintenance tasks or minor changes
        'style', // Code style changes (whitespace, formatting, etc.)
        'test', // Adding or modifying tests
        'revert', // Reverting a previous commit
        'ci', // Changes to CI/CD pipeline configuration
        'build', // Changes that affect the build system or external dependencies
      ],
    ],
    'type-case': [2, 'always', 'lower-case'], // Type (e.g., 'feat') should be in lower case
    'type-empty': [2, 'never'], // Type should not be empty
    'scope-empty': [2, 'never'], // Scope should not be empty
    'subject-empty': [2, 'never'], // Subject should not be empty
    'subject-full-stop': [2, 'never', '.'], // Subject should not end with a period
    'header-max-length': [2, 'always', 72], // Header should not exceed 72 characters
  },
};
