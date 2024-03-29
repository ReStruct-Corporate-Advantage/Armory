import {
  armory,
  auth,
  user,
  nlp,
  project,
  page,
  component,
} from "../routes/index.js";
import armoryData from "../data/armory.json" assert {type: "json"};

function injectRouteMW(app) {
  app.get("/test", (req, res) => {
    res.send(armoryData);
  });

  app.get("/", (req, res) => {
    res.send("Hello User!");
  });
  app.use("/api/armory", armory);
  app.use("/api/auth", auth);
  app.use("/api/user", user);
  app.use("/api/nlp", nlp);
  app.use("/api/project", project);
  app.use("/api/page", page);
  app.use("/api/component", component); // restructure /api/armory to return only armory list without descriptors
}

export default injectRouteMW;
