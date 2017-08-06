import Immutable from 'immutable';
import React, { Component } from 'react';
import Reorder, { reorderImmutable, reorderFromToImmutable } from '../../../src/index';

import { classNames } from './styles';

let listInt = 1;
let itemInt = 1;

export class Kanban extends Component {
  constructor () {
    super();

    this.state = {
      lists: Immutable.List.of(
        Immutable.Map({
          id: 'list-' + listInt,
          items: Immutable.List.of(
            Immutable.Map({
              name: 'item-' + itemInt
            })
          )
        })
      )
    };
  }

  deleteList (index) {
    this.setState({
      lists: this.state.lists.delete(index)
    });
  }

  addItem (index) {
    let list = this.state.lists.getIn([index, 'items']);
    list = list.push(Immutable.Map({name: 'item-' + (itemInt += 1)}));

    this.setState({
      lists: this.state.lists.setIn([index, 'items'], list)
    });
  }

  onReorderGroup (event, previousIndex, nextIndex, fromId, toId) {
    if (fromId === toId) {
      const index = this.state.lists.findIndex((list) => list.get('id') === fromId);
      let list = this.state.lists.getIn([index, 'items']);
      list = reorderImmutable(list, previousIndex, nextIndex);

      this.setState({
        lists: this.state.lists.setIn([index, 'items'], list)
      });
    } else {
      const fromIndex = this.state.lists.findIndex((list) => list.get('id') === fromId);
      const toIndex = this.state.lists.findIndex((list) => list.get('id') === toId);

      let fromList = this.state.lists.getIn([fromIndex, 'items']);
      let toList = this.state.lists.getIn([toIndex, 'items']);

      const lists = reorderFromToImmutable({
        from: fromList,
        to: toList
      }, previousIndex, nextIndex);

      this.setState({
        lists: this.state.lists.setIn([fromIndex, 'items'], lists.from).setIn([toIndex, 'items'], lists.to)
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
            this.state.lists.map((list, index) => (
              <div
                key={list.get('id')}
                className={[classNames.clearfix, classNames.kanbanListOuter].join(' ')}
              >
                <div className={classNames.kanbanHeader}>
                  {list.get('id')}
                  <span className={classNames.delete} onClick={this.deleteList.bind(this, index)}>
                    X
                  </span>
                </div>
                <Reorder
                  reorderId={list.get('id')}
                  reorderGroup="kanban"
                  component="ul"
                  className={[classNames.myList, classNames.kanbanListInner].join(' ')}
                  placeholderClassName={[classNames.placeholder, classNames.customPlaceholder].join(' ')}
                  draggedClassName={classNames.dragged}
                  onReorder={this.onReorderGroup.bind(this)}
                >
                  {
                    list.get('items').map((item) => (
                      <li
                        key={item.get('name')}
                        className={[classNames.listItem, classNames.kanbanItem].join(' ')}
                      >
                        <div className={classNames.contentHolder}>
                          {item.get('name')}
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
