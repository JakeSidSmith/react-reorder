/** @jsx React.DOM */

'use strict';

window.define(function (require) {

  var React = require('react');
  var Reorderable = React.createFactory(require('jsx!reorderable'));

  var ListItem = React.createFactory(
    React.createClass({
      render: function () {
        return (
          <div className='inner'
          style={{color: this.props.item.color}}>
          {this.props.item.name}
          </div>
        );
      }
    })
  );

  var Main = React.createFactory(
    React.createClass({
      callback: function (list) {
        this.setState({arr: list});
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
        return (
          <div className='app'>

            <p>Lock horizontal</p>

            <Reorderable
            itemKey='name'
            lock='horizontal'
            holdTime='500'
            list={this.state.arr}
            template={ListItem}
            callback={this.callback}
            listClass='my-list'
            itemClass='list-item'/>

            <p>Lock vertical</p>

            <Reorderable
            itemKey='name'
            lock='vertical'
            holdTime='500'
            list={this.state.arr}
            template={ListItem}
            callback={this.callback}
            listClass='my-list-2'
            itemClass='list-item'/>

            <p>No lock (grid)</p>

            <Reorderable
            itemKey='name'
            holdTime='500'
            list={this.state.arr}
            template={ListItem}
            callback={this.callback}
            listClass='my-list-3'
            itemClass='list-item'/>

          </div>
        );
      }
    })
  );

  React.render(<Main />, document.body);

});
