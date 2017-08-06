import Immutable from 'immutable';
import React, { Component } from 'react';
import Reorder, { reorderImmutable, reorderFromToImmutable } from '../../../src/index';

import { classNames } from './styles';

let listInt = 0;
let itemInt = 0;

export class Kanban extends Component {
  constructor () {
    super();

    this.state = {
      lists: Immutable.List([{id: 'list-' + listInt, items: Immutable.List()}])
    };
  }

  addItem (index) {
    const list = this.state.lists.get(index, {id: 'list-' + listInt, items: Immutable.List()});
    listInt += 1;
    list.items = list.items.push({name: 'item-' + itemInt});
    itemInt += 1;

    this.setState({
      lists: this.state.lists.set(index, list)
    });
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
          Kanban Board
        </h3>
        <p>
          In this example users can add and remove lists
        </p>

        <div className={classNames.kanban}>
          {
            this.state.lists.map(({id: listId, items}, index) => (
              <div
                key={listId}
                className={[classNames.clearfix, classNames.kanbanListOuter].join(' ')}
              >
                <div className={classNames.kanbanHeader}>
                  {listId}
                </div>
                <Reorder
                  reorderId={listId}
                  reorderGroup="kanban"
                  component="ul"
                  className={[classNames.myList, classNames.kanbanListInner].join(' ')}
                  placeholderClassName={[classNames.placeholder, classNames.customPlaceholder].join(' ')}
                  draggedClassName={classNames.dragged}
                  onReorder={this.onReorderGroup.bind(this)}
                >
                  {
                    items.map(({name}) => (
                      <li
                        key={name}
                        className={[classNames.listItem, classNames.kanbanItem].join(' ')}
                      >
                        <div className={classNames.contentHolder}>
                          {name}
                        </div>
                      </li>
                    )).toArray()
                  }
                </Reorder>
                <div className={classNames.kanbanFooter} onClick={this.addItem.bind(this, index)}>
                  Add item +
                </div>
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}
