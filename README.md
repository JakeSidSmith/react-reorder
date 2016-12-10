# React Reorder [![CircleCI](https://circleci.com/gh/JakeSidSmith/react-reorder.svg?style=svg)](https://circleci.com/gh/JakeSidSmith/react-reorder)

__Drag & drop, touch enabled, reorder / sortable list, React component__

## About

React Reorder is a React component that allows the user to drag-and-drop items in a list (horizontal / vertical) or a grid.

It fully supports touch devices and auto-scrolls when a component is being dragged (check out the [demo](http://jakesidsmith.github.io/react-reorder/)).

It also allows the user to set a hold time (duration before drag begins) allowing additional events like clicking / tapping to be applied.

## Installation

* Using npm
  ```
  npm install react-reorder
  ```
    Add `--save` or `-S` to update your package.json

* Using bower
  ```
  bower install react-reorder
  ```
    Add `--save` or `-S` to update your bower.json

## Example

1. If using requirejs: add `react-reorder` to your `require.config`

  ```javascript
  paths:
    // <name> : <path/to/module>
    'react-reorder': 'react-reorder/reorder'
  }
  ```

2. If using a module loader (requirejs / browserfiy / commonjs): require `react-reorder` where it will be used in your project

  ```javascript
  var Reorder = require('react-reorder');
  ```

  If using requirejs you'll probably want to wrap your module e.g.

  ```javascript
  define(function (require) {
    // Require react-reorder here
  });
  ```

3. Configuration

  ```javascript
  <Reorder
    component="ul" // Tag name or Component to be used for the wrapping element
    placeholderClassName="placeholder" // Class name to be applied to placeholder elements (optional)
    draggedClassName="dragged" // Class name to be applied to dragged elements (optional)
    lock="horizontal" // Lock the dragging direction (optional): vertical, horizontal
    holdTime={500} // Default hold time before dragging begins (mouse & touch) (optional) defaults to 0
    touchHoldTime={500} // Hold time before dragging begins on touch devices (optional) defaults to holdTime
    mouseHoldTime={200} // Hold time before dragging begins with mouse (optional) defaults to holdTime
    onReorder={this.onReorder} // Callback when an item is dropped (you will need this to update your state)
    placeholder={
      <div className="custom-placeholder" /> // Custom placeholder element (optional, defaults to child element)
    }
  >
    {
      this.state.list.map(function (item) {
        return (
          <li key={item.name}>{item.name}</li>
        );
      }).toArray() // Note this example is an ImmutableJS List so we must turn it into an array
    }
  </Reorder>
  ```

5. Callback functions

  * The `onReorder` function that is called once a reorder has been performed

    ```javascript
    function onReorder(event, fromIndex, toIndex) {
      // You can use our helper functions for reordering your arrays (reorderImmutable is also available)
      this.setState({
        myList: Reorder.reorder(this.state.myList, fromIndex, toIndex);
      });
    }
    ```

    **Note: `event` will be the synthetic React event for either `mouseup` or `touchend`, and both contain `clientX` & `clientY` values (for ease of use)**

## Compatibility / Requirements

* Version `3.x` tested and working with React `0.15`

* Version `2.x` tested and working with React `0.14`

* Versions `1.x` tested and working with React `0.12` - `0.13`

* requirejs / commonjs / browserify (__Optional, but recommended*__)

\* Has only been tested with requirejs & browserify

## Supported Browsers

### Desktop

* Internet Explorer 9+ (dropped support for IE 8)

* Google Chrome (tested in version 39.0.2171.95(64-bit))

* Mozilla Firefox (tested in version 33.0)

* Opera (tested in version 26.0.1656.60)

* Safari (tested in version 7.1.2 (9537.85.11.5))

### Mobile

* Chrome (tested in version 40.0.2214.89)

* Safari (tested on iOS 8)
