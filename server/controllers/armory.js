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

    // TODO generate component snapshot
    // getImage (req, res) {
    //     const image = generateImage(<InputField />, {
    //         viewport: {
    //           width: 100,
    //           height: 100
    //         }
    //     })
    //     console.log(image);
    //     return "test";
    // }
}

export default ArmoryController;