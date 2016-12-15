import ReactStyleSheets from 'react-style-sheets';

ReactStyleSheets.setOptions({
  vendorPrefixes: {
    userSelect: ['webkit', 'khtml', 'moz', 'ms', 'o'],
    transform: ['webkit', 'moz', 'ms', 'o'],
    transition: ['webkit', 'moz', 'ms', 'o'],
    transformOrigin: ['webkit', 'moz', 'ms', 'o']
  }
});

const htmlBody = {
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
