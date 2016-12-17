import { expect } from 'chai';
import { spy } from 'sinon';
import mount from './helpers/mount';

import React, { Component } from 'react';
import { List } from 'immutable';
import Reorder, { reorder, reorderImmutable } from '../src/index';

describe('Reorder', function () {

  const items = [
    {
      name: 'Foo',
      id: 'foo'
    },
    {
      name: 'Bar',
      id: 'bar'
    },
    {
      name: 'Fizz',
      id: 'fizz'
    },
    {
      name: 'Buzz',
      id: 'buzz'
    }
  ];

  describe('exports', function () {

    it('should provide a react component and some helpful functions', function () {
      expect(typeof Reorder).to.equal('function');
      expect(typeof reorder).to.equal('function');
      expect(typeof reorderImmutable).to.equal('function');

      const requiredReorder = require('../src/index');

      expect(typeof requiredReorder).to.equal('function');
      expect(typeof requiredReorder.reorder).to.equal('function');
      expect(typeof requiredReorder.reorderImmutable).to.equal('function');
    });

  });

  describe('basic rendering', function () {

    it('should render itself & its children', function () {
      const wrapper = mount(
        <Reorder>
          {
            items.map((item) => (
              <span key={item.id}>
                {item.name}
              </span>
            ))
          }
        </Reorder>
      );

      const children = wrapper.children();

      expect(wrapper.tagName()).to.equal('div');
      expect(children.length).to.equal(4);

      children.forEach(function (child) {
        expect(child.tagName()).to.equal('span');
      });
    });

    it('should have a name & default props', function () {
      const wrapper = mount(
        <Reorder>
          {
            items.map((item) => (
              <span key={item.id}>
                {item.name}
              </span>
            ))
          }
        </Reorder>
      );

      expect(wrapper.name()).to.equal('Reorder');

      const props = wrapper.props();

      expect(props.component).to.equal('div');
      expect(props.placeholderClassName).to.equal('placeholder');
      expect(props.draggedClassName).to.equal('dragged');
      expect(props.holdTime).to.equal(0);
    });

  });

  describe('props', function () {

    it('should allow defining the root component (string)', function () {
      const wrapper = mount(<Reorder component="ul" />);

      expect(wrapper.tagName()).to.equal('ul');
    });

    it('should allow defining the root component (function)', function () {
      function MyComponent () {
        return <h1 />;
      }

      const wrapper = mount(<Reorder component={MyComponent} />);

      expect(wrapper.name()).to.equal('Reorder');
      expect(wrapper.tagName()).to.equal('h1');
    });

    it('should allow defining the root component (component)', function () {
      class MyComponent extends Component {
        render () {
          return <h2 />;
        }
      }

      const wrapper = mount(<Reorder component={MyComponent} />);

      expect(wrapper.name()).to.equal('Reorder');
      expect(wrapper.tagName()).to.equal('h2');
    });

    it('should call a ref function (if provided) with the root element', function () {
      const refSpy = spy();

      mount(<Reorder getRef={refSpy} />);

      expect(refSpy).to.have.been.called;
    });

  });

  describe('mounting & unmounting', function () {

    it('should add and remove event listeners on mount and unmount', function () {
      const addEventListenerSpy = spy(window, 'addEventListener');
      const removeEventListenerSpy = spy(window, 'removeEventListener');

      const events = [
        'mouseup',
        'touchend',
        'mousemove',
        'touchmove',
        'contextmenu'
      ];

      const wrapper = mount(<Reorder />);

      expect(addEventListenerSpy).to.have.been.called;
      expect(removeEventListenerSpy).not.to.have.been.called;
      expect(addEventListenerSpy.callCount).to.equal(events.length);

      events.forEach(function (event) {
        expect(addEventListenerSpy).to.have.been.calledWith(event);
      });

      addEventListenerSpy.reset();
      removeEventListenerSpy.reset();

      wrapper.unmount();

      expect(addEventListenerSpy).not.to.have.been.called;
      expect(removeEventListenerSpy).to.have.been.called;
      expect(removeEventListenerSpy.callCount).to.equal(events.length);

      events.forEach(function (event) {
        expect(removeEventListenerSpy).to.have.been.calledWith(event);
      });

      addEventListenerSpy.restore();
      removeEventListenerSpy.restore();
    });

    it('should clear timeouts & intervals on unmount', function () {
      const clearTimeoutSpy = spy(global, 'clearTimeout');
      const clearIntervalSpy = spy(global, 'clearInterval');

      const wrapper = mount(<Reorder />);
      const instance = wrapper.instance();

      instance.holdTimeout = {
        foo: 'bar'
      };
      instance.scrollInterval = {
        bar: 'foo'
      };

      wrapper.unmount();

      expect(clearTimeoutSpy).to.have.been.called;
      expect(clearIntervalSpy).to.have.been.called;

      expect(clearTimeoutSpy).to.have.been.calledWith(instance.holdTimeout);
      expect(clearIntervalSpy).to.have.been.calledWith(instance.scrollInterval);

      clearTimeoutSpy.restore();
      clearIntervalSpy.restore();
    });

  });

  describe('methods', function () {

    it('should return true if the draggedIndex is greater than or equal to zero', function () {
      const wrapper = mount(<Reorder />);
      const instance = wrapper.instance();

      expect(instance.isDragging()).to.be.false;

      wrapper.setState({draggedIndex: 0});

      expect(instance.isDragging()).to.be.true;

      wrapper.setState({draggedIndex: 10});

      expect(instance.isDragging()).to.be.true;
    });

    it('should preventDefault on events', function () {
      const event = {
        preventDefault: spy()
      };

      const wrapper = mount(<Reorder />);
      const instance = wrapper.instance();

      expect(event.preventDefault).not.to.have.been.called;

      instance.preventDefault(event);

      expect(event.preventDefault).to.have.been.called;
    });

  });

  describe('helper functions', function () {

    it('should reorder an array', function () {
      const arr = [1, 2, 3, 4, 5];

      const reordered = reorder(arr, 1, 3);

      expect(reordered).not.to.equal(arr);
      expect(reordered).to.eql([1, 3, 4, 2, 5]);
    });

    it('should reorder an immutable list', function () {
      const list = List([1, 2, 3, 4, 5]);

      const reordered = reorderImmutable(list, 4, 0);

      expect(reordered).not.to.equal(list);
      expect(reordered.toJS()).to.eql([5, 1, 2, 3, 4]);
    });

  });

});
