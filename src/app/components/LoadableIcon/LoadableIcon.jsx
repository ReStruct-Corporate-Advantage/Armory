import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {createPropsSelector} from "reselect-immutable-helpers";
import {connect} from "react-redux";
import {dispatchContent} from "../../global-actions";
import {getIcons} from "../../global-selectors";
import Network from "../../utils/network";
import "./LoadableIcon.component.scss";

const parser = new DOMParser();

const LoadableIcon = props => {
  const { classes, color, dispatchContent, size } = props;
  let {icons} = props;
  let { icon } = props;
  const [svg, setSvg] = useState();
  icon = !icon || icon.indexOf(".") < 0 ? "gr.GrStatusPlaceholder" : icon;
  const iconParts = icon.split(".");
  const iconCategory = iconParts[0] ? iconParts[0].toLowerCase() : "";
  const iconName = iconParts[1];
  const iconKey = `${iconCategory}_${iconName}`;

  const getIcon = () => {
    // Add below string to prevent API calls for same iconKey,
    // This value is overriden in promise resolution below
    icons[iconKey] = "--placeholder--";
    // console.log("Pushing icon request to repo for: ", iconKey)
    dispatchContent({icons})
    setTimeout(() => {
      if (icons[iconKey]) {
        // console.log("Requesting Icon from Server for the icon: ", iconKey)
        Network.getStatic(`/icon/${iconCategory}/${iconName}`)
          .then(res => {
            const parsedSvg = parser.parseFromString(res.body, "image/svg+xml").querySelector("svg");
            icons = {...icons};
            icons[iconKey] = parsedSvg;
            dispatchContent({icons});
          })
          .catch (e => console.log(e));
      }
    }, 10);
  }

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (iconName && iconCategory) {
      if (!icons || !icons[iconKey]) {
        getIcon();
      } else {
        if (!svg && icons[iconKey] && icons[iconKey] !== "--placeholder--") {
          setSvg(icons[iconKey])
        }
      }
    } else {
      console.log("Icon name and category is required, received: ", icon)
    }
  }, [icons]);

  let b64svg;
  if (svg && typeof svg === "object") {
    svg.setAttribute("height", size || "1rem");
    svg.setAttribute("width", size || "1rem");
    svg.setAttribute("class", classes || "");
    svg.setAttribute("stroke", color);
    // svg.setAttribute("fill", color);
    const path = svg.querySelector("path");
    // Override stroke and color of "path" node inside SVG at below line.
    path && color && !!path.getAttribute("stroke") && path.setAttribute("stroke", color);
    // path && color && !!path.getAttribute("fill") && path.setAttribute("fill", color);
    svg.style.color = color;
    const serializedSvg = new XMLSerializer().serializeToString(svg);
    b64svg = btoa(serializedSvg);
  }
  return b64svg ? <img className={classes} src={`data:image/svg+xml;base64,${b64svg}`} alt="Icon" /> : null;
};

LoadableIcon.propTypes = {
  icon: PropTypes.string,
  classes: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string
};

const mapStateToProps = createPropsSelector({
  icons: getIcons
})

const mapDispatchToProps = {
  dispatchContent
}

export default connect(mapStateToProps, mapDispatchToProps)(LoadableIcon);