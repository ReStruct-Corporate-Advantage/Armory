import crypto from "crypto";
import dao from "../dao/user";

class Helper {
  static async validate(data, operation, users) {
    if (operation === "register") {
      return Helper.validateRegisterData(data);
    } else if (operation === "login") {
      return Helper.validateLoginData(data);
    } else if (operation === "unique") {
      return await Helper.validateUnique(data, users);
    }
  }

  static validateRegisterData(data) {
    if (!data || !data.username || !data.password || !data.email) {
      return false;
    }

    if (data.confirmpassword && data.password !== data.confirmpassword) {
      return false;
    }
    return true;
  }

  static async validateUnique(data, users) {
    if (users) {
      const index =
        users.findIndex((user) => user.username === data.username) < 0;
      return index;
    } else {
      return {usernameUnique: await dao.checkUserUnique({username: user.username}), emailUnique: await dao.checkUserUnique({email: user.email})};
    }
  }

  static encryptData(data) {
    data = Buffer.from(data, "utf-8");
    const base64 = data.toString("base64");
    const algorithm = "aes256";
    const key = global.keys.wbpprivatekey;
    const cipher = crypto.createCipher(algorithm, key);
    const encrypted = cipher.update(base64, "utf8", "hex") +
      cipher.final("hex");
    return encrypted;
  }

  static decryptData(data) {
    const algorithm = "aes256";
    const key = global.keys.wbpprivatekey;
    const decipher = crypto.createDecipher(algorithm, key);
    const decrypted =
      decipher.update(data, "hex", "utf8") + decipher.final("utf8");
    const buff = Buffer.from(decrypted, "base64");
    const descryptedData = buff.toString("utf-8");
    return descryptedData;
  }

  static filterEach(arr, filterKeys) {
    if (!arr || arr.length === 0 || !filterKeys || filterKeys.length === 0) {
      return arr;
    }
    return arr.map((item) => {
      item.items && (item.items = Helper.filterEach(item.items, filterKeys));
      return Helper.filterObject(item, filterKeys);
    });
  }

  static filterObject(obj, filterKeys) {
    if (!obj || !filterKeys || filterKeys.length === 0) return obj;
    const objClone = {...obj};
    filterKeys.forEach((key) => delete objClone[key]);
    return objClone;
  }
}

export default Helper;
