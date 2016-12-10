'use strict';

(function () {

  var CONSTANTS = {
    HOLD_THRESHOLD: 8,
    SCROLL_INTERVAL: 1000 / 60,
    SCROLL_AREA_MAX: 50,
    SCROLL_SPEED: 20
  };

  function extend (obj1, obj2, obj3) {
    for (var key2 in obj2) {
      obj1[key2] = obj2[key2];
    }

    for (var key3 in obj3) {
      obj1[key3] = obj3[key3];
    }

    return obj1;
  }

  function reorder (list, previousIndex, nextIndex) {
    list = [].concat(list);
    return list.splice(nextIndex, 0, list.splice(previousIndex, 1)[0]);
  }

  function reorderImmutable (list, previousIndex, nextIndex) {
    return list.delete(previousIndex).splice(nextIndex, 0, list.get(previousIndex));
  }

  function withReorderMethods (Reorder) {
    Reorder.reorder = reorder;
    Reorder.reorderImmutable = reorderImmutable;
    return Reorder;
  }

  function getReorderComponent (React, ReactDOM) {
    return React.createClass({
      displayName: 'Reorder',

      getInitialState: function () {
        return {
          draggedIndex: -1,
          draggedStyle: null
        };
      },

      isDragging: function () {
        return this.state.draggedIndex >= 0;
      },

      preventDefault: function (event) {
        event.preventDefault();
      },

      preventDefaultIfDragging: function (event) {
        if (this.isDragging()) {
          event.preventDefault();
        }
      },

      preventNativeScrolling: function (event) {
        event.preventDefault();
      },

      persistEvent: function (event) {
        if (typeof event.persist === 'function') {
          event.persist();
        }
      },

      copyTouchKeys: function (event) {
        if (event.touches && event.touches[0]) {
          this.persistEvent(event);

          event.clientX = event.touches[0].clientX;
          event.clientY = event.touches[0].clientY;
        }
      },

      xCollision: function (rect, event) {
        return event.clientX >= rect.left && event.clientX <= rect.right;
      },

      yCollision: function (rect, event) {
        return event.clientY >= rect.top && event.clientY <= rect.bottom;
      },

      findCollisionIndex: function (listElements, event) {
        for (var i = 0; i < listElements.length; i += 1) {
          if (!listElements[i].getAttribute('data-placeholder') && !listElements[i].getAttribute('data-dragged')) {

            var rect = listElements[i].getBoundingClientRect();

            switch (this.props.lock) {
              case 'horizontal':
                if (this.yCollision(rect, event)) {
                  return i;
                }
                break;
              case 'vertical':
                if (this.xCollision(rect, event)) {
                  return i;
                }
                break;
              default:
                if (this.yCollision(rect, event) && this.xCollision(rect, event)) {
                  return i;
                }
                break;
            }

          }

        }

        return -1;
      },

      getHoldTime: function (event) {
        if (event.touches && typeof this.props.touchHoldTime !== 'undefined') {
          return parseInt(this.props.touchHoldTime, 10) || 0;
        } else if (typeof this.props.mouseHoldTime !== 'undefined') {
          return parseInt(this.props.mouseHoldTime, 10) || 0;
        }

        return parseInt(this.props.holdTime, 10) || 0;
      },

      autoScroll: function () {
        var rect = this.rootNode.getBoundingClientRect();

        var scrollTop = this.rootNode.scrollTop;
        var scrollLeft = this.rootNode.scrollLeft;

        var scrollHeight = this.rootNode.scrollHeight;
        var scrollWidth = this.rootNode.scrollWidth;

        var scrollAreaX = Math.min(rect.width / 3, CONSTANTS.SCROLL_AREA_MAX);
        var scrollAreaY = Math.min(rect.height / 3, CONSTANTS.SCROLL_AREA_MAX);

        var scrollMultiplier;

        if (this.props.lock !== 'horizontal') {
          if (scrollLeft > 0 && this.mouseOffset.clientX <= rect.left + scrollAreaX) {
            scrollMultiplier = Math.min(Math.abs(rect.left + scrollAreaX - this.mouseOffset.clientX), scrollAreaX) /
              scrollAreaX;

            this.rootNode.scrollLeft = this.rootNode.scrollLeft - scrollMultiplier * CONSTANTS.SCROLL_SPEED;
          }

          if (scrollLeft < scrollWidth - rect.width && this.mouseOffset.clientX >= rect.right - scrollAreaX) {
            scrollMultiplier = Math.min(Math.abs(rect.right - scrollAreaX - this.mouseOffset.clientX), scrollAreaX) /
              scrollAreaX;

            this.rootNode.scrollLeft = this.rootNode.scrollLeft + scrollMultiplier * CONSTANTS.SCROLL_SPEED;
          }
        }

        if (this.props.lock !== 'vertical') {
          if (scrollTop > 0 && this.mouseOffset.clientY <= rect.top + scrollAreaY) {
            scrollMultiplier = Math.min(Math.abs(rect.top + scrollAreaY - this.mouseOffset.clientY), scrollAreaY) /
              scrollAreaY;

            this.rootNode.scrollTop = this.rootNode.scrollTop - scrollMultiplier * CONSTANTS.SCROLL_SPEED;
          }

          if (scrollTop < scrollHeight - rect.height && this.mouseOffset.clientY >= rect.bottom - scrollAreaY) {
            scrollMultiplier = Math.min(Math.abs(rect.bottom - scrollAreaY - this.mouseOffset.clientY), scrollAreaY) /
              scrollAreaY;

            this.rootNode.scrollTop = this.rootNode.scrollTop + scrollMultiplier * CONSTANTS.SCROLL_SPEED;
          }
        }
      },

      startDrag: function (event, target, index) {
        if (!this.moved) {
          this.scrollInterval = setInterval(this.autoScroll, CONSTANTS.SCROLL_INTERVAL);
          var rect = target.getBoundingClientRect();

          this.setState({
            draggedIndex: index,
            placedIndex: index,
            draggedStyle: {
              position: 'fixed',
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          });

          this.mouseOffset = {
            clientX: event.clientX,
            clientY: event.clientY
          };

          this.mouseDownOffset = {
            clientX: event.clientX - rect.left,
            clientY: event.clientY - rect.top
          };
        }
      },

      // Begin dragging index, set initial drag style, set placeholder position, calculate mouse offset
      onItemDown: function (callback, index, event) {
        if (typeof callback === 'function') {
          callback(event);
        }

        if (event.button === 2 || this.props.disabled) {
          return;
        }

        this.copyTouchKeys(event);

        this.moved = false;
        this.downPos = {
          clientX: event.clientX,
          clientY: event.clientY
        };

        var holdTime = this.getHoldTime(event);
        var target = event.currentTarget;

        if (holdTime) {
          this.persistEvent(event);
          this.holdTimeout = setTimeout(this.startDrag.bind(this, event, target, index), holdTime);
        } else {
          this.startDrag(event, target, index);
        }
      },

      onItemMove: function (callback, index, event) {
        if (typeof callback === 'function') {
          callback(event);
        }

        if (event.button === 2 || this.props.disabled) {
          return;
        }

        this.copyTouchKeys(event);
      },

      onListDown: function (callback, event) {
        if (typeof callback === 'function') {
          callback(event);
        }

        if (event.button === 2 || this.props.disabled) {
          return;
        }

        this.copyTouchKeys(event);
      },

      // Handle moving from one list to another
      onListMove: function (callback, event) {
        if (typeof callback === 'function') {
          callback(event);
        }

        if (event.button === 2 || this.props.disabled) {
          return;
        }

        this.copyTouchKeys(event);
      },

      // Handle same as list move
      onListUp: function (callback, event) {
        if (typeof callback === 'function') {
          callback(event);
        }

        if (event.button === 2 || this.props.disabled) {
          return;
        }

        this.copyTouchKeys(event);
      },

      // Stop dragging - reset style & draggedIndex, handle reorder
      onWindowUp: function (event) {
        clearTimeout(this.holdTimeout);
        clearInterval(this.scrollInterval);

        var fromIndex = this.state.draggedIndex;
        var toIndex = this.state.placedIndex;

        if (
          typeof this.props.onReorder === 'function' &&
          fromIndex !== toIndex &&
          fromIndex >= 0
        ) {
          this.props.onReorder(event, fromIndex, toIndex - (fromIndex < toIndex ? 1 : 0));
        }

        this.setState({
          placedIndex: -1,
          draggedIndex: -1,
          draggedStyle: null
        });
      },

      // Update dragged position & placeholder index, invalidate drag if moved
      onWindowMove: function (event) {
        this.copyTouchKeys(event);

        if (
          this.downPos && (
            Math.abs(event.clientX - this.downPos.clientX) >= CONSTANTS.HOLD_THRESHOLD ||
            Math.abs(event.clientY - this.downPos.clientY) >= CONSTANTS.HOLD_THRESHOLD
          )
        ) {
          this.moved = true;
        }

        if (this.isDragging()) {
          this.preventNativeScrolling(event);

          var draggedStyle = extend({}, this.state.draggedStyle, {
            top: (!this.props.lock || this.props.lock === 'horizontal') ?
              event.clientY - this.mouseDownOffset.clientY : this.state.draggedStyle.top,
            left: (!this.props.lock || this.props.lock === 'vertical') ?
              event.clientX - this.mouseDownOffset.clientX : this.state.draggedStyle.left
          });

          var children = ReactDOM.findDOMNode(this).childNodes;
          var collisionIndex = this.findCollisionIndex(children, event);

          if (
            collisionIndex !== this.state.placedIndex &&
            collisionIndex <= this.props.children.length &&
            collisionIndex >= 0
          ) {
            this.setState({
              placedIndex: collisionIndex
            });
          }

          this.setState({
            draggedStyle: draggedStyle
          });

          this.mouseOffset = {
            clientX: event.clientX,
            clientY: event.clientY
          };
        }
      },

      // Add listeners
      componentWillMount: function () {
        window.addEventListener('mouseup', this.onWindowUp);
        window.addEventListener('touchend', this.onWindowUp);
        window.addEventListener('mousemove', this.onWindowMove);
        window.addEventListener('touchmove', this.onWindowMove);
        window.addEventListener('contextmenu', this.preventDefaultIfDragging);
      },

      // Remove listeners
      componentWillUnmount: function () {
        clearTimeout(this.holdTimeout);
        clearInterval(this.scrollInterval);

        window.removeEventListener('mouseup', this.onWindowUp);
        window.removeEventListener('touchend', this.onWindowUp);
        window.removeEventListener('mousemove', this.onWindowMove);
        window.removeEventListener('touchmove', this.onWindowMove);
        window.removeEventListener('contextmenu', this.preventDefaultIfDragging);
      },

      storeRootNode: function (element) {
        this.rootNode = element;

        if (typeof this.props.ref === 'function') {
          this.props.ref(element);
        }
      },

      render: function () {
        var self = this;

        var children = this.props.children && this.props.children.map(function (child, index) {
          var isDragged = index === self.state.draggedIndex;

          var draggedStyle = isDragged ? extend({}, child.props.style, self.state.draggedStyle) : child.props.style;
          var draggedClass = [
            child.props.className || '',
            (isDragged ? self.props.draggedClassName : '') || ''
          ].join(' ');

          return React.cloneElement(
            child,
            {
              style: draggedStyle,
              className: draggedClass,
              onMouseDown: self.onItemDown.bind(self, child.props.onMouseDown, index),
              onTouchStart: self.onItemDown.bind(self, child.props.onTouchStart, index),
              'data-dragged': isDragged ? true : null
            }
          );
        }.bind(this));

        var draggedElement = this.props.children && this.props.children[this.state.draggedIndex];
        var placeholderElement = this.props.placeholder || draggedElement;

        if (this.state.placedIndex >= 0 && placeholderElement) {
          var placeholder = React.cloneElement(
            placeholderElement,
            {
              key: 'react-reorder-placeholder',
              className: [placeholderElement.props.className || '', self.props.placeholderClassName || ''].join(' '),
              'data-placeholder': true
            }
          );
          children.splice(this.state.placedIndex, 0, placeholder);
        }

        return React.createElement(
          self.props.component || 'div',
          {
            className: this.props.className,
            id: this.props.id,
            style: this.props.style,
            onClick: this.props.onClick,
            ref: this.storeRootNode,
            onMouseDown: this.onListDown.bind(this, this.props.onMouseDown),
            onTouchStart: this.onListDown.bind(this, this.props.onTouchStart),
            onMouseMove: this.onListMove.bind(this, this.props.onMouseMove),
            onTouchMove: this.onListMove.bind(this, this.props.onTouchMove),
            onMouseUp: this.onListUp.bind(this, this.props.onMouseUp),
            onTouchEnd: this.onListUp.bind(this, this.props.onTouchEnd)
          },
          children
        );
      }

    });

  }

  // Export for commonjs / browserify
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    var React = require('react');
    var ReactDOM = require('react-dom');
    module.exports = withReorderMethods(getReorderComponent(React, ReactDOM));
  // Export for amd / require
  } else if (typeof define === 'function' && define.amd) { // eslint-disable-line no-undef
    define(['react', 'react-dom'], function (ReactAMD, ReactDOMAMD) { // eslint-disable-line no-undef
      return withReorderMethods(getReorderComponent(ReactAMD, ReactDOMAMD));
    });
  // Export globally
  } else {
    var root;

    if (typeof window !== 'undefined') {
      root = window;
    } else if (typeof global !== 'undefined') {
      root = global;
    } else if (typeof self !== 'undefined') {
      root = self;
    } else {
      root = this;
    }

    root.Reorder = withReorderMethods(getReorderComponent(root.React, root.ReactDOM));
  }

})();
