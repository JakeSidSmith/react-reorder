// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
require.config({
  baseUrl: 'lib',
  paths: {
    js: '../js',
    react: 'react/react.min',
    JSXTransformer: 'requirejs/JSXTransformer-0.10.0',
    text: 'requirejs/text',
    jsx: 'requirejs/jsx',
    reorderable: 'react-reorderable/reorderable'
  }
});

// Start loading the main app file. Put all of
// your application logic in there.
require(['jsx!js/main']);
