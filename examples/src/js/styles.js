'use strict';

(function () {

  var ReactStyleSheets = require('react-style-sheets');

  ReactStyleSheets.setOptions({
    vendorPrefixes: {
      userSelect: ['webkit', 'khtml', 'moz', 'ms', 'o']
    }
  });

  var htmlBody = {
    padding: 0,
    margin: 0,
    fontFamily: ['arial', 'helvetica', 'sans-serif'],
    fontSize: 14,
    color: '#333',
    WebkitTouchCallout: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent'
  };

  ReactStyleSheets.createGlobalTagStyles({
    '*': {
      boxSizing: 'border-box'
    },
    html: htmlBody,
    body: htmlBody,
    p: {
      margin: [10, 'auto']
    }
  });

})();
