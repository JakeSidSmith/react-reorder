import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import React from 'react';
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

  it('should render itself & its children', function () {
    const wrapper = shallow(
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

    expect(wrapper.type()).to.equal('div');
    expect(children.length).to.equal(4);

    children.forEach(function (child) {
      expect(child.type()).to.equal('span');
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
