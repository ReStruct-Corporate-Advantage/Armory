import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {ArmsCategory} from "./../";
import armoryRepo from "./../../data/armory.json";
import "./ArmoryLib.component.scss";

const ArmoryLib = props => {
  const [armory, setArmory] = useState([])
  const {clientRect} = props;
  useEffect(() => {
    // fetch("http://localhost:3001/armory/image")
    //   .then(res => console.log(res));
    setArmory(armoryRepo.types);
    fetch("http://localhost:3001/armory")
      .then(res => res.json())
      .then(data => {setArmory(JSON.parse(data).types)})
      .catch(err => console.log("Error: " + err))
  }, []);

  const renderArmory = (node, clientRect, prevKey, expanded, setExpanded) => <ArmsCategory root={!prevKey} node={node} clientRect={clientRect} 
    prevKey={prevKey} renderArmory={renderArmory} expanded={expanded} setExpanded={setExpanded} {...props} />;

  return (
    <div className="c-ArmoryLib pb-5 h-100">
      {renderArmory(armory)}
    </div>
  );
};

ArmoryLib.propTypes = {
  clientRect: PropTypes.object
};

export default ArmoryLib;