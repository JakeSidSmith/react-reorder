import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';

// Override trigger method with one from TestUtils
$.fn.trigger = function (type, data) {
  TestUtils.Simulate[type](this[0], data);
};

$.fn.tagName = function () {
  return this[0].tagName.toLowerCase();
};

$.fn.forEach = function (fn) {
  return this.each(function (index) {
    if (typeof fn === 'function') {
      fn($(this), index);
    }
  });
};

function defineProperty (obj, prop, value) {
  Object.defineProperty(obj, prop, {value, enumerable: false});
}

function internalMount (component, element) {
  element = typeof element !== 'undefined' ? element : document.createElement('div');

  let instance = ReactDOM.render(component, element);
  let wrapper = $(ReactDOM.findDOMNode(instance));

  defineProperty(wrapper, 'instance', function () {
    return instance;
  });

  defineProperty(wrapper, 'name', function () {
    return instance.constructor.displayName || instance.displayName;
  });

  defineProperty(wrapper, 'props', function () {
    return instance.props;
  });

  defineProperty(wrapper, 'state', function () {
    return instance.state;
  });

  defineProperty(wrapper, 'setProps', function (props) {
    const clone = React.cloneElement(component, props);

    internalMount(clone, element);
  });

  defineProperty(wrapper, 'setState', function (state) {
    instance.setState(state);
  });

  defineProperty(wrapper, 'unmount', function () {
    ReactDOM.unmountComponentAtNode(element);
  });

  return wrapper;
}

export default function mount (component) {
  return internalMount(component);
}
