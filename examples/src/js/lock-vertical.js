import Immutable from 'immutable';
import React, { Component } from 'react';
import Reorder, { reorderImmutable } from '../../../src/index';

import { classNames } from './styles';

export class LockVertical extends Component {
  constructor () {
    super();

    this.state = {
      list: Immutable.List(Immutable.Range(0, 10).map(function (value) {
        return {
          name: ['Thing', value].join(' '),
          color: ['rgb(', (value + 1) * 25, ',', 250 - ((value + 1) * 25), ',0)'].join('')
        };
      })),
      prefix: 'Prefix',
      clickedItem: null
    };
  }

  onPrefixChange (event) {
    const target = event.currentTarget;

    this.setState({
      prefix: target.value
    });
  }

  onDisableToggle () {
    this.setState({
      disableReorder: !this.state.disableReorder
    });
  }

  onReorder (event, previousIndex, nextIndex) {
    const list = reorderImmutable(this.state.list, previousIndex, nextIndex);

    this.setState({
      list: list
    });
  }

  onClickItem (name) {
    this.setState({
      clickedItem: name
    });
  }

  render () {
    return (
      <div className={classNames.clearfix}>
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
            onChange={this.onDisableToggle.bind(this)}
          />{' '}
          Last item clicked: {this.state.clickedItem}
        </p>

        <Reorder
          reorderId="myList2"
          component="ul"
          className={[classNames.myList, classNames.myList2].join(' ')}
          placeholderClassName={classNames.placeholder}
          draggedClassName={classNames.dragged}
          lock="vertical"
          holdTime={250}
          onReorder={this.onReorder.bind(this)}
          disabled={this.state.disableReorder}
        >
          {
            this.state.list.map(({name, color}) => (
              <li
                key={name}
                className={[classNames.listItem, classNames.listItem2].join(' ')}
                style={{color: color}}
                onClick={this.onClickItem.bind(this, name)}
              >
                {name}
              </li>
            )).toArray()
          }
        </Reorder>
      </div>
    );
  }
}
