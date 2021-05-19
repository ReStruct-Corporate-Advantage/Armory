import React from "react";
import useCanvas from "../../hooks/useCanvas";
import "./Canvas.component.scss";

const Canvas = props => {
  const { draw, options, ...rest } = props;
  const { context, ...moreConfig } = options;
  const canvasRef = useCanvas(draw, {context});

  return <canvas ref={canvasRef} className="c-Canvas" {...rest} />;
};

Canvas.propTypes = {

};

export default Canvas;