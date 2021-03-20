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

        <p>
          Adding extra nesting levels to identify performance impact
          (i.e. when autoScrollParents = true)
        </p>
        <div><div><div><div><div><div><div><div><div><div>
          <Kanban />
          <LockHorizontal />
          <LockVertical />
          <Grid />
          <MultiList />
        </div></div></div></div></div></div></div></div></div></div>

      </div>
    );
  }
}

ReactDOM.render(React.createElement(Main), document.getElementById('app'));
