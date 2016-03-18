'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Reorder = require('../../../index');

var ListItem = React.createClass({
  render: function () {
    return React.createElement('div', {
      className: 'inner',
      style: {
        color: this.props.item.color
      }
    }, this.props.sharedProps ? this.props.sharedProps.prefix : undefined, this.props.item.name);
  }
});

var Main = React.createClass({
  callback: function (event, item, index, newIndex, list) {
    this.setState({arr: list});
  },
  itemClicked: function (event, item) {
    this.setState({
      clickedItem: item === this.state.clickedItem ? undefined : item
    });
  },
  itemClicked2: function (event, item) {
    this.setState({clickedItem2: item});
  },
  disableToggled: function () {
    this.setState({disableReorder: !this.state.disableReorder});
  },
  prefixChanged: function (event) {
    var target = event.currentTarget;
    this.setState({prefix: target.value});
  },

  // ----

  getInitialState: function () {
    var list = [];

    for (var i = 0; i < 10; i += 1) {
      list.push({name: ['Thing', i].join(' '), color: ['rgb(',(i + 1) * 25, ',', 250 - ((i + 1) * 25),',0)'].join('')});
    }

    return {
      arr: list,
      prefix: 'Prefix'
    };
  },
  render: function () {
    return React.createElement('div', {className: 'app'},

      React.createElement('p', null, React.createElement('strong', null, 'Lock horizontal')),
      React.createElement('small', null, 'This example has a hold time of 500 milliseconds before dragging begins, allowing for other events like clicking / tapping to be attached'),

      React.createElement('p', null, 'Selected item: ', this.state.clickedItem ? this.state.clickedItem.name : undefined),

      React.createElement('p', null,
        'Prefix (shared props): ',
        React.createElement('input', {
          type: 'text',
          onChange: this.prefixChanged,
          value: this.state.prefix
        })
      ),

      React.createElement(Reorder, {
        itemKey: 'name',
        lock: 'horizontal',
        holdTime: '500',
        list: this.state.arr,
        template: ListItem,
        callback: this.callback,
        listClass: 'my-list',
        itemClass: 'list-item',
        itemClicked: this.itemClicked,
        selected: this.state.clickedItem,
        selectedKey: 'name',
        sharedProps: {
          prefix: [this.state.prefix, ': '].join('')
        }}),

      React.createElement('p', null, React.createElement('strong', null, 'Lock vertical')),
      React.createElement('small', null, 'This example has a hold time of 250 milliseconds'),

      React.createElement('p', null,
        'Reorder disabled: ',
        React.createElement('input', {
          type: 'checkbox',
          onChange: this.disableToggled,
          value: this.state.disableReorder || false
        }),
        'Last item clicked: ',
        this.state.clickedItem2 ? this.state.clickedItem2.name : undefined
      ),

      React.createElement(Reorder, {
        itemKey: 'name',
        lock: 'vertical',
        holdTime: '250',
        list: this.state.arr,
        template: ListItem,
        callback: this.callback,
        listClass: 'my-list-2',
        itemClass: 'list-item',
        itemClicked: this.itemClicked2,
        disableReorder: this.state.disableReorder}),

      React.createElement('p', null, React.createElement('strong', null, 'No lock (grid)')),
      React.createElement('small', null, 'This example has a hold time of 0 milliseconds'),

      React.createElement(Reorder, {
        itemKey: 'name',
        holdTime: '0',
        list: this.state.arr,
        template: ListItem,
        callback: this.callback,
        listClass: 'my-list-3',
        itemClass: 'list-item'})

    );
  }
});

ReactDOM.render(React.createElement(Main), document.getElementById('app'));
