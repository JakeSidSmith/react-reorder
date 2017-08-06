import Immutable from 'immutable';
import React, { Component } from 'react';
import Reorder, { reorderImmutable, reorderFromToImmutable } from '../../../src/index';

import { classNames } from './styles';

export class MultiList extends Component {
  constructor () {
    super();

    this.state = {
      listA: Immutable.List(Immutable.Range(0, 5).map(function (value) {
        return {
          name: ['List A - Item', value].join(' '),
          color: ['rgb(', (value + 1) * 25, ',', 250 - ((value + 1) * 25), ',0)'].join('')
        };
      })),
      listB: Immutable.List(Immutable.Range(0, 5).map(function (value) {
        return {
          name: ['List B - Item', value].join(' '),
          color: ['rgb(', (value + 1) * 25, ',', 250 - ((value + 1) * 25), ',0)'].join('')
        };
      }))
    };
  }

  onReorderGroup (event, previousIndex, nextIndex, fromId, toId) {
    if (fromId === toId) {
      const list = reorderImmutable(this.state[fromId], previousIndex, nextIndex);

      this.setState({
        [fromId]: list
      });
    } else {
      const lists = reorderFromToImmutable({
        from: this.state[fromId],
        to: this.state[toId]
      }, previousIndex, nextIndex);

      this.setState({
        [fromId]: lists.from,
        [toId]: lists.to
      });
    }
  }

  render () {
    return (
      <div className={classNames.clearfix}>
        <h3>
          Drag between lists
        </h3>
        <p>
          This example has a group of lists that you can drag items between
        </p>

        <Reorder
          reorderId="listA"
          reorderGroup="reorderGroup"
          component="ul"
          className={[classNames.myList, classNames.multiList].join(' ')}
          placeholderClassName={classNames.placeholder}
          draggedClassName={classNames.dragged}
          onReorder={this.onReorderGroup.bind(this)}
        >
          {
            this.state.listA.map(({name, color}) => (
              <li
                key={name}
                className={[classNames.listItem, classNames.multiListItem].join(' ')}
                style={{color: color}}
              >
                <div className={classNames.contentHolder}>
                  <span className={classNames.itemName}>
                    {name}
                  </span>
                  <input
                    className={classNames.input}
                    type="text"
                    defaultValue="Change me, I  sort of retain this state!"
                  />
                </div>
              </li>
            )).toArray()
          }
        </Reorder>

        <Reorder
          reorderId="listB"
          reorderGroup="reorderGroup"
          component="ul"
          className={[classNames.myList, classNames.multiList].join(' ')}
          placeholderClassName={classNames.placeholder}
          draggedClassName={classNames.dragged}
          onReorder={this.onReorderGroup.bind(this)}
        >
          {
            this.state.listB.map(({name, color}) => (
              <li
                key={name}
                className={[classNames.listItem, classNames.multiListItem].join(' ')}
                style={{color: color}}
              >
                <div className={classNames.contentHolder}>
                  <span className={classNames.itemName}>
                    {name}
                  </span>
                  <input
                    className={classNames.input}
                    type="text"
                    defaultValue="Change me, I  sort of retain this state!"
                  />
                </div>
              </li>
            )).toArray()
          }
        </Reorder>
      </div>
    );
  }
}


