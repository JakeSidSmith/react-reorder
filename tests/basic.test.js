import { expect } from 'chai';
import { spy } from 'sinon';
import mount from './helpers/mount';

import React, { Component } from 'react';
import { List } from 'immutable';
import Reorder, { reorder, reorderImmutable, reorderFromTo, reorderFromToImmutable } from '../src/index';

describe('basic', function () {

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
        <Reorder reorderId="id">
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

      wrapper.unmount();
    });

    it('should have a name & default props', function () {
      const wrapper = mount(
        <Reorder reorderId="id">
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

      wrapper.unmount();
    });

    it('should store a reference to its root node', function () {
      const wrapper = mount(<Reorder reorderId="id" />);
      const instance = wrapper.instance();

      expect(instance.rootNode).to.be.ok;

      wrapper.unmount();
    });

  });

  describe('props', function () {

    it('should allow defining the root component (string)', function () {
      const wrapper = mount(<Reorder reorderId="id" component="ul" />);

      expect(wrapper.tagName()).to.equal('ul');

      wrapper.unmount();
    });

    it('should allow defining the root component (function)', function () {
      function MyComponent () {
        return <h1 />;
      }

      const wrapper = mount(<Reorder reorderId="id" component={MyComponent} />);

      expect(wrapper.name()).to.equal('Reorder');
      expect(wrapper.tagName()).to.equal('h1');

      wrapper.unmount();
    });

    it('should allow defining the root component (component)', function () {
      class MyComponent extends Component {
        render () {
          return <h2 />;
        }
      }

      const wrapper = mount(<Reorder reorderId="id" component={MyComponent} />);

      expect(wrapper.name()).to.equal('Reorder');
      expect(wrapper.tagName()).to.equal('h2');

      wrapper.unmount();
    });

    it('should call a ref function (if provided) with the root element', function () {
      const refSpy = spy();

      const wrapper = mount(<Reorder reorderId="id" getRef={refSpy} />);

      expect(refSpy).to.have.been.calledOnce;

      wrapper.unmount();
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

      const wrapper = mount(<Reorder reorderId="id" />);

      events.forEach(function (event) {
        expect(addEventListenerSpy).to.have.been.calledWith(event);
        expect(removeEventListenerSpy).not.to.have.been.calledWith(event);
      });

      addEventListenerSpy.reset();
      removeEventListenerSpy.reset();

      wrapper.unmount();

      events.forEach(function (event) {
        expect(addEventListenerSpy).not.to.have.been.calledWith(event);
        expect(removeEventListenerSpy).to.have.been.calledWith(event);
      });

      addEventListenerSpy.restore();
      removeEventListenerSpy.restore();

      wrapper.unmount();
    });

    it('should clear timeouts & intervals on unmount', function () {
      const clearTimeoutSpy = spy(global, 'clearTimeout');
      const clearIntervalSpy = spy(global, 'clearInterval');

      const wrapper = mount(<Reorder reorderId="id" />);
      const instance = wrapper.instance();

      instance.holdTimeout = {
        foo: 'bar'
      };
      instance.scrollInterval = {
        bar: 'foo'
      };

      wrapper.unmount();

      expect(clearTimeoutSpy).to.have.been.calledOnce;
      expect(clearIntervalSpy).not.to.have.been.calledOnce;

      expect(clearTimeoutSpy).to.have.been.calledWith(instance.holdTimeout);

      clearTimeoutSpy.restore();
      clearIntervalSpy.restore();

      wrapper.unmount();
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

    it('should reorder an item from one array to another', function () {
      const from = [1, 2, 3, 4, 5];
      const to = [1, 2, 3, 4, 5];

      const reordered = reorderFromTo({from, to}, 0, 2);

      expect(reordered.from).to.eql([2, 3, 4, 5]);
      expect(reordered.to).to.eql([1, 2, 1, 3, 4, 5]);
    });

    it('should reorder an item from one array to another', function () {
      const from = List([1, 2, 3, 4, 5]);
      const to = List([1, 2, 3, 4, 5]);

      const reordered = reorderFromToImmutable({from, to}, 4, 1);

      expect(reordered.from.toJS()).to.eql([1, 2, 3, 4]);
      expect(reordered.to.toJS()).to.eql([1, 5, 2, 3, 4, 5]);
    });

  });

});
