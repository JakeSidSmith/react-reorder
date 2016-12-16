import { expect } from 'chai';
import { spy } from 'sinon';
import mount from './helpers/mount';
import React, { Component } from 'react';

describe('mount', function () {

  // let wrapper;

  class MyComponent extends Component {
    render () {
      return <div />;
    }
  }

  const renderSpy = spy(MyComponent.prototype, 'render');

  it('should render a component', function () {
    // wrapper =
    mount(<MyComponent />);

    expect(renderSpy).to.have.been.called;

    renderSpy.reset();
  });

});
