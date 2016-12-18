import { expect } from 'chai';
import { verticalChildren, horizontalChildren } from './helpers/children-stub';

describe('children stub', function () {

  it('should create some stub children (vertical)', function () {
    expect(verticalChildren.length).to.equal(5);
    expect(verticalChildren[0].getAttribute('data-placeholder')).to.be.false;
    expect(verticalChildren[1].getAttribute('data-placeholder')).to.be.true;
    expect(verticalChildren[1].getAttribute('data-dragged')).to.be.false;
    expect(verticalChildren[2].getAttribute('data-dragged')).to.be.true;

    expect(verticalChildren[0].getBoundingClientRect()).to.eql({
      top: 20,
      left: 10,
      bottom: 40,
      right: 110,
      width: 100,
      height: 20
    });

    expect(verticalChildren[3].getBoundingClientRect()).to.eql({
      top: 20 + 20 * 3,
      left: 10,
      bottom: 40 + 20 * 3,
      right: 110,
      width: 100,
      height: 20
    });
  });

  it('should create some stub children (horizontal)', function () {
    expect(horizontalChildren.length).to.equal(5);
    expect(horizontalChildren[0].getAttribute('data-placeholder')).to.be.false;
    expect(horizontalChildren[1].getAttribute('data-placeholder')).to.be.true;
    expect(horizontalChildren[1].getAttribute('data-dragged')).to.be.false;
    expect(horizontalChildren[2].getAttribute('data-dragged')).to.be.true;

    expect(horizontalChildren[0].getBoundingClientRect()).to.eql({
      top: 20,
      left: 10,
      bottom: 40,
      right: 110,
      width: 100,
      height: 20
    });

    expect(horizontalChildren[3].getBoundingClientRect()).to.eql({
      top: 20,
      left: 10 + 100 * 3,
      bottom: 40,
      right: 110 + 100 * 3,
      width: 100,
      height: 20
    });
  });

});
