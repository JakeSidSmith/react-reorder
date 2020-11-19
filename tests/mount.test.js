import { expect } from 'chai';
import { spy } from 'sinon';
import createReactClass from 'create-react-class';
import mount from './helpers/mount';
import React, { Component } from 'react';

describe('mount', function () {

  let wrapper;

  class MyComponent extends Component {
    constructor () {
      super();

      this.displayName = 'MyComponent';
      this.state = {
        foo: 'bar'
      };
    }

    shouldComponentUpdate () {
      return true;
    }

    componentDidUpdate () {}

    componentWillMount () {}

    componentDidMount () {}

    componentWillUnmount () {}

    onClick (event) {
      expect(event.foo).to.equal('bar');
    }

    render () {
      return (
        <div onClick={this.onClick}>
          <span>Foo</span>
          <span>Bar</span>
        </div>
      );
    }
  }

  const AnotherComponent = createReactClass({
    render: function () {
      return <div />;
    }
  });

  const renderSpy = spy(MyComponent.prototype, 'render');
  const shouldComponentUpdateSpy = spy(MyComponent.prototype, 'shouldComponentUpdate');
  const componentDidUpdateSpy = spy(MyComponent.prototype, 'componentDidUpdate');
  const componentWillMountSpy = spy(MyComponent.prototype, 'componentWillMount');
  const componentDidMountSpy = spy(MyComponent.prototype, 'componentDidMount');
  const componentWillUnmountSpy = spy(MyComponent.prototype, 'componentWillUnmount');
  const onClickSpy = spy(MyComponent.prototype, 'onClick');

  it('should render a component & call its lifecycle methods', function () {
    expect(renderSpy).not.to.have.been.called;
    expect(componentWillMountSpy).not.to.have.been.called;
    expect(componentDidMountSpy).not.to.have.been.called;

    wrapper = mount(<MyComponent />);

    expect(renderSpy).to.have.been.calledOnce;
    expect(componentWillMountSpy).to.have.been.calledOnce;
    expect(componentDidMountSpy).to.have.been.calledOnce;

    renderSpy.reset();
    componentWillMountSpy.reset();
    componentDidMountSpy.reset();
  });

  it('should return the components name & tag name', function () {
    expect(wrapper.name()).to.equal('MyComponent');
    expect(wrapper.tagName()).to.equal('div');

    const anotherComponent = mount(<AnotherComponent />);

    expect(anotherComponent.name()).to.equal('AnotherComponent');
  });

  it('should return the components children & loop over a jquery collection', function () {
    let childCount = 0;
    const childText = ['Foo', 'Bar'];
    const children = wrapper.children();

    children.forEach();

    children.forEach(function (child, index) {
      childCount += 1;
      expect(child.text()).to.equal(childText[index]);
    });

    expect(childCount).to.equal(2);
  });

  it('should return and update the component\'s props', function () {
    const originalProps = wrapper.props();

    expect(originalProps).to.eql({});
    expect(shouldComponentUpdateSpy).not.to.have.been.called;
    expect(componentDidUpdateSpy).not.to.have.been.called;

    expect(componentWillMountSpy).not.to.have.been.called;
    expect(componentDidMountSpy).not.to.have.been.called;

    wrapper.setProps({foo: 'bar'});

    expect(shouldComponentUpdateSpy).to.have.been.calledOnce;
    expect(componentDidUpdateSpy).to.have.been.calledOnce;

    const updatedProps = wrapper.props();

    expect(updatedProps).to.eql({foo: 'bar'});

    expect(originalProps).not.to.eql(updatedProps);

    shouldComponentUpdateSpy.reset();
    componentDidUpdateSpy.reset();
  });

  it('should return and update the component\'s state', function () {
    const originalState = wrapper.state();

    expect(originalState).to.eql({foo: 'bar'});
    expect(shouldComponentUpdateSpy).not.to.have.been.called;
    expect(componentDidUpdateSpy).not.to.have.been.called;

    expect(componentWillMountSpy).not.to.have.been.called;
    expect(componentDidMountSpy).not.to.have.been.called;

    wrapper.setState({foo: 'foo', bar: 'foo'});

    expect(shouldComponentUpdateSpy).to.have.been.calledOnce;
    expect(componentDidUpdateSpy).to.have.been.calledOnce;

    const updatedState = wrapper.state();

    expect(updatedState).to.eql({foo: 'foo', bar: 'foo'});

    expect(originalState).not.to.eql(updatedState);

    shouldComponentUpdateSpy.reset();
    componentDidUpdateSpy.reset();
  });

  it('should trigger event listeners', function () {
    const event = {foo: 'bar'};
    wrapper.trigger('click', event);

    expect(onClickSpy).to.have.been.calledOnce;
  });

  it('should unmount a component', function () {
    expect(componentWillUnmountSpy).not.to.have.been.called;

    wrapper.unmount();

    expect(componentWillUnmountSpy).to.have.been.calledOnce;
  });

});
