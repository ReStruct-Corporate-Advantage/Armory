import {readFile} from "fs";
// import {generateImage} from "component-image";

class ArmoryController {

    getArms (req, res) {
        readFile("./data/armory.json", "utf8", function(err, data) {
            if (err) {
                // console.log(err)
                return res.json(err);
            }
            // console.log(data)
            return res.json(data)
        });
    }
}

export default ArmoryController;