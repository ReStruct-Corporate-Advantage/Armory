import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {ArmsCategory} from "./../";
import Network from "../../utils/network";
import armoryRepo from "./../../data/armory.json";
import "./ArmoryLib.component.scss";

const ArmoryLib = props => {
  const [armory, setArmory] = useState([])
  // const {clientRect} = props;
  useEffect(() => {
    // setArmory(armoryRepo.types);
    Network.get("http://localhost:3002/api/armory")
      .then(res => {
//         console.log(res.body)
        setArmory(res.body)
        })
      .catch(e => console.log("Error: ", e));
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