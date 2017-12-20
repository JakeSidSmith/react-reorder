'use strict';

(function () {

  var CONSTANTS = {
    HOLD_THRESHOLD: 8,
    SCROLL_INTERVAL: 1000 / 60,
    SCROLL_AREA_MAX: 50,
    SCROLL_SPEED: 20
  };

  var downPos = null;
  var mouseOffset = null;
  var mouseDown = null;

  function createOffsetStyles (event, props) {
    var top = (!props.lock || props.lock === 'horizontal') ? mouseOffset.clientY - mouseDown.clientY : 0;
    var left = (!props.lock || props.lock === 'vertical') ? mouseOffset.clientX - mouseDown.clientX : 0;

    return 'translate(' + left + 'px,' + top + 'px)';
  }

  function getScrollOffsetX (rect, node) {
    var positionInScrollArea;
    var scrollLeft = node.scrollLeft;
    var scrollWidth = node.scrollWidth;

    var scrollAreaX = Math.min(rect.width / 3, CONSTANTS.SCROLL_AREA_MAX);

    if (scrollLeft > 0 && mouseOffset.clientX <= rect.left + scrollAreaX) {
      positionInScrollArea = Math.min(Math.abs(rect.left + scrollAreaX - mouseOffset.clientX), scrollAreaX);
      return -positionInScrollArea / scrollAreaX * CONSTANTS.SCROLL_SPEED;
    }

    if (scrollLeft < scrollWidth - rect.width && mouseOffset.clientX >= rect.right - scrollAreaX) {
      positionInScrollArea = Math.min(Math.abs(rect.right - scrollAreaX - mouseOffset.clientX), scrollAreaX);
      return positionInScrollArea / scrollAreaX * CONSTANTS.SCROLL_SPEED;
    }

    return 0;
  }

  function getScrollOffsetY (rect, node) {
    var positionInScrollArea;
    var scrollTop = node.scrollTop;
    var scrollHeight = node.scrollHeight;

    var scrollAreaY = Math.min(rect.height / 3, CONSTANTS.SCROLL_AREA_MAX);

    if (scrollTop > 0 && mouseOffset.clientY <= rect.top + scrollAreaY) {
      positionInScrollArea = Math.min(Math.abs(rect.top + scrollAreaY - mouseOffset.clientY), scrollAreaY);
      return -positionInScrollArea / scrollAreaY * CONSTANTS.SCROLL_SPEED;
    }

    if (scrollTop < scrollHeight - rect.height && mouseOffset.clientY >= rect.bottom - scrollAreaY) {
      positionInScrollArea = Math.min(Math.abs(rect.bottom - scrollAreaY - mouseOffset.clientY), scrollAreaY);
      return positionInScrollArea / scrollAreaY * CONSTANTS.SCROLL_SPEED;
    }

    return 0;
  }

  function scrollParentsX (node) {
    var parent = node.parentNode;

    while (parent && parent !== document) {
      var rect = parent.getBoundingClientRect();

      var scrollOffsetX = getScrollOffsetX(rect, parent);

      if (!scrollOffsetX) {
        scrollParentsX(parent);
      } else if (scrollOffsetX) {
        parent.scrollLeft = parent.scrollLeft + scrollOffsetX;
        return;
      }

      parent = parent.parentNode;
    }
  }

  function scrollParentsY (node) {
    var parent = node.parentNode;

    while (parent && parent !== document) {
      var rect = parent.getBoundingClientRect();

      var scrollOffsetY = getScrollOffsetY(rect, parent);

      if (!scrollOffsetY) {
        scrollParentsX(parent);
      } else if (scrollOffsetY) {
        parent.scrollTop = parent.scrollTop + scrollOffsetY;
        return;
      }

      parent = parent.parentNode;
    }
  }

  function Store () {
    var activeGroup = null;
    var draggedId = null;
    var placedId = null;
    var draggedElement = null;
    var scrollInterval = null;
    var target = null;

    var draggedStyle = null;
    var draggedIndex = -1;
    var placedIndex = -1;

    var reorderComponents = {};
    var reorderGroups = {};

    function autoScroll () {
      if (target && target.props.autoScroll && target.rootNode) {
        var rect = target.rootNode.getBoundingClientRect();

        if (target.props.lock !== 'horizontal') {
          var scrollOffsetX = getScrollOffsetX(rect, target.rootNode);

          if (target.props.autoScrollParents && !scrollOffsetX) {
            scrollParentsX(target.rootNode);
          } else if (scrollOffsetX) {
            target.rootNode.scrollLeft = target.rootNode.scrollLeft + scrollOffsetX;
          }
        }

        if (target.props.lock !== 'vertical') {
          var scrollOffsetY = getScrollOffsetY(rect, target.rootNode);

          if (target.props.autoScrollParents && !scrollOffsetY) {
            scrollParentsY(target.rootNode);
          } else if (scrollOffsetY) {
            target.rootNode.scrollTop = target.rootNode.scrollTop + scrollOffsetY;
          }
        }
      }
    }

    function getState () {
      return {
        draggedId: draggedId,
        placedId: placedId,
        activeGroup: activeGroup,
        draggedStyle: draggedStyle,
        draggedIndex: draggedIndex,
        placedIndex: placedIndex,
        draggedElement: draggedElement
      };
    }

    function trigger (clear) {
      var state = getState();

      if (clear) {
        for (var i = 0; i < clear.length; i += 1) {
          state[clear[i]] = null;
        }
      }

      reorderComponents[draggedId].setDragState(state);
    }

    function triggerGroup (clear) {
      var state = getState();

      if (clear) {
        for (var i = 0; i < clear.length; i += 1) {
          state[clear[i]] = null;
        }
      }

      for (var reorderId in reorderGroups[activeGroup]) {
        reorderGroups[activeGroup][reorderId].setDragState(state);
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

    function registerReorderComponent (component) {
      var reorderId = component.props.reorderId;
      var reorderGroup = component.props.reorderGroup;

      validateComponentIdAndGroup(reorderId, reorderGroup);

      if (typeof reorderGroup !== 'undefined') {
        if ((reorderGroup in reorderGroups) && (reorderId in reorderGroups[reorderGroup])) {
          throw new Error('Duplicate reorderId: ' + reorderId + ' in reorderGroup: ' + reorderGroup);
        }

        reorderGroups[reorderGroup] = reorderGroups[reorderGroup] || {};
        reorderGroups[reorderGroup][reorderId] = component;
      } else {
        if (reorderId in reorderComponents) {
          throw new Error('Duplicate reorderId: ' + reorderId);
        }

        reorderComponents[reorderId] = component;
      }
    }

    function unregisterReorderComponent (component) {
      var reorderId = component.props.reorderId;
      var reorderGroup = component.props.reorderGroup;

      validateComponentIdAndGroup(reorderId, reorderGroup);

      if (typeof reorderGroup !== 'undefined') {
        if (!(reorderGroup in reorderGroups)) {
          throw new Error('Unknown reorderGroup: ' + reorderGroup);
        }

        if ((reorderGroup in reorderGroups) && !(reorderId in reorderGroups[reorderGroup])) {
          throw new Error('Unknown reorderId: ' + reorderId + ' in reorderGroup: ' + reorderGroup);
        }

        delete reorderGroups[reorderGroup][reorderId];
      } else {
        if (!(reorderId in reorderComponents)) {
          throw new Error('Unknown reorderId: ' + reorderId);
        }

        delete reorderComponents[reorderId];
      }
    }

    function startDrag (reorderId, reorderGroup, index, element, component) {
      target = component;

      clearInterval(scrollInterval);
      scrollInterval = setInterval(autoScroll, CONSTANTS.SCROLL_INTERVAL);

      validateComponentIdAndGroup(reorderId, reorderGroup);

      draggedIndex = index;
      placedIndex = index;
      draggedStyle = null;
      draggedElement = element;

      draggedId = reorderId;
      placedId = reorderId;
      activeGroup = null;

      if (typeof reorderGroup !== 'undefined') {
        activeGroup = reorderGroup;

        triggerGroup();
      } else if (draggedId !== null && reorderId === draggedId) {
        trigger();
      }
    }

    function stopDrag (reorderId, reorderGroup) {
      target = null;

      clearInterval(scrollInterval);

      validateComponentIdAndGroup(reorderId, reorderGroup);

      if (activeGroup !== null) {
        if (reorderGroup === activeGroup) {
          draggedIndex = -1;
          placedIndex = -1;
          draggedStyle = null;
          draggedElement = null;

          // These need to be cleared after trigger to allow state updates to these components
          triggerGroup(['activeGroup']);

          draggedId = null;
          placedId = null;
          activeGroup = null;
        }
      } else if (draggedId !== null && reorderId === draggedId) {
        draggedIndex = -1;
        placedIndex = -1;
        draggedStyle = null;
        draggedElement = null;

        // These need to be cleared after trigger to allow state updates to these components
        trigger(['activeGroup']);

        draggedId = null;
        placedId = null;
        activeGroup = null;
      }
    }

    function setPlacedIndex (reorderId, reorderGroup, index, component) {
      target = component;

      validateComponentIdAndGroup(reorderId, reorderGroup);

      if (typeof reorderGroup !== 'undefined') {
        if (reorderGroup === activeGroup) {
          placedId = reorderId;
          placedIndex = index;

          triggerGroup();
        }
      } else if (draggedId !== null && reorderId === draggedId) {
        placedIndex = index;

        trigger();
      }
    }

    function setDraggedStyle (reorderId, reorderGroup, style) {
      validateComponentIdAndGroup(reorderId, reorderGroup);

      if (typeof reorderGroup !== 'undefined') {
        if (reorderGroup === activeGroup) {
          draggedStyle = style;

          triggerGroup();
        }
      } else if (draggedId !== null && reorderId === draggedId) {
        draggedStyle = style;

        trigger();
      }
    }

    this.getState = getState;
    this.registerReorderComponent = registerReorderComponent;
    this.unregisterReorderComponent = unregisterReorderComponent;
    this.startDrag = startDrag;
    this.stopDrag = stopDrag;
    this.setPlacedIndex = setPlacedIndex;
    this.setDraggedStyle = setDraggedStyle;
  }

  var store = new Store();

  function reorder (list, previousIndex, nextIndex) {
    var copy = [].concat(list);
    var item = copy.splice(previousIndex, 1)[0];

    copy.splice(nextIndex, 0, item);

    return copy;
  }

  function reorderImmutable (list, previousIndex, nextIndex) {
    var item = list.get(previousIndex);
    return list.delete(previousIndex).splice(nextIndex, 0, item);
  }

  function reorderFromTo (lists, previousIndex, nextIndex) {
    var previousList = [].concat(lists.from);
    var nextList = [].concat(lists.to);

    var item = previousList.splice(previousIndex, 1)[0];
    nextList.splice(nextIndex, 0, item);

    return {
      from: previousList,
      to: nextList
    };
  }

  function reorderFromToImmutable (lists, previousIndex, nextIndex) {
    var item = lists.from.get(previousIndex);

    return {
      from: lists.from.delete(previousIndex),
      to: lists.to.splice(nextIndex, 0, item)
    };
  }

  function withReorderMethods (Reorder) {
    Reorder.reorder = reorder;
    Reorder.reorderImmutable = reorderImmutable;
    Reorder.reorderFromTo = reorderFromTo;
    Reorder.reorderFromToImmutable = reorderFromToImmutable;
    return Reorder;
  }

  function assign () {
    var args = Array.prototype.slice.call(arguments);

    if (!args.length) {
      return undefined;
    }

    if (args.length === 1) {
      return args[0];
    }

    var obj = args.shift();

    while (args.length) {
      var arg = args.shift();

      for (var key in arg) {
        obj[key] = arg[key];
      }
    }

    return obj;
  }

  function getReorderComponent (React, ReactDOM, createReactClass, PropTypes) {

    var Reorder = createReactClass({
      displayName: 'Reorder',

      getInitialState: function () {
        return store.getState();
      },

      isDragging: function () {
        return this.state.draggedIndex >= 0;
      },

      isPlacing: function () {
        return this.state.placedIndex >= 0;
      },

      isDraggingFrom: function () {
        return this.props.reorderId === this.state.draggedId;
      },

      isPlacingTo: function () {
        return this.props.reorderId === this.state.placedId;
      },

      isInvolvedInDragging: function () {
        return this.props.reorderId === this.state.draggedId || this.props.reorderGroup === this.state.activeGroup;
      },

      preventContextMenu: function (event) {
        if (downPos && this.props.disableContextMenus) {
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

      xCollision: function (event, rect) {
        return event.clientX >= rect.left && event.clientX <= rect.right;
      },

      yCollision: function (event, rect) {
        return event.clientY >= rect.top && event.clientY <= rect.bottom;
      },

      findCollisionIndex: function (event, listElements) {
        for (var i = 0; i < listElements.length; i += 1) {
          if (!listElements[i].getAttribute('data-placeholder') && !listElements[i].getAttribute('data-dragged')) {

            var rect = listElements[i].getBoundingClientRect();

            switch (this.props.lock) {
              case 'horizontal':
                if (this.yCollision(event, rect)) {
                  return i;
                }
                break;
              case 'vertical':
                if (this.xCollision(event, rect)) {
                  return i;
                }
                break;
              default:
                if (this.yCollision(event, rect) && this.xCollision(event, rect)) {
                  return i;
                }
                break;
            }

          }

        }

        return -1;
      },

      collidesWithElement: function (event, element) {
        var rect = element.getBoundingClientRect();
        return this.yCollision(event, rect) && this.xCollision(event, rect);
      },

      getHoldTime: function (event) {
        if (event.touches && typeof this.props.touchHoldTime !== 'undefined') {
          return parseInt(this.props.touchHoldTime, 10) || 0;
        } else if (typeof this.props.mouseHoldTime !== 'undefined') {
          return parseInt(this.props.mouseHoldTime, 10) || 0;
        }

        return parseInt(this.props.holdTime, 10) || 0;
      },

      startDrag: function (event, target, index) {
        if (!this.moved) {
          var rect = target.getBoundingClientRect();

          var draggedStyle = {
            position: 'fixed',
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          };

          store.startDrag(this.props.reorderId, this.props.reorderGroup, index, this.props.children[index], this);
          store.setDraggedStyle(this.props.reorderId, this.props.reorderGroup, draggedStyle);

          mouseOffset = {
            clientX: event.clientX,
            clientY: event.clientY
          };

          mouseDown = {
            clientX: event.clientX,
            clientY: event.clientY
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
        downPos = {
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

        if (this.isDragging() && this.isDraggingFrom()) {
          var fromIndex = this.state.draggedIndex;
          var toIndex = this.state.placedIndex;

          store.stopDrag(this.props.reorderId, this.props.reorderGroup);

          if (
            fromIndex >= 0 &&
            (fromIndex !== toIndex || this.state.draggedId !== this.state.placedId) &&
            typeof this.props.onReorder === 'function'
          ) {
            this.props.onReorder(
              event,
              fromIndex,
              toIndex - (this.state.draggedId === this.state.placedId && fromIndex < toIndex ? 1 : 0),
              this.state.draggedId,
              this.state.placedId
            );
          }
        }

        downPos = null;
        mouseOffset = null;
        mouseDown = null;
      },

      // Update dragged position & placeholder index, invalidate drag if moved
      onWindowMove: function (event) {
        this.copyTouchKeys(event);

        if (
          downPos && (
            Math.abs(event.clientX - downPos.clientX) >= CONSTANTS.HOLD_THRESHOLD ||
            Math.abs(event.clientY - downPos.clientY) >= CONSTANTS.HOLD_THRESHOLD
          )
        ) {
          this.moved = true;
        }

        if (this.isDragging() && this.isInvolvedInDragging()) {
          this.preventNativeScrolling(event);

          var element = this.rootNode;

          if (this.collidesWithElement(event, element)) {

            var children = element.childNodes;
            var collisionIndex = this.findCollisionIndex(event, children);

            if (
              collisionIndex <= this.props.children.length &&
              collisionIndex >= 0
            ) {
              store.setPlacedIndex(this.props.reorderId, this.props.reorderGroup, collisionIndex, this);
            } else if (
              typeof this.props.reorderGroup !== 'undefined' && // Is part of a group
              (
                (!this.props.children || !this.props.children.length) || // If all items removed
                (this.isDraggingFrom() && this.props.children.length === 1) // If dragging back to a now empty list
              )
            ) {
              store.setPlacedIndex(this.props.reorderId, this.props.reorderGroup, 0, this);
            }

          }

          this.state.draggedStyle.transform = createOffsetStyles(event, this.props);
          store.setDraggedStyle(this.props.reorderId, this.props.reorderGroup, this.state.draggedStyle);

          mouseOffset = {
            clientX: event.clientX,
            clientY: event.clientY
          };
        }
      },

      setDragState: function (state) {
        var isPartOfGroup = this.props.reorderGroup;
        var isGroupDragged = state.activeGroup;
        var storedActiveGroup = this.state.activeGroup;

        var wasGroupDragged = !isGroupDragged && storedActiveGroup;

        var isActiveGroup = isPartOfGroup && isGroupDragged &&
          state.activeGroup === this.props.reorderGroup;

        var isDragged = this.props.reorderId === state.draggedId;
        var isPlaced = this.props.reorderId === state.placedId;
        var wasPlaced = this.props.reorderId === this.state.placedId;

        // This check is like a shouldComponentUpdate but specific to our store state
        // Allowing prop changes to update the component
        if (
          (!isGroupDragged && !isPartOfGroup && (isDragged || isPlaced)) ||
          (isPartOfGroup && (!storedActiveGroup || wasGroupDragged)) ||
          wasGroupDragged ||
          (isActiveGroup && (isDragged || isPlaced || wasPlaced))
        ) {
          this.setState(state);
        }
      },

      // Add listeners
      componentWillMount: function () {
        store.registerReorderComponent(this);
        window.addEventListener('mouseup', this.onWindowUp, {passive: false});
        window.addEventListener('touchend', this.onWindowUp, {passive: false});
        window.addEventListener('mousemove', this.onWindowMove, {passive: false});
        window.addEventListener('touchmove', this.onWindowMove, {passive: false});
        window.addEventListener('contextmenu', this.preventContextMenu, {passive: false});
      },

      // Store root node
      componentDidMount: function () {
        this.storeRootNode();
      },

      // Remove listeners
      componentWillUnmount: function () {
        store.unregisterReorderComponent(this);
        clearTimeout(this.holdTimeout);

        window.removeEventListener('mouseup', this.onWindowUp);
        window.removeEventListener('touchend', this.onWindowUp);
        window.removeEventListener('mousemove', this.onWindowMove);
        window.removeEventListener('touchmove', this.onWindowMove);
        window.removeEventListener('contextmenu', this.preventContextMenu);
      },

      storeRootNode: function () {
        var element = ReactDOM.findDOMNode(this);
        this.rootNode = element;

        if (typeof this.props.getRef === 'function') {
          this.props.getRef(element);
        }
      },

      render: function () {
        var children = this.props.children && this.props.children.map(function (child, index) {
          var isDragged = this.isDragging() && this.isDraggingFrom() && index === this.state.draggedIndex;

          var draggedStyle = isDragged ? assign({}, child.props.style, this.state.draggedStyle) : child.props.style;

          var draggedClass = [
            child.props.className || '',
            (isDragged ? this.props.draggedClassName : '')
          ].join(' ');

          return React.cloneElement(
            isDragged ? this.state.draggedElement : child,
            {
              style: draggedStyle,
              className: draggedClass,
              onMouseDown: this.onItemDown.bind(this, child.props.onMouseDown, index),
              onTouchStart: this.onItemDown.bind(this, child.props.onTouchStart, index),
              'data-dragged': isDragged ? true : null
            }
          );
        }.bind(this));

        var placeholderElement = this.props.placeholder || this.state.draggedElement;

        if (this.isPlacing() && this.isPlacingTo() && placeholderElement) {
          var placeholder = React.cloneElement(
            placeholderElement,
            {
              key: 'react-reorder-placeholder',
              className: [placeholderElement.props.className || '', this.props.placeholderClassName].join(' '),
              'data-placeholder': true
            }
          );

          children.splice(this.state.placedIndex, 0, placeholder);
        }

        return React.createElement(
          this.props.component,
          {
            className: this.props.className,
            id: this.props.id,
            style: this.props.style,
            onClick: this.props.onClick
          },
          children
        );
      }

    });

    Reorder.propTypes = {
      component: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
      getRef: PropTypes.func,
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
      autoScrollParents: PropTypes.bool,
      disabled: PropTypes.bool,
      disableContextMenus: PropTypes.bool
    };

    Reorder.defaultProps = {
      component: 'div',
      // getRef: function,
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
      autoScrollParents: true,
      disabled: false,
      disableContextMenus: true
    };

    return Reorder;

  }

  /* istanbul ignore next */

  // Export for commonjs / browserify
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    var React = require('react'); // eslint-disable-line no-undef
    var ReactDOM = require('react-dom'); // eslint-disable-line no-undef
    var createReactClass = require('create-react-class'); // eslint-disable-line no-undef
    var PropTypes = require('prop-types'); // eslint-disable-line no-undef
    module.exports = withReorderMethods( // eslint-disable-line no-undef
      getReorderComponent(React, ReactDOM, createReactClass, PropTypes)
    );
  // Export for amd / require
  } else if (typeof define === 'function' && define.amd) { // eslint-disable-line no-undef
    define( // eslint-disable-line no-undef
      ['react', 'react-dom', 'create-react-class', 'prop-types'],
      function (ReactAMD, ReactDOMAMD, createReactClassAMD, PropTypesAMD) {
        return withReorderMethods(
          getReorderComponent(ReactAMD, ReactDOMAMD, createReactClassAMD, PropTypesAMD)
        );
      }
    );
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

    root.Reorder = withReorderMethods(
      getReorderComponent(root.React, root.ReactDOM, root.createReactClass, root.PropTypes)
    );
  }

})();
