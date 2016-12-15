import chai from 'chai';
import sinonChai from 'sinon-chai';
import jsdom from 'jsdom';

// Jsdom document & window
const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
const win = doc.defaultView;

// Add to global
global.document = doc; // eslint-disable-line no-undef
global.window = win; // eslint-disable-line no-undef

// Add window keys to global window
Object.keys(window).forEach((key) => {
  if (!(key in global)) { // eslint-disable-line no-undef
    global[key] = window[key]; // eslint-disable-line no-undef
  }
});

chai.expect();
chai.use(sinonChai);
