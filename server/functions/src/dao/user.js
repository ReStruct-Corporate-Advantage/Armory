import {User} from "../models/user.js";

class UserDAO {
  static async getAllUsers() {
    return await User.find();
  }

  static async findUserById(_id) {
    return await User.findOne({_id});
  }

  static async findUserByEmail(email) {
    return await User.findOne({email});
  }

  static async findUserByUserName(username) {
    return await User.findOne({username}).lean();
  }

  static async createUser(user) {
    user.role = user.role ? user.role : "developer";
    const persist_user = new User(user);
    return await persist_user.save();
  }

  static async checkUserUnique(user) {
    const userDetails = await User.findOne({username: user.username});
    return userDetails === null;
  }
}

export default UserDAO;
