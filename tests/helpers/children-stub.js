// [item, placeholder, dragged, item, item]

export const verticalChildren = [];
export const horizontalChildren = [];

const itemSize = {
  width: 100,
  height: 20,
  left: 10,
  top: 20
};

for (let i = 0; i < 5; i += 1) {
  const index = i;

  verticalChildren.push({
    getAttribute: function (attr) {
      if (attr === 'data-placeholder' && index === 1) {
        return true;
      }

      if (attr === 'data-dragged' && index === 2) {
        return true;
      }

      return false;
    },
    getBoundingClientRect: function () {
      return {
        top: itemSize.top + (itemSize.height * index),
        bottom: itemSize.top + (itemSize.height * index) + itemSize.height,
        left: itemSize.left,
        right: itemSize.left + itemSize.width,
        width: itemSize.width,
        height: itemSize.height
      };
    }
  });

  horizontalChildren.push({
    getAttribute: function (attr) {
      if (attr === 'data-placeholder' && index === 1) {
        return true;
      }

      if (attr === 'data-dragged' && index === 2) {
        return true;
      }

      return false;
    },
    getBoundingClientRect: function () {
      return {
        top: itemSize.top,
        bottom: itemSize.top + itemSize.height,
        left: itemSize.left + (itemSize.width * index),
        right: itemSize.left + (itemSize.width * index) + itemSize.width,
        width: itemSize.width,
        height: itemSize.height
      };
    }
  });
}
