import { expect } from 'chai';
import { spy } from 'sinon';
import mount from './helpers/mount';
import React, { Component } from 'react';

describe('mount', function () {

  let wrapper;

  class MyComponent extends Component {
    shouldComponentUpdate () {
      return true;
    }

    componentDidUpdate () {}

    componentWillMount () {}

    componentDidMount () {}

    componentWillUnmount () {}

    render () {
      return <div />;
    }
  }

  const renderSpy = spy(MyComponent.prototype, 'render');
  const shouldComponentUpdateSpy = spy(MyComponent.prototype, 'shouldComponentUpdate');
  const componentDidUpdateSpy = spy(MyComponent.prototype, 'componentDidUpdate');
  const componentWillMountSpy = spy(MyComponent.prototype, 'componentWillMount');
  const componentDidMountSpy = spy(MyComponent.prototype, 'componentDidMount');
  const componentWillUnmountSpy = spy(MyComponent.prototype, 'componentWillUnmount');

  it('should render a component & call its lifecycle methods', function () {
    expect(renderSpy).not.to.have.been.called;
    expect(componentWillMountSpy).not.to.have.been.called;
    expect(componentDidMountSpy).not.to.have.been.called;

    wrapper = mount(<MyComponent />);

    expect(renderSpy).to.have.been.called;
    expect(componentWillMountSpy).to.have.been.called;
    expect(componentDidMountSpy).to.have.been.called;

    renderSpy.reset();
    componentWillMountSpy.reset();
    componentDidMountSpy.reset();
  });

  it('should return and update the component\'s props', function () {
    const originalProps = wrapper.props();

    expect(originalProps).to.eql({});
    expect(shouldComponentUpdateSpy).not.to.have.been.called;
    expect(componentDidUpdateSpy).not.to.have.been.called;

    wrapper.setProps({foo: 'bar'});

    expect(shouldComponentUpdateSpy).to.have.been.called;
    expect(componentDidUpdateSpy).to.have.been.called;

    const updatedProps = wrapper.props();

    expect(updatedProps).to.eql({foo: 'bar'});

    expect(originalProps).not.to.eql(updatedProps);
  });

  it('should unmount a component', function () {
    expect(componentWillUnmountSpy).not.to.have.been.called;

    wrapper.unmount();

    expect(componentWillUnmountSpy).to.have.been.called;
  });

});
