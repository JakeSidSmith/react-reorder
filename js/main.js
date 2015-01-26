/** @jsx React.DOM */

'use strict';

window.define(function (require) {

  var React = require('react');
  var Reorderable = React.createFactory(require('react-reorderable'));

  var ListItem = React.createFactory(
    React.createClass({
      render: function () {
        return React.createElement('div', {
          className: 'inner',
          style: {
            color: this.props.item.color
          }
        }, this.props.item.name);
      }
    })
  );

  var Main = React.createFactory(
    React.createClass({
      callback: function (event, item, index, newIndex, list) {
        console.log(arguments);
        this.setState({arr: list});
      },
      itemClicked: function (event, item) {
        this.setState({clickedItem: item});
      },

      // ----

      getInitialState: function () {
        var list = [];

        for (var i = 0; i < 10; i += 1) {
          list.push({name: ['Thing', i].join(' '), color: ['rgb(',(i + 1) * 25, ',', 250 - ((i + 1) * 25),',0)'].join('')});
        }

        return {
          arr: list
        };
      },
      render: function () {
        return React.createElement('div', {className: 'app'},

          React.createElement('p', null, React.createElement('strong', null, 'Lock horizontal')),
          React.createElement('small', null, 'This example has a hold time of 500 milliseconds before dragging begins, allowing for other events like clicking / tapping to be attached'),

          React.createElement('p', null, 'Clicked item: ', this.state.clickedItem ? this.state.clickedItem.name : undefined),

          React.createElement(Reorderable, {
            itemKey: 'name',
            lock: 'horizontal',
            holdTime: '500',
            list: this.state.arr,
            template: ListItem,
            callback: this.callback,
            listClass: 'my-list',
            itemClass: 'list-item',
            itemClicked: this.itemClicked}),

          React.createElement('p', null, React.createElement('strong', null, 'Lock vertical')),
          React.createElement('small', null, 'This example has a hold time of 250 milliseconds'),

          React.createElement(Reorderable, {
            itemKey: 'name',
            lock: 'vertical',
            holdTime: '250',
            list: this.state.arr,
            template: ListItem,
            callback: this.callback,
            listClass: 'my-list-2',
            itemClass: 'list-item'}),

          React.createElement('p', null, React.createElement('strong', null, 'No lock (grid)')),
          React.createElement('small', null, 'This example has a hold time of 0 milliseconds'),

          React.createElement(Reorderable, {
            itemKey: 'name',
            holdTime: '0',
            list: this.state.arr,
            template: ListItem,
            callback: this.callback,
            listClass: 'my-list-3',
            itemClass: 'list-item'})

        );
      }
    })
  );

  React.render(React.createElement(Main), document.body);

});
