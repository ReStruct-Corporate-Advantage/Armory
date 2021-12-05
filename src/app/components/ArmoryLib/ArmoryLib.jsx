import React, {useCallback, useEffect, useState} from "react";
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
  const [searchValue, setSearchValue] = useState();
  const [localArmory, setLocalArmory] = useState(armory);

  const markAll = node => {
    node.items.forEach(subNode => {
      subNode.mark = true;
      subNode.items && markAll(subNode);
    })
  }

  const searchAndMark = useCallback((node, value) => {
    const name = node && node.name ? node.name.toLowerCase() : "";
    const displayName = node && node.displayName ? node.displayName.toLowerCase() : "";
    const tags = node && node.meta && node.meta.tags ? node.meta.tags : [];
    const createdBy = node && node.meta ? node.meta.createdBy  : "";
    if ([name, displayName, createdBy].some(item => item.toLowerCase().indexOf(value) > -1) || tags.some(tag => tag.toLowerCase().indexOf(value) > -1)) {
      node.mark = true;
      node.items && markAll(node);
      return true;
    }
    if (node.items) {
      node.mark = node.items.reduce((agg, item) => agg || searchAndMark(item, value), false);
    }
  }, []);

  useEffect(() => {
    Network.get("/api/armory")
      .then(res => {
        const root = res.body
        dispatchArmory(root)
        setLocalArmory(root);
        compGen.iterateAndGenerate(root);
      })
      .catch(e => console.log("Error: ", e));
  }, [dispatchArmory]);

  useEffect(() => {
    if (searchValue !== undefined) {
      const armoryClone = armory && JSON.parse(JSON.stringify(armory));
      armoryClone && armoryClone.forEach(node => searchAndMark(node, searchValue));
      setLocalArmory(armoryClone);
    }
  }, [armory, dispatchArmory, searchAndMark, searchValue])

  const searchFieldChangeHandler = value => {
    value = value.toLowerCase();
    setSearchValue(value);
  }

  const renderArmory = (node, clientRect, prevKey, expanded, setExpanded) => <ArmsCategory root={!prevKey} node={node} clientRect={clientRect} 
    prevKey={prevKey} renderArmory={renderArmory} expanded={expanded} setExpanded={setExpanded} isSearched={!!searchValue} {...props} />;

  return (
    <div className="c-ArmoryLib h-100">
      <FormField type="input" containerClasses="c-Search__search-field-container ps-1 mb-3 w-100 justify-center"
        attributes={{placeholder: "Search by name, tags or creator...", inputClasses: "w-100 c-Search__search-field border-5"}} onChange={searchFieldChangeHandler} />
      <div className="pb-5 h-100 overflow-auto">
        {renderArmory(localArmory)}
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