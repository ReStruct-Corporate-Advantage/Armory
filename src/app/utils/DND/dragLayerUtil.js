import { DNDUtil } from "./dndUtil";

class DragLayerUtil {
  static getTranslateCoordinates(args, scrolledBy) {
    const {
      initialOffset,
      initialClientOffset,
      clientOffset,
      clientRect,
      layout,
      isSnapToGrid,
      isInstanceComponent,
    } = args;
    let {x, y} = clientOffset;
    let { left: clientRectX, top: clientRectY } = clientRect;
    clientRectX += DNDUtil.remsize;
    clientRectY += DNDUtil.remsize;
    if (!isInstanceComponent) {
      if (isSnapToGrid) {
        // x and y is the cursor position in window, below we calculate cursor position w.r.t. component container
        // We subtract before and add back container offsets after snapping as we want snapping w.r.t. component container,
        // without this snapping occurrs w.r.t. window left and top causing an error of 0 to current set grid cell dimensions (default 30 px)
        x -= clientRectX;
        y -= clientRectY;
        // Snap and update x and y distances
        [x, y] = DNDUtil.snapToGrid(x, y, layout, !isInstanceComponent);
        // Add back component container offsets
        x += clientRectX;
        y += clientRectY;
      }
    } else {
      // Difference of cursor from element left and top
      const xDiff = initialClientOffset.x - initialOffset.x;
      const yDiff = initialClientOffset.y - initialOffset.y;
      // Capture the difference moved by cursor
      const xDrag = clientOffset.x - initialClientOffset.x;
      const yDrag = clientOffset.y - initialClientOffset.y;
      [x, y] = isSnapToGrid
        ? DNDUtil.snapToGrid(xDrag, yDrag, layout, true)
        : [xDrag, yDrag];
      x += clientRectX;
      y += clientRectY;

      if (scrolledBy) {
        x -= scrolledBy.left;
        y -= scrolledBy.top;
      }
    }
    // console.log("drag x: ", x);
    // console.log("drag y: ", y);
    return [x, y];
  }

  static getItemStyles(args, setDropLocation, scrolledBy) {
    const { clientOffset, clientRect } = args;
    if (!DNDUtil.hoverInPrimaryContainer(clientRect, clientOffset)) {
      return {
        display: "none",
      };
    }
    const [x, y] = DragLayerUtil.getTranslateCoordinates(args, scrolledBy);
    setDropLocation([x, y]);
    const transform = `translate(${x}px, ${y}px)`;
    const opacity = "0.4";
    return {
        opacity,
        transform,
        WebkitTransform: transform
    };
  }
}

export default DragLayerUtil;
