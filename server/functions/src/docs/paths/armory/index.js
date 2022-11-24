import get from "./get.js";
import put from "./put.js";

const ARMORY_API_DEFINITION = {
  "/armory": {
    ...get,
    ...put,
  },
};
export default ARMORY_API_DEFINITION;
