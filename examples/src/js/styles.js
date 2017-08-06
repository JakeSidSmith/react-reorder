import ReactStyleSheets from 'react-style-sheets';

ReactStyleSheets.setOptions({
  vendorPrefixes: {
    userSelect: ['webkit', 'khtml', 'moz', 'ms', 'o'],
    transform: ['webkit', 'moz', 'ms', 'o'],
    transition: ['webkit', 'moz', 'ms', 'o'],
    transformOrigin: ['webkit', 'moz', 'ms', 'o']
  }
});

const htmlBody = {
  padding: 0,
  margin: 0,
  fontFamily: ['arial', 'helvetica', 'sans-serif'],
  fontSize: 14,
  color: '#333',
  WebkitTouchCallout: 'none',
  userSelect: 'none',
  WebkitTapHighlightColor: 'transparent'
};

ReactStyleSheets.createGlobalTagStyles({
  '*': {
    boxSizing: 'border-box'
  },
  html: htmlBody,
  body: htmlBody,
  p: {
    margin: [10, 'auto']
  }
});

export const classNames = ReactStyleSheets.createUniqueClassStyles({
  app: {
    position: 'relative',
    width: '100%',
    maxWidth: 768,
    overflow: 'hidden',
    margin: 'auto',
    padding: 8
  },
  clearfix: {
    before: {
      content: '\'\'',
      display: 'table',
      clear: 'both'
    },
    after: {
      content: '\'\'',
      display: 'table',
      clear: 'both'
    }
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
  multiList: {
    width: '50%',
    minHeight: 100,
    maxHeight: 400,
    overflowX: 'hidden',
    overflowY: 'auto'
  },
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
  multiListItem: {},
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
  },
  kanban: {
    overflowY: 'auto',
    height: 500
  },
  kanbanListOuter: {
    width: 200,
    border: [1, 'solid', '#ddd'],
    backgroundColor: '#fafafa',
    borderRadius: 4
  },
  kanbanListInner: {
    border: 'none',
    width: '100%',
    minHeight: 100,
    maxHeight: 400,
    overflowX: 'hidden',
    overflowY: 'auto',
    margin: 0
  },
  kanbanItem: {
    borderRadius: 4,
    border: [1, 'solid', '#ccc'],
    backgroundColor: '#eee',
    lastChild: {
      marginBottom: 0
    }
  },
  kanbanHeader: {
    float: 'left',
    width: '100%',
    padding: 8,
    borderBottom: [1, 'solid', '#ddd'],
    backgroundColor: '#eee'
  },
  kanbanFooter: {
    float: 'left',
    width: '100%',
    padding: 8,
    borderTop: [1, 'solid', '#ddd'],
    backgroundColor: '#eee',
    cursor: 'pointer',
    textAlign: 'center'
  }
});
