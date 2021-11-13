import React, {memo} from "react";
import "./StaticArmamentWrapper.component.scss";

const StaticArmamentWrapper = props => {
  const {children, componentConfig} = props;
  const Component = children;

  return (
    <div className="c-StaticArmamentWrapper position-absolute ml-5 mt-5"
      id={`${componentConfig.uuid}-RENDER`}
      style={{top: 0, left: 0}}>
        {Component && <Component {...componentConfig} />}
    </div>
  );
};

StaticArmamentWrapper.whyDidYouRender = true;

export default memo(StaticArmamentWrapper);