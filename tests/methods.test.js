import { expect } from 'chai';
import { spy, stub } from 'sinon';
import mount from './helpers/mount';

import React from 'react';
import Reorder from '../src/index';
import { verticalChildren, horizontalChildren } from './helpers/children-stub';

describe('methods', function () {

  it('should return true if the draggedIndex is greater than or equal to zero', function () {
    const wrapper = mount(<Reorder reorderId="id" />);
    const instance = wrapper.instance();

    expect(instance.isDragging()).to.be.false;

    wrapper.setState({draggedIndex: 0});

    expect(instance.isDragging()).to.be.true;

    wrapper.setState({draggedIndex: 10});

    expect(instance.isDragging()).to.be.true;

    wrapper.unmount();
  });

  it('should preventDefault on events', function () {
    const event = {
      preventDefault: spy()
    };

    const wrapper = mount(<Reorder reorderId="id" />);
    const instance = wrapper.instance();

    expect(event.preventDefault).not.to.have.been.called;
    instance.preventNativeScrolling(event);
    expect(event.preventDefault).to.have.been.calledOnce;

    event.preventDefault.reset();

    expect(event.preventDefault).not.to.have.been.called;
    instance.preventContextMenu(event);
    expect(event.preventDefault).not.to.have.been.called;

    wrapper.unmount();
  });

  it('should persist an event if available', function () {
    const event = {};

    const wrapper = mount(<Reorder reorderId="id" />);
    const instance = wrapper.instance();

    instance.persistEvent(event);

    event.persist = spy();

    expect(event.persist).not.to.have.been.called;

    instance.persistEvent(event);

    expect(event.persist).to.have.been.calledOnce;

    wrapper.unmount();
  });

  it('should copy clientX and clientY from touches & persist event', function () {
    const event = {
      persist: spy()
    };

    const wrapper = mount(<Reorder reorderId="id" />);
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

    wrapper.unmount();
  });

  it('should check a collision on the x-axis', function () {
    const wrapper = mount(<Reorder reorderId="id" />);
    const instance = wrapper.instance();

    const rect = {
      left: 50,
      right: 100
    };

    const event = {
      clientX: 20
    };

    expect(instance.xCollision(event, rect)).to.be.false;

    event.clientX = 120;

    expect(instance.xCollision(event, rect)).to.be.false;

    event.clientX = 80;

    expect(instance.xCollision(event, rect)).to.be.true;

    event.clientX = 100;

    expect(instance.xCollision(event, rect)).to.be.true;

    wrapper.unmount();
  });

  it('should check a collision on the y-axis', function () {
    const wrapper = mount(<Reorder reorderId="id" />);
    const instance = wrapper.instance();

    const rect = {
      top: 20,
      bottom: 80
    };

    const event = {
      clientY: 10
    };

    expect(instance.yCollision(event, rect)).to.be.false;

    event.clientY = 100;

    expect(instance.yCollision(event, rect)).to.be.false;

    event.clientY = 50;

    expect(instance.yCollision(event, rect)).to.be.true;

    event.clientY = 80;

    expect(instance.yCollision(event, rect)).to.be.true;

    wrapper.unmount();
  });

  it('should find the first collision of the pointer & children (no lock)', function () {
    const wrapper = mount(<Reorder reorderId="id" />);
    const instance = wrapper.instance();

    const event = {
      clientX: 0,
      clientY: 0
    };

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(-1);

    event.clientX = 30;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(-1);

    event.clientY = 30;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(0);

    event.clientY = 50;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(-1);

    event.clientY = 70;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(-1);

    event.clientY = 90;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(3);

    event.clientX = 200;
    event.clientY = 110;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(-1);

    event.clientX = 50;
    event.clientY = 110;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(4);

    event.clientX = 50;
    event.clientY = 130;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(-1);

    wrapper.unmount();
  });

  it('should find the first collision of the pointer & children (horizontal)', function () {
    const wrapper = mount(<Reorder reorderId="id" lock="horizontal" />);
    const instance = wrapper.instance();

    const event = {
      clientX: 0,
      clientY: 0
    };

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(-1);

    event.clientY = 30;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(0);

    event.clientX = 30;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(0);

    event.clientY = 50;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(-1);

    event.clientY = 70;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(-1);

    event.clientY = 90;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(3);

    event.clientX = 200;
    event.clientY = 110;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(4);

    event.clientX = 50;
    event.clientY = 110;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(4);

    event.clientX = 50;
    event.clientY = 130;

    expect(instance.findCollisionIndex(event, verticalChildren)).to.equal(-1);

    wrapper.unmount();
  });

  it('should find the first collision of the pointer & children (vertical)', function () {
    const wrapper = mount(<Reorder reorderId="id" lock="vertical" />);
    const instance = wrapper.instance();

    const event = {
      clientX: 0,
      clientY: 0
    };

    expect(instance.findCollisionIndex(event, horizontalChildren)).to.equal(-1);

    event.clientX = 30;

    expect(instance.findCollisionIndex(event, horizontalChildren)).to.equal(0);

    event.clientY = 30;

    expect(instance.findCollisionIndex(event, horizontalChildren)).to.equal(0);

    event.clientX = 150;

    expect(instance.findCollisionIndex(event, horizontalChildren)).to.equal(-1);

    event.clientX = 250;

    expect(instance.findCollisionIndex(event, horizontalChildren)).to.equal(-1);

    event.clientX = 350;

    expect(instance.findCollisionIndex(event, horizontalChildren)).to.equal(3);

    event.clientX = 450;
    event.clientY = 110;

    expect(instance.findCollisionIndex(event, horizontalChildren)).to.equal(4);

    event.clientX = 450;
    event.clientY = 0;

    expect(instance.findCollisionIndex(event, horizontalChildren)).to.equal(4);

    event.clientX = 550;
    event.clientY = 130;

    expect(instance.findCollisionIndex(event, horizontalChildren)).to.equal(-1);

    wrapper.unmount();
  });

  it('should return the relevant holdTime', function () {
    const wrapper = mount(<Reorder reorderId="id" />);
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

    wrapper.unmount();
  });

  xit('should return the scroll offset x for auto-scrolling (max scroll area)', function () {
    const maxScrollArea = 50;
    const scrollSpeed = 20;
    const wrapper = mount(<Reorder reorderId="id">{[<li key={0}>Item</li>]}</Reorder>);
    const instance = wrapper.instance();

    const rect = {
      top: 200,
      left: maxScrollArea,
      height: 50, // Larger than maxScrollArea * 3 (as scroll area is divided by 3)
      width: maxScrollArea * 4, // Larger than maxScrollArea * 3 (as scroll area is divided by 3)
      bottom: 250,
      right: maxScrollArea * 5
    };

    const node = {
      scrollTop: 1000, // More than zero, less than scrollHeight
      scrollLeft: 1, // More than zero, less than scrollWidth
      scrollHeight: 2000, // Larger than width & height
      scrollWidth: maxScrollArea * 5 // Larger than width & height
    };

    const expectedScrollOffsets = [-scrollSpeed, -scrollSpeed, 0, 0, 0, scrollSpeed, scrollSpeed];

    const listItem = wrapper.find('li');

    expectedScrollOffsets.forEach(function (expectedScrollOffset, index) {
      const event = {clientX: maxScrollArea * index};

      listItem.trigger('mouseDown', event);

      expect(instance.getScrollOffsetX(rect, node)).to.equal(expectedScrollOffset);
    });

    listItem.trigger('mouseDown', {clientX: maxScrollArea * 1.5});
    expect(instance.getScrollOffsetX(rect, node)).to.equal(-scrollSpeed / 2);
    listItem.trigger('mouseDown', {clientX: maxScrollArea * 4.5});
    expect(instance.getScrollOffsetX(rect, node)).to.equal(scrollSpeed / 2);

    instance.onWindowUp(); // Stop drag
    wrapper.unmount();
  });

  xit('should return the scroll offset y for auto-scrolling (max scroll area)', function () {
    const maxScrollArea = 50;
    const scrollSpeed = 20;
    const wrapper = mount(<Reorder reorderId="id">{[<li key={0}>Item</li>]}</Reorder>);
    const instance = wrapper.instance();

    const rect = {
      top: maxScrollArea,
      left: 200,
      height: maxScrollArea * 4, // Larger than maxScrollArea * 3 (as scroll area is divided by 3)
      width: 50, // Larger than maxScrollArea * 3 (as scroll area is divided by 3)
      bottom: maxScrollArea * 5,
      right: 250
    };

    const node = {
      scrollTop: 1, // More than zero, less than scrollHeight
      scrollLeft: 1000, // More than zero, less than scrollWidth
      scrollHeight: maxScrollArea * 5, // Larger than width & height
      scrollWidth: 2000 // Larger than width & height
    };

    const expectedScrollOffsets = [-scrollSpeed, -scrollSpeed, 0, 0, 0, scrollSpeed, scrollSpeed];

    const listItem = wrapper.find('li');

    expectedScrollOffsets.forEach(function (expectedScrollOffset, index) {
      const event = {clientY: maxScrollArea * index};

      listItem.trigger('mouseDown', event);

      expect(instance.getScrollOffsetY(rect, node)).to.equal(expectedScrollOffset);
    });

    listItem.trigger('mouseDown', {clientY: maxScrollArea * 1.5});
    expect(instance.getScrollOffsetY(rect, node)).to.equal(-scrollSpeed / 2);
    listItem.trigger('mouseDown', {clientY: maxScrollArea * 4.5});
    expect(instance.getScrollOffsetY(rect, node)).to.equal(scrollSpeed / 2);

    instance.onWindowUp(); // Stop drag
    wrapper.unmount();
  });

  xit('should scroll the root node if auto-scroll enabled & pointer is in the right location', function () {
    const wrapper = mount(<Reorder reorderId="id">{[<li key={0}>Item</li>]}</Reorder>);
    const instance = wrapper.instance();
    const listItem = wrapper.find('li');

    expect(instance.rootNode).to.be.ok;

    stub(instance.rootNode, 'getBoundingClientRect', function () {
      return {
        top: 0,
        left: 0,
        height: 100,
        width: 100,
        bottom: 100,
        right: 100
      };
    });

    instance.rootNode.scrollTop = 50;
    instance.rootNode.scrollLeft = 50;
    instance.rootNode.scrollHeight = 200;
    instance.rootNode.scrollWidth = 200;

    listItem.trigger('mouseDown', {
      clientY: 50,
      clientX: 50
    });

    instance.autoScroll();
    expect(instance.rootNode.scrollTop).to.equal(50);
    expect(instance.rootNode.scrollLeft).to.equal(50);

    listItem.trigger('mouseDown', {
      clientY: 100,
      clientX: 50
    });

    instance.autoScroll();
    expect(instance.rootNode.scrollTop).to.equal(70);
    expect(instance.rootNode.scrollLeft).to.equal(50);

    wrapper.setProps({lock: 'vertical'});

    listItem.trigger('mouseDown', {
      clientY: 100,
      clientX: 100
    });

    instance.autoScroll();
    expect(instance.rootNode.scrollTop).to.equal(70);
    expect(instance.rootNode.scrollLeft).to.equal(70);

    wrapper.setProps({lock: 'horizontal'});
    instance.autoScroll();
    expect(instance.rootNode.scrollTop).to.equal(90);
    expect(instance.rootNode.scrollLeft).to.equal(70);

    wrapper.setProps({autoScroll: false});
    instance.autoScroll();
    expect(instance.rootNode.scrollTop).to.equal(90);
    expect(instance.rootNode.scrollLeft).to.equal(70);

    instance.rootNode.getBoundingClientRect.restore();

    instance.onWindowUp(); // Stop drag
    wrapper.unmount();
  });

});
