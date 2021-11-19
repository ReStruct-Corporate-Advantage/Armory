import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
// import {imgCache} from "../../utils/Cache/imageCache";
import Network from "../../utils/network";
import "./LoadableIcon.component.scss";

const parser = new DOMParser();

const LoadableIcon = props => {
  // const { classes, color, imgClass, size } = props;
  const { classes, color, size } = props;
  let { icon } = props;
  const iconRef = useRef();
  const [svg, setSvg] = useState();
  const iconParts = icon.split(".");
  const iconCategory = iconParts[0];
  const iconName = iconParts[1];
  // const iconKey = `${iconCategory}_${iconName}_${classes}_${size}_${color}`;
  icon = !icon || icon.indexOf(".") < 0 ? "gr.GrStatusPlaceholder" : icon;

  useEffect(() => {
      Network.getStatic(`/icon/${iconCategory}/${iconName}`)
        .then(res => setSvg(parser.parseFromString(res.body, "image/svg+xml").querySelector("svg")))
        .catch (e => console.log(e))
  }, [iconCategory, iconName]);

  svg && svg.setAttribute("height", size || "1rem");
  svg && svg.setAttribute("width", size || "1rem");
  svg && svg.setAttribute("class", classes || "");
  svg && (svg.style.color = color);
  iconRef.current && svg && iconRef.current.appendChild(svg);
  // imgCache.read(url);
  return <span ref={iconRef} />;
};

LoadableIcon.propTypes = {
  icon: PropTypes.string,
  classes: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string
};

export default LoadableIcon;