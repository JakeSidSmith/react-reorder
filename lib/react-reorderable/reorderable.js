/** @jsx React.DOM */

'use strict';

(function () {

  var getReorderable = function (React) {

    return React.createClass({
      nonCollisionElement: new RegExp('(^|\\s)(placeholder|dragged)($|\\s)', ''),
      constants: {
        HOLD_THRESHOLD: 20,
        SCROLL_RATE: 1000 / 30,
        SCROLL_DISTANCE: 5,
        SCROLL_AREA: 50,
        SCROLL_MULTIPLIER: 5
      },
      handleTouchEvents: function (event) {
        if (event.touches && event.touches.length) {
          event.clientX = event.touches[0].clientX;
          event.clientY = event.touches[0].clientY;
        }
      },
      onMouseDown: function (item, index, event) {
        event.preventDefault();
        this.handleTouchEvents(event);
        var self = this;
        var target = event.currentTarget;
        var rect = target.getBoundingClientRect();

        var dragOffset = {
          top: event.clientY - rect.top,
          left: event.clientX - rect.left
        };

        var dragged = {
          target: target,
          item: item,
          index: index
        };

        var draggedStyle = {
          position: 'fixed',
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        };

        var downPos = {
          clientY: event.clientY,
          clientX: event.clientX,
          scrollTop: self.getDOMNode().scrollTop,
          scrollLeft: self.getDOMNode().scrollLeft
        };

        this.setState({downPos: downPos, pointer: {clientY: downPos.clientY, clientX: downPos.clientX}});

        // Timeout if holdTime is defined
        var holdTime = Math.abs(parseInt(this.props.holdTime));

        if (holdTime) {
          this.holdTimeout = setTimeout(function () {
            self.startDrag(dragged, dragOffset, draggedStyle, downPos);
          }, holdTime);
        } else {
          self.startDrag(dragged, dragOffset, draggedStyle, downPos);
        }

        // Mouse events
        window.addEventListener('mouseup', this.onMouseUp); // Mouse up
        window.addEventListener('mousemove', this.onMouseMove); // Mouse move

        // Touch events
        window.addEventListener('touchend', this.onMouseUp); // Touch up
        window.addEventListener('touchmove', this.onMouseMove); // Touch move
      },
      startDrag: function (dragged, dragOffset, draggedStyle) {
        this.setState({
          dragged: dragged,
          dragOffset: dragOffset,
          draggedStyle: draggedStyle,
          originalPosition: draggedStyle
        });
      },
      onMouseUp: function () {
        this.setState({
          dragged: undefined,
          draggedStyle: undefined,
          dragOffset: undefined,
          originalPosition: undefined,
          downPos: undefined
        });

        clearTimeout(this.holdTimeout);
        clearInterval(this.scrollInterval);
        this.scrollInterval = undefined;

        // Mouse events
        window.removeEventListener('mouseup', this.onMouseUp); // Mouse up
        window.removeEventListener('mousemove', this.onMouseMove); // Mouse move
        // Touch events
        window.removeEventListener('touchend', this.onMouseUp); // Touch up
        window.removeEventListener('touchmove', this.onMouseMove); // Touch move

        if (this.props.callback) {
          this.props.callback(this.state.list);
        }
      },
      dragScroll: function () {
        var element = this.getDOMNode();
        var rect = element.getBoundingClientRect();

        var distanceInArea;
        if (this.state.pointer.clientY < rect.top + this.constants.SCROLL_AREA) {
          distanceInArea = Math.min((rect.top + this.constants.SCROLL_AREA) - this.state.pointer.clientY, this.constants.SCROLL_AREA * 2);
          element.scrollTop -= distanceInArea / this.constants.SCROLL_MULTIPLIER;
        } else if (this.state.pointer.clientY > rect.bottom - this.constants.SCROLL_AREA) {
          distanceInArea = Math.min(this.state.pointer.clientY - (rect.bottom - this.constants.SCROLL_AREA), this.constants.SCROLL_AREA * 2);
          element.scrollTop += distanceInArea / this.constants.SCROLL_MULTIPLIER;
        }
      },
      onMouseMove: function (event) {
        this.handleTouchEvents(event);
        var pointer = {
          clientY: event.clientY,
          clientX: event.clientX
        };

        this.setState({pointer: pointer});

        if (this.state.dragged) {
          this.setDraggedPosition(event);

          var listElements = this.nodesToArray(this.getDOMNode().childNodes);
          var collision = this.findCollision(listElements, event);

          if (collision) {
            var previousIndex = listElements.indexOf(this.state.dragged.target);
            var newIndex = listElements.indexOf(collision);

            this.state.list.splice(newIndex, 0, this.state.list.splice(previousIndex, 1)[0]);
            this.setState({list: this.state.list});
          }

          var rect = this.getDOMNode().getBoundingClientRect();
          if (!this.scrollInterval) {
            if (event.clientY < rect.top + this.constants.SCROLL_AREA) {
              this.scrollInterval = setInterval(this.dragScroll, this.constants.SCROLL_RATE);
            } else if (event.clientY > rect.bottom - this.constants.SCROLL_AREA) {
              this.scrollInterval = setInterval(this.dragScroll, this.constants.SCROLL_RATE);
            }
          } else {
            if (event.clientY <= rect.bottom - this.constants.SCROLL_AREA && event.clientY >= rect.top + this.constants.SCROLL_AREA) {
              clearInterval(this.scrollInterval);
              this.scrollInterval = undefined;
            }
          }
        } else {
          if (this.state.downPos) {
            // Cancel hold if mouse has moved
            if (this.xHasMoved(event) || this.yHasMoved(event)) {
              clearTimeout(this.holdTimeout);
            }

            // Implement touch scrolling since we event.preventDefault
            if (event.touches) {
              this.handleTouchScrolling(event);
            }
          }
        }
      },
      xHasMoved: function (event) {
        return Math.abs(this.state.downPos.clientX - event.clientX) > this.constants.HOLD_THRESHOLD;
      },
      yHasMoved: function (event) {
        return Math.abs(this.state.downPos.clientY - event.clientY) > this.constants.HOLD_THRESHOLD;
      },
      handleTouchScrolling: function (event) {
        var element = this.getDOMNode();
        // If scrollable vertically
        if (element.scrollHeight > element.getBoundingClientRect().height) {
          // Handle scrolling
          element.scrollTop = this.state.downPos.scrollTop + this.state.downPos.clientY - event.clientY;
        }

        // If scrollable horizontally
        if (element.scrollWidth > element.getBoundingClientRect().width) {
          // Handle scrolling
          element.scrollLeft = this.state.downPos.scrollLeft + this.state.downPos.clientX - event.clientX;
        }
      },
      setDraggedPosition: function (event) {
        var draggedStyle = this.state.draggedStyle;

        if (this.props.lock === 'horizontal') {
          draggedStyle.top = event.clientY - this.state.dragOffset.top;
          draggedStyle.left = this.state.originalPosition.left;
        } else if (this.props.lock === 'vertical') {
          draggedStyle.top = this.state.originalPosition.top;
          draggedStyle.left = event.clientX - this.state.dragOffset.left;
        } else {
          draggedStyle.top = event.clientY - this.state.dragOffset.top;
          draggedStyle.left = event.clientX - this.state.dragOffset.left;
        }

        this.setState({draggedStyle: draggedStyle});
      },

      // Collision methods

      nodesToArray: function (nodes) {
        return Array.prototype.slice.call(nodes, 0);
      },
      xCollision: function (rect, event) {
        return event.clientX >= rect.left && event.clientX <= rect.right;
      },
      yCollision: function (rect, event) {
        return event.clientY >= rect.top && event.clientY <= rect.bottom;
      },
      findCollision: function (listElements, event) {
        for (var i = 0; i < listElements.length; i += 1) {
          if (!this.nonCollisionElement.exec(listElements[i].className)) {
            var rect = listElements[i].getBoundingClientRect();

            if (this.props.lock === 'horizontal') {
              if (this.yCollision(rect, event)) {
                return listElements[i];
              }
            } else if (this.props.lock === 'vertical') {
              if (this.xCollision(rect, event)) {
                return listElements[i];
              }
            } else {
              if (this.yCollision(rect, event)) {
                if (this.xCollision(rect, event)) {
                  return listElements[i];
                }
              }
            }

          }
        }

        return undefined;
      },

      // ---- View methods

      getDraggedStyle: function (item) {
        if (this.state.dragged && this.state.dragged.item === item) {
          return this.state.draggedStyle;
        }
        return undefined;
      },
      getDraggedClass: function (item) {
        if (this.state.dragged && this.state.dragged.item === item) {
          return 'dragged';
        }
        return undefined;
      },
      getPlaceholderClass: function (item) {
        if (this.state.dragged && this.state.dragged.item === item) {
          return 'placeholder';
        }
        return undefined;
      },

      logTarget: function (/*event*/) {
        //console.log('List', event.target);
      },

      // ---- Default methods

      componentWillUnmount: function () {
        clearTimeout(this.holdTimeout);
        clearInterval(this.scrollInterval);
        this.scrollInterval = undefined;
      },
      getInitialState: function () {
        // Updates list when props changed
        return {list: this.props.list || []};
      },
      render: function () {
        var self = this;

        var getPropsTemplate = function (item) {
          if (self.props.template) {
            var PropsTemplate = self.props.template;
            return (<PropsTemplate item={item} />);
          }
          return item;
        };

        var list = this.state.list.map(function (item, index) {
          var itemKey = item[self.props.itemKey] || item;
          var itemClass = [self.props.itemClass, self.getPlaceholderClass(item)].join(' ');
          return (
            <div key={itemKey} className={itemClass}
              onMouseDown={self.onMouseDown.bind(self, item, index)}
              onTouchStart={self.onMouseDown.bind(self, item, index)}>
              {getPropsTemplate(item)}
            </div>
          );
        });

        var targetClone = function () {
          if (self.state.dragged) {
            var itemKey = self.state.dragged.item[self.props.itemKey] || self.state.dragged.item;
            var itemClass = [self.props.itemClass, self.getDraggedClass(self.state.dragged.item)].join(' ');
            return (
              <div key={itemKey}
                className={itemClass}
                style={self.getDraggedStyle(self.state.dragged.item)}>
                {getPropsTemplate(self.state.dragged.item)}
              </div>
            );
          }
          return undefined;
        };

        return (
          <div className={this.props.listClass} onMouseDown={this.logTarget}>
            {list}
            {targetClone()}
          </div>
        );
      }
    });

  };

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Export for commonjs / browserify
  if (typeof exports !== 'undefined') {
    var React = require('react');
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = getReorderable(React);
    }
    exports.Reorderable = getReorderable(React);
  } else if (typeof root !== 'undefined') {
    // Add to root object
    root.Reorderable = getReorderable(root.React);
  }

  // Define for requirejs
  /* jshint ignore:start */
  if (typeof define === 'function' && define.amd) {
    define(['react'], function(React) {
      return getReorderable(React);
    });
  }
  /* jshint ignore:end */

})();
