import React, {useEffect} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import {dispatchArmory} from "./../../pages/ComponentCreator/actions";
import {getArmory} from "../../pages/ComponentCreator/selectors";
import {ArmsCategory} from "./../";
import Network from "../../utils/network";
import {compGen} from "../../utils/CodeUtils/ComponentGenerator";
import { API_CONFIG } from "../../constants/api-config";
import "./ArmoryLib.component.scss";

const ArmoryLib = props => {
  const {armory, dispatchArmory} = props;
  useEffect(() => {
    Network.get("/api/armory")
      .then(res => {
        const root = res.body
        dispatchArmory(root)
        compGen.iterateAndGenerate(root);
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

const mapStateToProps = createPropsSelector({
  armory: getArmory
})

const mapDispatchToProps = {
  dispatchArmory
}

export default connect(mapStateToProps, mapDispatchToProps)(ArmoryLib);