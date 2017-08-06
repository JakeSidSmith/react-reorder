import { classNames } from './styles';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { LockHorizontal } from './lock-horizontal';
import { LockVertical } from './lock-vertical';
import { Grid } from './grid';
import { MultiList } from './multi-list';
import { Kanban } from './kanban';

class Main extends Component {
  render () {
    return (
      <div className={classNames.app}>
        <h1>
          React Reorder
        </h1>
        <h2>
          Examples
        </h2>

        <LockHorizontal />
        <LockVertical />
        <Grid />
        <MultiList />
        <Kanban />

      </div>
    );
  }
}

ReactDOM.render(React.createElement(Main), document.getElementById('app'));
