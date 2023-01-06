import React from "react";
import PropTypes from "prop-types";
import "./CumulativeWorksTable.component.scss";
import Table from "../Table";

const columns = [
  {Header: "S. No.", accessor: "sNo"},
  {Header: "Name", accessor: "name"},
  {Header: "Type", accessor: "type"},
  {Header: "Status", accessor: "status"},
  {Header: "Assignee", accessor: "assignee"},
];

const CumulativeWorksTable = props => {
  const {data, user, navigate} = props;
  const tableData = [];
  return (
    <div className="c-CumulativeWorksTable px-3">
      {tableData && <Table columns={columns} data={tableData} />}
    </div>
  );
};

CumulativeWorksTable.propTypes = {
  data: PropTypes.object,
  user: PropTypes.object,
  navigate: PropTypes.func
};

export default CumulativeWorksTable;