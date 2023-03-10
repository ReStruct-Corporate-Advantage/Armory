import basicInfo from "./basicInfo.js";
import servers from "./servers.js";
import components from "./components.js";
import tags from "./tags.js";
import paths from "./paths/index.js";


const exportVal = {
  swaggerDefinition: {
    ...basicInfo,
    servers,
    components,
    tags,
    paths,
  },
  apis: ["./src/routes/*.js"],
};

export default exportVal;
