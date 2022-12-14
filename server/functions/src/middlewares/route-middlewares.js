import {
  armory,
  auth,
  user,
  nlp,
  project,
  page,
  component,
} from "../routes/index.js";
import armoryData from "../data/armory.json";

function injectRouteMW(app) {
  app.get("/test", (req, res) => {
    res.send(armoryData);
  });

  app.get("/", (req, res) => {
    res.send("Hello User!");
  });
  app.use("/armory", armory);
  app.use("/auth", auth);
  app.use("/user", user);
  app.use("/nlp", nlp);
  app.use("/project", project);
  app.use("/page", page);
  app.use("/component", component); // restructure /api/armory to return only armory list without descriptors
}

export default injectRouteMW;
