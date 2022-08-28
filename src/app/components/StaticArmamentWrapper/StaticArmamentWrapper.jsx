import React, {memo} from "react";
import StyleAggregator from "../../utils/CodeUtils/StyleAggregator";
import Helper from "../../utils/Helper";
import "./StaticArmamentWrapper.component.scss";

const StaticArmamentWrapper = props => {
  const {children, componentConfig} = props;
  const {descriptor} = componentConfig || {};
  const Component = children;

  const wrapperStyles = {};
  const aggregatedStyles = StyleAggregator.aggregateStyles([descriptor.styles, {height: descriptor.defaultHeight, width: descriptor.defaultWidth}]);
  descriptor && descriptor.wrapperStyles && Object.keys(aggregatedStyles).forEach(key => {
    if (descriptor.wrapperStyles.indexOf(key) > -1) {
      const defaultKey = Helper.getDefaultKey(key);
      const wrapperStyle = descriptor.styles[key] || descriptor[defaultKey];
      if (wrapperStyle) {
        wrapperStyles[key] = wrapperStyle;
      }
    }
  })
  return (
    <div className="c-StaticArmamentWrapper position-absolute"
      id={`${componentConfig.uuid}-RENDER`}
      style={{top: 0, left: 0, ...wrapperStyles}}>
        {Component && <Component {...componentConfig} />}
    </div>
  );
};

StaticArmamentWrapper.whyDidYouRender = true;

export default memo(StaticArmamentWrapper);