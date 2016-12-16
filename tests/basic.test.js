import { expect } from 'chai';
import { spy } from 'sinon';
import mount from './helpers/mount';
import React, { Component } from 'react';
import Reorder from '../src/index';

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

    it('should add and remove event listeners on mount and unmount', function () {
      const addEventListenerSpy = spy(window, 'addEventListener');
      const removeEventListenerSpy = spy(window, 'removeEventListener');

      const wrapper = mount(<Reorder />);

      const eventCount = addEventListenerSpy.callCount;

      expect(addEventListenerSpy).to.have.been.called;
      expect(removeEventListenerSpy).not.to.have.been.called;

      addEventListenerSpy.reset();
      removeEventListenerSpy.reset();

      wrapper.unmount();

      expect(addEventListenerSpy).not.to.have.been.called;
      expect(removeEventListenerSpy).to.have.been.called;

      expect(removeEventListenerSpy.callCount).to.be.above(0);
      expect(removeEventListenerSpy.callCount).to.equal(eventCount);

      addEventListenerSpy.restore();
      removeEventListenerSpy.restore();
    });

  });

});
