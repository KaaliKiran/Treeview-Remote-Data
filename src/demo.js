import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import {
  TreeDataState,
  CustomTreeData,
} from '@devexpress/dx-react-grid';
import {
  Grid,
  VirtualTable,
  TableHeaderRow,
  TableTreeColumn,
} from '@devexpress/dx-react-grid-material-ui';

import { Loading } from '../../../theme-sources/material-ui/components/loading';

const URL = 'https://js.devexpress.com/Demos/Mvc/api/treeListData';
const ROOT_ID = '';

const getRowId = row => row.id;
const getChildRows = (row, rootRows) => {
  const childRows = rootRows.filter(r => r.parentId === (row ? row.id : ROOT_ID));
  if (childRows.length) {
    return childRows;
  }
  return row && row.hasItems ? [] : null;
};

export default () => {
  const [columns] = useState([
    { name: 'name', title: 'Name' },
    { name: 'size', title: 'Size', getCellValue: row => (row.size ? `${Math.ceil(row.size / 1024)} KB` : '') },
    { name: 'createdDate', title: 'Created Date', getCellValue: row => new Date(Date.parse(row.createdDate)).toLocaleString() },
    { name: 'modifiedDate', title: 'Modified Date', getCellValue: row => new Date(Date.parse(row.modifiedDate)).toLocaleString() },
  ]);
  const [data, setData] = useState([]);
  const [tableColumnExtensions] = useState([
    { columnName: 'name', width: 400 },
    { columnName: 'size', width: 120, align: 'right' },
  ]);
  const [expandedRowIds, setExpandedRowIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    const rowIdsWithNotLoadedChilds = [ROOT_ID, ...expandedRowIds]
      .filter(rowId => data.findIndex(row => row.parentId === rowId) === -1);
    if (rowIdsWithNotLoadedChilds.length) {
      if (loading) return;
      setLoading(true);
      Promise.all(rowIdsWithNotLoadedChilds
        .map(rowId => fetch(`${URL}?parentIds=${rowId}`, { mode: 'cors' })
          .then(response => response.json())))
        .then((loadedData) => {
          setData(data.concat(...loadedData));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (!loading) {
      loadData();
    }
  });

  return (
    <Paper style={{ position: 'relative' }}>
      <Grid
        rows={data}
        columns={columns}
        getRowId={getRowId}
      >
        <TreeDataState
          expandedRowIds={expandedRowIds}
          onExpandedRowIdsChange={setExpandedRowIds}
        />
        <CustomTreeData
          getChildRows={getChildRows}
        />
        <VirtualTable
          columnExtensions={tableColumnExtensions}
        />
        <TableHeaderRow />
        <TableTreeColumn
          for="name"
        />
      </Grid>
      {loading && <Loading />}
    </Paper>
  );
};
