import { expect } from 'chai';
import { spy } from 'sinon';
import mount from './helpers/mount';

import React from 'react';
import Reorder from '../src/index';
import { verticalChildren, horizontalChildren } from './helpers/children-stub';

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
    expect(event.preventDefault).to.have.been.calledOnce;

    event.preventDefault.reset();

    expect(event.preventDefault).not.to.have.been.called;
    instance.preventNativeScrolling(event);
    expect(event.preventDefault).to.have.been.calledOnce;
  });

  it('should persist an event if available', function () {
    const event = {};

    const wrapper = mount(<Reorder />);
    const instance = wrapper.instance();

    instance.persistEvent(event);

    event.persist = spy();

    expect(event.persist).not.to.have.been.called;

    instance.persistEvent(event);

    expect(event.persist).to.have.been.calledOnce;
  });

  it('should copy clientX and clientY from touches & persist event', function () {
    const event = {
      persist: spy()
    };

    const wrapper = mount(<Reorder />);
    const instance = wrapper.instance();

    expect(event.persist).not.to.have.been.called;

    instance.copyTouchKeys(event);

    expect(event.persist).not.to.have.been.called;
    expect(event.clientX).not.to.be.ok;
    expect(event.clientY).not.to.be.ok;

    event.touches = [
      {
        clientX: 123,
        clientY: 456
      }
    ];

    instance.copyTouchKeys(event);

    expect(event.persist).to.have.been.calledOnce;
    expect(event.clientX).to.equal(123);
    expect(event.clientY).to.equal(456);
  });

  it('should check a collision on the x-axis', function () {
    const wrapper = mount(<Reorder />);
    const instance = wrapper.instance();

    const rect = {
      left: 50,
      right: 100
    };

    const event = {
      clientX: 20
    };

    expect(instance.xCollision(rect, event)).to.be.false;

    event.clientX = 120;

    expect(instance.xCollision(rect, event)).to.be.false;

    event.clientX = 80;

    expect(instance.xCollision(rect, event)).to.be.true;

    event.clientX = 100;

    expect(instance.xCollision(rect, event)).to.be.true;
  });

  it('should check a collision on the y-axis', function () {
    const wrapper = mount(<Reorder />);
    const instance = wrapper.instance();

    const rect = {
      top: 20,
      bottom: 80
    };

    const event = {
      clientY: 10
    };

    expect(instance.yCollision(rect, event)).to.be.false;

    event.clientY = 100;

    expect(instance.yCollision(rect, event)).to.be.false;

    event.clientY = 50;

    expect(instance.yCollision(rect, event)).to.be.true;

    event.clientY = 80;

    expect(instance.yCollision(rect, event)).to.be.true;
  });

  it('should find the first collision of the pointer & children (no lock)', function () {
    const wrapper = mount(<Reorder />);
    const instance = wrapper.instance();

    const event = {
      clientX: 0,
      clientY: 0
    };

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(-1);

    event.clientX = 30;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(-1);

    event.clientY = 30;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(0);

    event.clientY = 50;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(-1);

    event.clientY = 70;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(-1);

    event.clientY = 90;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(3);

    event.clientX = 200;
    event.clientY = 110;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(-1);

    event.clientX = 50;
    event.clientY = 110;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(4);

    event.clientX = 50;
    event.clientY = 130;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(-1);
  });

  it('should find the first collision of the pointer & children (horizontal)', function () {
    const wrapper = mount(<Reorder lock="horizontal" />);
    const instance = wrapper.instance();

    const event = {
      clientX: 0,
      clientY: 0
    };

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(-1);

    event.clientY = 30;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(0);

    event.clientX = 30;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(0);

    event.clientY = 50;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(-1);

    event.clientY = 70;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(-1);

    event.clientY = 90;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(3);

    event.clientX = 200;
    event.clientY = 110;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(4);

    event.clientX = 50;
    event.clientY = 110;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(4);

    event.clientX = 50;
    event.clientY = 130;

    expect(instance.findCollisionIndex(verticalChildren, event)).to.equal(-1);
  });

  it('should find the first collision of the pointer & children (vertical)', function () {
    const wrapper = mount(<Reorder lock="vertical" />);
    const instance = wrapper.instance();

    const event = {
      clientX: 0,
      clientY: 0
    };

    expect(instance.findCollisionIndex(horizontalChildren, event)).to.equal(-1);

    event.clientX = 30;

    expect(instance.findCollisionIndex(horizontalChildren, event)).to.equal(0);

    event.clientY = 30;

    expect(instance.findCollisionIndex(horizontalChildren, event)).to.equal(0);

    event.clientX = 150;

    expect(instance.findCollisionIndex(horizontalChildren, event)).to.equal(-1);

    event.clientX = 250;

    expect(instance.findCollisionIndex(horizontalChildren, event)).to.equal(-1);

    event.clientX = 350;

    expect(instance.findCollisionIndex(horizontalChildren, event)).to.equal(3);

    event.clientX = 450;
    event.clientY = 110;

    expect(instance.findCollisionIndex(horizontalChildren, event)).to.equal(4);

    event.clientX = 450;
    event.clientY = 0;

    expect(instance.findCollisionIndex(horizontalChildren, event)).to.equal(4);

    event.clientX = 550;
    event.clientY = 130;

    expect(instance.findCollisionIndex(horizontalChildren, event)).to.equal(-1);
  });

  it('should return the relevant holdTime', function () {
    const wrapper = mount(<Reorder />);
    const instance = wrapper.instance();

    expect(instance.getHoldTime({})).to.equal(0);
    expect(instance.getHoldTime({touches: []})).to.equal(0);

    wrapper.setProps({holdTime: 50});

    expect(instance.getHoldTime({})).to.equal(50);
    expect(instance.getHoldTime({touches: []})).to.equal(50);

    wrapper.setProps({holdTime: 50, touchHoldTime: 500});

    expect(instance.getHoldTime({})).to.equal(50);
    expect(instance.getHoldTime({touches: []})).to.equal(500);

    wrapper.setProps({holdTime: 50, mouseHoldTime: 250, touchHoldTime: 500});

    expect(instance.getHoldTime({})).to.equal(250);
    expect(instance.getHoldTime({touches: []})).to.equal(500);

    wrapper.setProps({holdTime: NaN});

    expect(instance.getHoldTime({})).to.equal(0);
    expect(instance.getHoldTime({touches: []})).to.equal(0);

    wrapper.setProps({holdTime: NaN, mouseHoldTime: NaN, touchHoldTime: NaN});

    expect(instance.getHoldTime({})).to.equal(0);
    expect(instance.getHoldTime({touches: []})).to.equal(0);
  });

  it('should return the scroll offset x for autoscrolling', function () {
    const wrapper = mount(<Reorder />);
    const instance = wrapper.instance();

    const rect = {
      top: 10,
      left: 10,
      right: 110,
      bottom: 110,
      width: 100,
      height: 100
    };

    const node = {
      scrollTop: 50,
      scrollLeft: 50,
      scrollHeight: 200,
      scrollWidth: 200
    };

    const mouseOffset = {
      clientX: 50,
      clientY: 50
    };

    expect(instance.getScrollOffsetX(rect, node, mouseOffset)).to.equal(0);

    mouseOffset.clientX = 0;

    expect(instance.getScrollOffsetX(rect, node, mouseOffset)).to.equal(-20);

    mouseOffset.clientX = 120;

    expect(instance.getScrollOffsetX(rect, node, mouseOffset)).to.equal(20);
  });

});
