import React, {useEffect} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import {dispatchArmory} from "./../../pages/ComponentCreator/actions";
import {getArmory} from "../../pages/ComponentCreator/selectors";
import {ArmsCategory, FormField} from "./../";
import Network from "../../utils/network";
import {compGen} from "../../utils/CodeUtils/ComponentGenerator";
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
  }, [dispatchArmory]);

  const searchFieldChangeHandler = value => {
    value = value.toLowerCase();
    const armoryClone = armory && JSON.parse(JSON.stringify(armory));
    const queue = [];
    armoryClone && armoryClone.forEach(node => {
      queue.push(node);
      const name = node && node.name ? node.name.toLowerCase() : "";
      const displayName = node && node.displayName ? node.displayName.toLowerCase() : "";
      const tags = node && node.meta && node.meta.tags ? node.meta.tags : [];
      const createdBy = node && node.meta ? node.meta.createdBy  : "";
      if (!node.items || node.items.length === 0) {
        if (!([name, displayName, createdBy].some(item => item.toLowerCase().indexOf(value) > -1) || tags.some(tag => tag.toLowerCase().indexOf(value) > -1))) {
          armoryClone.splice(armoryClone.indexOf(node), 1);
        }
      } else {
        // node.items.forEach(queue.)
      }
    })
    dispatchArmory(armoryClone);
  }

  const renderArmory = (node, clientRect, prevKey, expanded, setExpanded) => <ArmsCategory root={!prevKey} node={node} clientRect={clientRect} 
    prevKey={prevKey} renderArmory={renderArmory} expanded={expanded} setExpanded={setExpanded} {...props} />;

  return (
    <div className="c-ArmoryLib h-100">
      <FormField type="input" containerClasses="c-Search__search-field-container ps-1 mb-3 w-100 justify-center"
        attributes={{placeholder: "Type to search", inputClasses: "w-100 c-Search__search-field border-5"}} onChange={searchFieldChangeHandler} />
      <div className="pb-5 h-100 overflow-auto">
        {renderArmory(armory)}
      </div>
    </div>
  );
};

ArmoryLib.propTypes = {
  clientRect: PropTypes.object,
  context: PropTypes.string
};

const mapStateToProps = createPropsSelector({
  armory: getArmory
})

const mapDispatchToProps = {
  dispatchArmory
}

export default connect(mapStateToProps, mapDispatchToProps)(ArmoryLib);