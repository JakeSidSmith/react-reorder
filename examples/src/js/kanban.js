import Immutable from 'immutable';
import React, { Component } from 'react';
import Reorder, { reorderImmutable, reorderFromToImmutable } from '../../../src/index';

import { classNames } from './styles';

let listInt = 0;

export class Kanban extends Component {
  constructor () {
    super();

    this.state = {
      lists: Immutable.List([{id: 'list-' + listInt, items: Immutable.List()}])
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
      <div>
        <h3>
          Kanban Board
        </h3>
        <p>
          In this example users can add and remove lists
        </p>

        {
          this.state.lists.map(({id: listId, items}) => (
            <div key={listId}>
              <p>
                {listId}
              </p>
              <Reorder
                reorderId={listId}
                reorderGroup="kanban"
                component="ul"
                className={[classNames.myList, classNames.multiList].join(' ')}
                placeholderClassName={classNames.placeholder}
                draggedClassName={classNames.dragged}
                onReorder={this.onReorderGroup.bind(this)}
              >
                {
                  items.map(({name, color}) => (
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
                  ))
                }
              </Reorder>
            </div>
          ))
        }
      </div>
    );
  }
}
