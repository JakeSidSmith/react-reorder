'use strict';

(function () {

  var CONSTANTS = {
    HOLD_THRESHOLD: 8,
    SCROLL_INTERVAL: 1000 / 60,
    SCROLL_AREA_MAX: 50,
    SCROLL_SPEED: 20
  };

  function Store () {
    var activeGroup, draggedId, placedId;

    var draggedIndex = -1;
    var placedIndex = -1;

    var reorderComponents = {};
    var reorderGroups = {};

    function trigger () {
      reorderComponents[draggedId](draggedIndex, placedIndex);
    }

    function triggerGroup () {
      for (var reorderId in reorderGroups[activeGroup]) {
        reorderGroups[activeGroup][reorderId](
          reorderId === draggedId ? draggedIndex : -1,
          reorderId === placedId ? placedIndex : -1,
          activeGroup
        );
      }
    }

    function validateComponentIdAndGroup (reorderId, reorderGroup) {
      if (typeof reorderId !== 'string') {
        throw new Error('Expected reorderId to be a string. Instead got ' + (typeof reorderId));
      }

      if (typeof reorderGroup !== 'undefined' && typeof reorderGroup !== 'string') {
        throw new Error('Expected reorderGroup to be a string. Instead got ' + (typeof reorderGroup));
      }
    }

    this.registerReorderComponent = function registerReorderComponent (reorderId, reorderGroup, callback) {
      validateComponentIdAndGroup(reorderId, reorderGroup);

      if (reorderId in reorderComponents) {
        throw new Error('Duplicate reorderId: ' + reorderId);
      }

      if (typeof reorderGroup !== 'undefined') {
        if ((reorderGroup in reorderGroups) && (reorderId in reorderGroups[reorderGroup])) {
          throw new Error('Duplicate reorderId: ' + reorderId + ' in reorderGroup: ' + reorderGroup);
        }

        reorderGroups[reorderGroup] = reorderGroups[reorderGroup] || {};
        reorderGroups[reorderGroup][reorderId] = callback;
      } else {
        reorderComponents[reorderId] = callback;
      }
    };

    this.unregisterReorderComponent = function unregisterReorderComponent (reorderId, reorderGroup) {
      validateComponentIdAndGroup(reorderId, reorderGroup);

      if (!(reorderId in reorderComponents)) {
        throw new Error('Unknown reorderId: ' + reorderId);
      }

      if (typeof reorderGroup !== 'undefined') {
        if (!(reorderGroup in reorderGroups)) {
          throw new Error('Unknown reorderGroup: ' + reorderGroup);
        }

        if ((reorderGroup in reorderGroups) && !(reorderId in reorderGroups[reorderGroup])) {
          throw new Error('Unknown reorderId: ' + reorderId + ' in reorderGroup: ' + reorderGroup);
        }

        delete reorderGroups[reorderGroup][reorderId];
      } else {
        delete reorderComponents[reorderId];
      }
    };

    this.startDrag = function startDrag (reorderId, reorderGroup, index) {
      validateComponentIdAndGroup(reorderId, reorderGroup);

      draggedId = reorderId;
      placedId = reorderId;
      draggedIndex = index;
      placedIndex = index;

      if (typeof reorderGroup !== 'undefined') {
        activeGroup = reorderGroup;

        triggerGroup();
      } else {
        trigger();
      }
    };

    this.stopDrag = function stopDrag (reorderId, reorderGroup) {
      validateComponentIdAndGroup(reorderId, reorderGroup);

      if (typeof activeGroup !== 'undefined') {
        if (reorderGroup === activeGroup) {
          draggedIndex = -1;
          placedIndex = -1;

          triggerGroup();

          draggedId = undefined;
          placedId = undefined;
          activeGroup = undefined;
        }
      } else if (reorderId === draggedId) {
        draggedIndex = -1;
        placedIndex = -1;

        trigger();

        draggedId = undefined;
        placedId = undefined;
        activeGroup = undefined;
      }
    };

    this.setPlacedIndex = function setPlacedIndex (reorderId, reorderGroup, index) {
      validateComponentIdAndGroup(reorderId, reorderGroup);

      if (typeof reorderGroup !== 'undefined') {
        if (reorderGroup === activeGroup) {
          placedId = reorderId;
          placedIndex = index;

          triggerGroup();
        }
      } else if (reorderId === draggedId) {
        placedIndex = index;

        trigger();
      }
    };
  }

  var store = new Store();

  function reorder (list, previousIndex, nextIndex) {
    var copy = [].concat(list);
    var removed = copy.splice(previousIndex, 1)[0];

    copy.splice(nextIndex, 0, removed);

    return copy;
  }

  function reorderImmutable (list, previousIndex, nextIndex) {
    var removed = list.get(previousIndex);
    return list.delete(previousIndex).splice(nextIndex, 0, removed);
  }

  function withReorderMethods (Reorder) {
    Reorder.reorder = reorder;
    Reorder.reorderImmutable = reorderImmutable;
    return Reorder;
  }

  function getReorderComponent (React, ReactDOM, assign) {

    var Reorder = React.createClass({
      displayName: 'Reorder',

      getInitialState: function () {
        return {
          placedIndex: -1,
          draggedIndex: -1,
          draggedStyle: null
        };
      },

      isDragging: function () {
        return this.state.draggedIndex >= 0;
      },

      preventContextMenu: function (event) {
        if (this.downPos && this.props.disableContentMenus) {
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

      getScrollOffsetX: function (rect, node, mouseOffset) {
        var scrollLeft = node.scrollLeft;
        var scrollWidth = node.scrollWidth;

        var scrollAreaX = Math.min(rect.width / 3, CONSTANTS.SCROLL_AREA_MAX);

        if (scrollLeft > 0 && mouseOffset.clientX <= rect.left + scrollAreaX) {
          return -Math.min(Math.abs(rect.left + scrollAreaX - mouseOffset.clientX), scrollAreaX) /
            scrollAreaX * CONSTANTS.SCROLL_SPEED;
        }

        if (scrollLeft < scrollWidth - rect.width && mouseOffset.clientX >= rect.right - scrollAreaX) {
          return Math.min(Math.abs(rect.right - scrollAreaX - mouseOffset.clientX), scrollAreaX) /
            scrollAreaX * CONSTANTS.SCROLL_SPEED;
        }

        return 0;
      },

      getScrollOffsetY: function (rect, node, mouseOffset) {
        var scrollTop = node.scrollTop;
        var scrollHeight = node.scrollHeight;

        var scrollAreaY = Math.min(rect.height / 3, CONSTANTS.SCROLL_AREA_MAX);

        if (scrollTop > 0 && mouseOffset.clientY <= rect.top + scrollAreaY) {
          return -Math.min(Math.abs(rect.top + scrollAreaY - mouseOffset.clientY), scrollAreaY) /
            scrollAreaY * CONSTANTS.SCROLL_SPEED;
        }

        if (scrollTop < scrollHeight - rect.height && mouseOffset.clientY >= rect.bottom - scrollAreaY) {
          return Math.min(Math.abs(rect.bottom - scrollAreaY - mouseOffset.clientY), scrollAreaY) /
            scrollAreaY * CONSTANTS.SCROLL_SPEED;
        }

        return 0;
      },

      autoScroll: function () {
        if (this.props.autoScroll) {
          var rect = this.rootNode.getBoundingClientRect();

          if (this.props.lock !== 'horizontal') {
            var scrollOffsetX = this.getScrollOffsetX(rect, this.rootNode, this.mouseOffset);

            if (scrollOffsetX) {
              this.rootNode.scrollLeft = this.rootNode.scrollLeft + scrollOffsetX;
            }
          }

          if (this.props.lock !== 'vertical') {
            var scrollOffsetY = this.getScrollOffsetY(rect, this.rootNode, this.mouseOffset);

            if (scrollOffsetY) {
              this.rootNode.scrollTop = this.rootNode.scrollTop + scrollOffsetY;
            }
          }
        }
      },

      startDrag: function (event, target, index) {
        if (!this.moved) {
          this.scrollInterval = setInterval(this.autoScroll, CONSTANTS.SCROLL_INTERVAL);
          var rect = target.getBoundingClientRect();

          store.startDrag(this.props.reorderId, this.props.reorderGroup, index);

          this.setState({
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

        store.stopDrag(this.props.reorderId, this.props.reorderGroup);

        this.setState({
          draggedStyle: null
        });

        this.downPos = null;
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

          var draggedStyle = assign({}, this.state.draggedStyle, {
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
            store.setPlacedIndex(this.props.reorderId, this.props.reorderGroup, collisionIndex);
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

      setDragState: function (draggedIndex, placedIndex, activeGroup) {
        this.setState({
          draggedIndex: draggedIndex,
          placedIndex: placedIndex,
          activeGroup: activeGroup
        });
      },

      // Add listeners
      componentWillMount: function () {
        store.registerReorderComponent(this.props.reorderId, this.props.reorderGroup, this.setDragState);
        window.addEventListener('mouseup', this.onWindowUp, {passive: false});
        window.addEventListener('touchend', this.onWindowUp, {passive: false});
        window.addEventListener('mousemove', this.onWindowMove, {passive: false});
        window.addEventListener('touchmove', this.onWindowMove, {passive: false});
        window.addEventListener('contextmenu', this.preventContextMenu, {passive: false});
      },

      // Remove listeners
      componentWillUnmount: function () {
        store.unregisterReorderComponent(this.props.reorderId, this.props.reorderGroup);
        clearTimeout(this.holdTimeout);
        clearInterval(this.scrollInterval);

        window.removeEventListener('mouseup', this.onWindowUp);
        window.removeEventListener('touchend', this.onWindowUp);
        window.removeEventListener('mousemove', this.onWindowMove);
        window.removeEventListener('touchmove', this.onWindowMove);
        window.removeEventListener('contextmenu', this.preventContextMenu);
      },

      storeRootNode: function (element) {
        this.rootNode = element;

        if (typeof this.props.getRef === 'function') {
          this.props.getRef(element);
        }
      },

      render: function () {
        var self = this;

        var children = this.props.children && this.props.children.map(function (child, index) {
          var isDragged = index === self.state.draggedIndex;

          var draggedStyle = isDragged ? assign({}, child.props.style, self.state.draggedStyle) : child.props.style;
          var draggedClass = [
            child.props.className || '',
            (isDragged ? self.props.draggedClassName : '')
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
              className: [placeholderElement.props.className || '', self.props.placeholderClassName].join(' '),
              'data-placeholder': true
            }
          );
          children.splice(this.state.placedIndex, 0, placeholder);
        }

        return React.createElement(
          self.props.component,
          {
            className: this.props.className,
            id: this.props.id,
            style: this.props.style,
            onClick: this.props.onClick,
            ref: this.storeRootNode
          },
          children
        );
      }

    });

    var PropTypes = React.PropTypes;

    Reorder.propTypes = {
      component: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
      reorderId: PropTypes.string,
      reorderGroup: PropTypes.string,
      placeholderClassName: PropTypes.string,
      draggedClassName: PropTypes.string,
      lock: PropTypes.string,
      holdTime: PropTypes.number,
      touchHoldTime: PropTypes.number,
      mouseHoldTime: PropTypes.number,
      onReorder: PropTypes.func,
      placeholder: PropTypes.element,
      autoScroll: PropTypes.bool,
      disabled: PropTypes.bool,
      disableContentMenus: PropTypes.bool
    };

    Reorder.defaultProps = {
      component: 'div',
      // reorderId: id,
      // reorderGroup: group,
      placeholderClassName: 'placeholder',
      draggedClassName: 'dragged',
      // lock: direction,
      holdTime: 0,
      // touchHoldTime: 0,
      // mouseHoldTime: 0,
      // onReorder: function,
      // placeholder: react element
      autoScroll: true,
      disabled: false,
      disableContentMenus: true
    };

    return Reorder;

  }

  /* istanbul ignore next */

  // Export for commonjs / browserify
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    var React = require('react'); // eslint-disable-line no-undef
    var ReactDOM = require('react-dom'); // eslint-disable-line no-undef
    var assign = require('lodash.assign'); // eslint-disable-line no-undef
    module.exports = withReorderMethods(getReorderComponent(React, ReactDOM, assign)); // eslint-disable-line no-undef
  // Export for amd / require
  } else if (typeof define === 'function' && define.amd) { // eslint-disable-line no-undef
    define(['react', 'react-dom', 'lodash.assign'], function (ReactAMD, ReactDOMAMD, assignAMD) { // eslint-disable-line no-undef
      return withReorderMethods(getReorderComponent(ReactAMD, ReactDOMAMD, assignAMD));
    });
  // Export globally
  } else {
    var root;

    if (typeof window !== 'undefined') {
      root = window;
    } else if (typeof global !== 'undefined') {
      root = global; // eslint-disable-line no-undef
    } else if (typeof self !== 'undefined') {
      root = self; // eslint-disable-line no-undef
    } else {
      root = this;
    }

    root.Reorder = withReorderMethods(getReorderComponent(root.React, root.ReactDOM, root.assign));
  }

})();
