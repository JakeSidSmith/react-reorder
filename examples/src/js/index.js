'use strict';

(function () {

  require('./styles');
  var React = require('react');
  var ReactDOM = require('react-dom');
  var ReactStyleSheets = require('react-style-sheets');
  var Immutable = require('immutable');
  var Reorder = require('../../../lib/index');

  var classNames = ReactStyleSheets.createUniqueClassStyles({
    app: {
      position: 'relative',
      width: '100%',
      maxWidth: 768,
      overflow: 'hidden',
      margin: 'auto',
      padding: 8
    },
    myList: {
      float: 'left',
      width: '100%',
      height: 'auto',
      border: [1, 'solid', 'grey'],
      padding: 8,
      listStyle: 'none'
    },
    myList1: {
      height: 200,
      overflow: 'auto',
      paddingBottom: 0
    },
    myList2: {
      overflowX: 'auto',
      overflowY: 'hidden',
      height: 62,
      whiteSpace: 'nowrap'
    },
    mylist3: {},
    listItem: {
      float: 'left',
      width: '100%',
      height: 46,
      padding: 12,
      border: [2, 'solid', 'lightblue'],
      marginBottom: 8,
      transformOrigin: '50% 50%'
    },
    listItem2: {
      float: 'none',
      width: 80,
      marginBottom: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      display: 'inline-block'
    },
    listItem3: {
      float: 'left',
      width: '50%'
    },
    placeholder: {
      backgroundColor: '#CCC',
      border: [1, 'solid', '#CCC']
    },
    customPlaceholder: {
      opacity: 0.2
    },
    dragged: {
      backgroundColor: '#EEE',
      transform: 'scale(0.98, 0.98)',
      opacity: 0.8
    },
    selected: {
      border: [2, 'solid', 'red']
    },
    contentHolder: {
      display: 'table',
      width: '100%'
    },
    itemName: {
      display: 'table-cell'
    },
    input: {
      display: 'table-cell',
      width: '100%'
    }
  });

  var Main = React.createClass({
    getInitialState: function () {
      return {
        list: Immutable.List(Immutable.Range(0, 10).map(function (value) {
          return {
            name: ['Thing', value].join(' '),
            color: ['rgb(', (value + 1) * 25, ',', 250 - ((value + 1) * 25), ',0)'].join('')
          };
        })),
        prefix: 'Prefix'
      };
    },

    onReorder: function (event, previousIndex, nextIndex) {
      var list = Immutable.List(Reorder.reorderImmutable(this.state.list, previousIndex, nextIndex));

      this.setState({
        list: list
      });
    },

    onDisableToggle: function () {
      this.setState({
        disableReorder: !this.state.disableReorder
      });
    },

    onPrefixChange: function (event) {
      var target = event.currentTarget;

      this.setState({
        prefix: target.value
      });
    },

    // ----

    render: function () {
      return (
        <div className={classNames.app}>
          <h1>
            React Reorder
          </h1>
          <h2>
            Examples
          </h2>
          <h3>
            Lock horizontal
          </h3>
          <p>
            This example has a hold time of 500 milliseconds before dragging begins,
            allowing for other events like clicking / tapping to be attached
          </p>
          <p>
            Selected item: {this.state.clickedItem ? this.state.clickedItem.name : undefined}
          </p>
          <p>
            Prefix (shared props): <input type="text" value={this.state.prefix} onChange={this.onPrefixChange} />
          </p>

          <Reorder
            component="ul"
            className={[classNames.myList, classNames.myList1].join(' ')}
            placeholderClassName={classNames.placeholder}
            draggedClassName={classNames.dragged}
            lock="horizontal"
            holdTime={500}
            onReorder={this.onReorder}
            placeholder={<div className={[classNames.listItem, classNames.customPlaceholder].join(' ')} />}
          >
            {
              this.state.list.map(function (item) {
                return (
                  <li
                    key={item.name}
                    className={classNames.listItem}
                    style={{color: item.color}}
                  >
                    <div className={classNames.contentHolder}>
                      <span className={classNames.itemName}>
                        {this.state.prefix} {item.name}
                      </span>
                      <input className={classNames.input} type="text" defaultValue="Change me, I retain this state!" />
                    </div>
                  </li>
                );
              }.bind(this)).toArray()
            }
          </Reorder>

          <h3>
            Lock vertical
          </h3>
          <p>
            This example has a hold time of 250 milliseconds
          </p>
          <p>
            {'Reorder disabled: '}
            <input
              type="checkbox"
              value={this.state.disableReorder || false}
              onChange={this.onDisableToggle}
            />
            Last item clicked: {this.state.clickedItem2 ? this.state.clickedItem2.name : undefined}
          </p>

          <Reorder
            component="ul"
            className={[classNames.myList, classNames.myList2].join(' ')}
            placeholderClassName={classNames.placeholder}
            draggedClassName={classNames.dragged}
            lock="vertical"
            holdTime={250}
            onReorder={this.onReorder}
            disabled={this.state.disableReorder}
          >
            {
              this.state.list.map(function (item) {
                return (
                  <li
                    key={item.name}
                    className={[classNames.listItem, classNames.listItem2].join(' ')}
                    style={{color: item.color}}
                  >
                    {item.name}
                  </li>
                );
              }.bind(this)).toArray()
            }
          </Reorder>

          <h3>
            No lock (grid)
          </h3>
          <p>
            This example has a hold time of 0 milliseconds
          </p>

          <Reorder
            className={[classNames.myList, classNames.myList3].join(' ')}
            placeholderClassName={classNames.placeholder}
            draggedClassName={classNames.dragged}
            onReorder={this.onReorder}
          >
            {
              this.state.list.map(function (item) {
                return (
                  <li
                    key={item.name}
                    className={[classNames.listItem, classNames.listItem3].join(' ')}
                    style={{color: item.color}}
                  >
                    {item.name}
                  </li>
                );
              }.bind(this)).toArray()
            }
          </Reorder>
        </div>
      );
    }
  });

  ReactDOM.render(React.createElement(Main), document.getElementById('app'));

})();
