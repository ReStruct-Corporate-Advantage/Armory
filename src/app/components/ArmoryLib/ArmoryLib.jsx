import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import {Armament} from "./../";
import "./ArmoryLib.component.scss";

const ArmoryLib = props => {
  const [armory, setArmory] = useState([])

  useEffect(() => {
    fetch("http://localhost:3001/armory")
      .then(res => res.json())
      .then(data => {
        console.log(JSON.parse(data))
        setArmory(JSON.parse(data).types)
      })
      .catch((err) => {
        console.log("Error: " + err)
      })
  }, []);

  const renderArmory = (node, prevKey) => <ul>{node.map((category, key) => <li className="c-Aside__list-item"><Armament category={category} index={prevKey ? prevKey + "-" + key : key} recursiveRenderer={renderArmory} /></li>)}</ul>;

  return (
    <div className="c-ArmoryLib pb-5 h-100">
      {renderArmory(armory)}
    </div>
  );
};

ArmoryLib.propTypes = {

};

export default ArmoryLib;