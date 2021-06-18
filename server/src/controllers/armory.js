import {readFile} from "fs";
import Helper from "../utils/helper.js";
import userDao from "./../dao/user.js";
import dao from "./../dao/armory.js";

class ArmoryController {

    getArms (req, res) {
        const user_details = req.decoded;
        try {
            userDao.findUserByUserName(user_details.username)
            .then (userObj => {
                if (!userObj) {
                    return res.status(404).json({message: "User not found!"});
                }
                dao.getArmsCategories()
                    .then (categories => {
                        if (!categories) {
                            return res.status(404).json({message: "No arms available in your repository!", error: true, code: "ERR_DB_OR_QUERY_FAILURE"});
                        }
                        const categoryPromises = [];
                        const subCategories = [];
                        categories && categories.forEach(category => {
                            category.items && categoryPromises.push(dao.populateArmaments(category, userObj))
                        });
                        Promise.all(categoryPromises).then(categories => {
                            categories && categories.forEach(category => {
                                if (category.armamentCategory) {
                                    const parentObj = categories.find(categoryInner => {
                                        return String(category.armamentCategory) === String(categoryInner._id)
                                    });
                                    if (parentObj) {
                                        const itemIndex = parentObj.items && parentObj.items.findIndex(item => String(item._id) === String(category._id));
                                        parentObj.items && (parentObj.items[itemIndex]= category);
                                        subCategories.push(categories.indexOf(category));
                                    }
                                }
                            });
                            subCategories.sort((a, b) => a - b);
                            for (let i = subCategories.length - 1; i >= 0; i--) {
                                categories.splice(subCategories[i], 1)
                            }
                            const responseObj = Helper.filterEach(categories, ["_id", "__v", "leafCategory"]);
                            return res.status(200).json(responseObj);
                        })
                    })
                    .catch (e => res.status(500).json({message: "Unable to fetch list of armaments at the moment, please try back in sometime or use the Contact Us option to report!"}))
            });
        } catch (e) {
            console.error(e);
            res.status(520).json({error: `An unknown error occurred while trying to get list of armament for ${user_details.username}`})
        }
    }

    setArmaments (req, res) {
        const user_details = req.decoded;
        readFile("./src/data/armory.json", "utf8", function(err, data) {
            if (err) {
                return res.json(err);
            }
            const arms = JSON.parse(data).types;
            arms && dao.bulkInsert(arms, user_details.username);
            return res.json({success: true}).status(200)
        });
    }

    updateArmament (req, res) {
        const user_details = req.decoded;
        try {
            userDao.findUserByUserName(user_details.username)
            .then (userObj => {
                if (!userObj) {
                    return res.status(404).json({message: "User not found!"});
                }
                const armament = req.body;
                dao.findArmamentByName(armament.componentName)
                    .then(doc => {
                        doc.meta = armament.meta;
                        doc.descriptor = armament.descriptor;
                        doc.displayName = armament.displayName;
                        dao.updateArmament(doc)
                            .then((res_db, err) => {
                                if (err || !res_db) {
                                    return res.status(404).json({message: "Object to update not found!"});
                                }
                                return res.status(200).json(res_db);
                            })
                    });
            })
        } catch (e) {
            console.error(e);
            res.status(520).json({error: `An unknown error occurred while trying to get list of armament for ${user_details.username}`})
        }
    }
}

export default ArmoryController;