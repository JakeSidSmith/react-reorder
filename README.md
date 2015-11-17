# React Reorderable

__Drag & drop, touch enabled, reorderable / sortable list, React component__

## About

React Reorderable is a React component that allows the user to drag-and-drop items in a list (horizontal / vertical) or a grid.

It fully supports touch devices and auto-scrolls when a component is being dragged (check out the demo, link below).

It also allows the user to set a hold time (duration before drag begins) allowing additional events like clicking / tapping to be applied.

Although this project is very new, it has been thoroughly tested in all modern browsers (see supported browsers).

__[Demo](http://jakesidsmith.github.io/react-reorderable/)__

## Installation

* Using npm
  ```
  npm install react-reorder
  ```
    Add `--save` or `-S` to update your package.json

* Using bower
  ```
  bower install react-reorderable
  ```
    Add `--save` or `-S` to update your bower.json

## Example

1. If using requirejs: add `react-reorderable` to your `require.config`

  ```javascript
  paths:
    // <name> : <path/to/module>
    'react-reorderable': 'react-reorderable/reorderable'
  }
  ```

2. If using a module loader (requirejs / browserfiy / commonjs): require `react-reorderable` where it will be used in your project

  ```javascript
  var Reorderable = React.createFactory(require('react-reorderable'));
  ```

  If using requirejs you'll probably want to wrap your module e.g.

  ```javascript
  define(function (require) {
    // Require react-reorderable here
  });
  ```

  **Note: For newer versions of React, the reorderable class should be wrapped with `React.createFactory`**

3. Configuration

  **Note: If your array is an array of primitives (e.g. strings) then `itemKey` is not required as the string itself will be used as the key, however item keys must be unique in any case**

  1. Using JSX

    ```javascript
    <Reorderable
      // The key of each object in your list to use as the element key
      itemKey='name',
      // Lock horizontal to have a vertical list
      lock='horizontal',
      // The milliseconds to hold an item for before dragging begins
      holdTime='500',
      // The list to display
      list={[
        {name: 'Item 1'},
        {name: 'Item 2'},
        {name: 'Item 3'}
      ]},
      // A template to display for each list item
      template={ListItem},
      // Function that is called once a reorder has been performed
      callback={this.callback},
      // Class to be applied to the outer list element
      listClass='my-list',
      // Class to be applied to each list item's wrapper element
      itemClass='list-item',
      // A function to be called if a list item is clicked (before hold time is up)
      itemClicked={this.itemClicked}
      // The item to be selected (adds 'selected' class)
      selected={this.state.selected}
      // The key to compare from the selected item object with each item object
      selectedKey='uuid'
      // Allows reordering to be disabled
      disableReorder={false}/>
    ```

  2. Using standard Javascript

    ```javascript
    React.createElement(Reorderable, {
      // The key of each object in your list to use as the element key
      itemKey: 'name',
      // Lock horizontal to have a vertical list
      lock: 'horizontal',
      // The milliseconds to hold an item for before dragging begins
      holdTime: '500',
      // The list to display
      list: [
        {name: 'Item 1'},
        {name: 'Item 2'},
        {name: 'Item 3'}
      ],
      // A template to display for each list item
      template: ListItem,
      // Function that is called once a reorder has been performed
      callback: this.callback,
      // Class to be applied to the outer list element
      listClass: 'my-list',
      // Class to be applied to each list item's wrapper element
      itemClass: 'list-item',
      // A function to be called if a list item is clicked (before hold time is up)
      itemClicked: this.itemClicked
      // The item to be selected (adds 'selected' class)
      selected: this.state.selected
      // The key to compare from the selected item object with each item object
      selectedKey: 'uuid'
      // Allows reordering to be disabled
      disableReorder: false})
    ```

5. Callback functions

  1. The `callback` function that is called once a reorder has been performed

    ```javascript
    function callback(event, itemThatHasBeenMoved, itemsPreviousIndex, itemsNewIndex, reorderedArray) {
      // ...
    }
    ```

  2. The `itemClicked` function that is called when an item is clicked before any dragging begins

    ```javascript
    function itemClicked(event, itemThatHasBeenClicked, itemsIndex) {
      // ...
    }
    ```

    **Note: `event` will be the synthetic React event for either `mouseup` or `touchend`, and both contain `clientX` & `clientY` values (for ease of use)**

## Requirements

* React (tested in v0.12.2)

* requirejs / commonjs / browserify (__Optional, but recommended*__)

\* Has only been tested with requirejs & browserify

## Supported Browsers

### Desktop

* Internet Explorer 9+ (may support IE8**)

* Google Chrome (tested in version 39.0.2171.95(64-bit))

* Mozilla Firefox (tested in version 33.0)

* Opera (tested in version 26.0.1656.60)

* Safari (tested in version 7.1.2 (9537.85.11.5))

\** Have not had a chance to test in IE8, but IE8 is supported by React


### Mobile

* Chrome (tested in version 40.0.2214.89)

* Safari (tested on iOS 8)

## Untested Browsers

* Internet Explorer 8*** (the lowest version that React supports)

\*** If anyone could confirm that this works in IE8, that'd be awesome
