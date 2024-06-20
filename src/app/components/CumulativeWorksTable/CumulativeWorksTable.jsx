import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Table} from "..";
import "./CumulativeWorksTable.component.scss";

const columns = [
  {Header: "S. No.", accessor: "sNo"},
  {Header: "Name", accessor: "name", classes: "text-start ps-3", style: {width: "7rem"}},
  {Header: "Description", accessor: "about"},
  {Header: "Type", accessor: "type"},
  {Header: "Status", accessor: "status"},
  {Header: "Assignee", accessor: "assignee.username"},
  {Header: "Actions"}
];

const CumulativeWorksTable = props => {
  const {rawData} = props;
  const [tableData, setTableData]  = useState();

  useEffect(() => {
    if (rawData && !tableData) {
      const final = Object.values(rawData)
        .reduce((acc, current) => acc.concat(current), [])
        .map((item, i) => ({sNo: i + 1, name: item.name, type: item.type, status: item.state, assignee: item.owner}));
      setTableData(final);
    }
  }, [rawData]);
  
  return <div className="c-CumulativeWorksTable px-3">
      {tableData && <Table columns={columns} data={tableData} />}
    </div>;
};

CumulativeWorksTable.propTypes = {
  data: PropTypes.object,
  user: PropTypes.object,
  navigate: PropTypes.func
};

export default CumulativeWorksTable;