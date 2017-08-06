import Immutable from 'immutable';
import React, { Component } from 'react';
import Reorder, { reorderImmutable } from '../../../src/index';

import { classNames } from './styles';

export class Grid extends Component {
  constructor () {
    super();

    this.state = {
      list: Immutable.List(Immutable.Range(0, 10).map(function (value) {
        return {
          name: ['Thing', value].join(' '),
          color: ['rgb(', (value + 1) * 25, ',', 250 - ((value + 1) * 25), ',0)'].join('')
        };
      }))
    };
  }

  onReorder (event, previousIndex, nextIndex) {
    const list = reorderImmutable(this.state.list, previousIndex, nextIndex);

    this.setState({
      list: list
    });
  }

  render () {
    return (
      <div className={classNames.clearfix}>
        <h3>
          No lock (grid)
        </h3>
        <p>
          This example has a hold time of 0 milliseconds
        </p>

        <Reorder
          reorderId="myList3"
          component="ul"
          className={[classNames.myList, classNames.myList3].join(' ')}
          placeholderClassName={classNames.placeholder}
          draggedClassName={classNames.dragged}
          onReorder={this.onReorder.bind(this)}
        >
          {
            this.state.list.map(({name, color}) => (
              <li
                key={name}
                className={[classNames.listItem, classNames.listItem3].join(' ')}
                style={{color: color}}
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
