import { expect } from 'chai';
import { verticalChildren } from './helpers/children-stub';

describe('children stub', function () {

  it('should create some mock children', function () {
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

});
