import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {connect, useSelector} from "react-redux";
import { createSelector } from "reselect";
import {dispatchContent} from "../../global-actions";
import {getIcons} from "../../global-selectors";
import {Network, DOMHelper} from "../../utils";
import "./LoadableIcon.component.scss";

const parser = new DOMParser();

// Add below string to prevent API calls for same iconKey,
// This value is overriden in promise resolution below
const ongoingApiCalls = {};

const iconSelectorFactory = () => createSelector(
  getIcons,
  (_, icon) => icon,
  (icons, icon) => icons.get(icon)
);

const LoadableIcon = props => {
  const { classes, color, dispatchContent, height, size, width } = props;
  let {icon} = props;
  const [b64, setB64] = useState();
  const iconSelector = useMemo(iconSelectorFactory, []);

  icon = !icon || icon.indexOf(".") < 0 ? "gr.GrStatusPlaceholder" : icon;
  const iconParts = icon.split(".");
  const iconCategory = iconParts[0] ? iconParts[0].toLowerCase() : "";
  const iconName = iconParts[1];
  const iconKey = `${iconCategory}_${iconName}`;
  
  const iData = useSelector(state => iconSelector(state, iconKey));

  const getIcon = () => {
    if (!ongoingApiCalls[iconKey]) {
      // console.log("Requesting Icon from Server for the icon: ", iconKey)
      ongoingApiCalls[iconKey] = true;
      Network.getStatic(`/icon/${iconCategory}/${iconName}`)
        .then(res => {
          const parsedSvg = parser.parseFromString(res.body, "image/svg+xml").querySelector("svg");
          dispatchContent({icons: {[iconKey]: parsedSvg}});
        })
        .catch (e => console.log(e))
        .finally(() => ongoingApiCalls[iconKey] = false);
    }
  }

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (iconName && iconCategory) {
      !iData && getIcon();
    } else {
      console.log("Icon name and category is required, received: ", icon)
    }
  }, []);

  useEffect(() => {
    iData && setB64(DOMHelper.svgToBase64(iData, {size, classes, color}));
  }, [size, classes, color])

  // Below is only for property changes after first render like on hover, click etc
  if (iData && !b64) {
    setB64(DOMHelper.svgToBase64(iData, {size, classes, color}));
  }
  
  return b64 ? <img className={`c-LoadableIcon${classes ? " " + classes : ""}`} src={`data:image/svg+xml;base64,${b64}`} style={{width: width || size || "1rem", height: height || size || "1rem"}} alt="Icon" /> : null;
};

LoadableIcon.propTypes = {
  icon: PropTypes.string,
  classes: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string
};

const mapDispatchToProps = {
  dispatchContent
}

export default connect(null, mapDispatchToProps)(LoadableIcon);