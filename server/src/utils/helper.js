import crypto from "crypto";

class Helper {
    static validate (data, operation, users) {
        if (operation === "register") {
            return Helper.validateRegisterData(data);
        } else if (operation === "login") {
            return Helper.validateLoginData (data);
        } else if (operation === "unique") {
            return Helper.validateUnique (data, users)
        }
    }

    static validateRegisterData (data) {
        if (!data || !data.username || !data.newpassword || !data.confirmpassword) {
            return false;
        }

        if (data.newpassword !== data.confirmpassword) {
            return false;
        }
        return true;
    }

    static validateUnique (data, users) {
        const index = users.findIndex(user => user.username === data.username) < 0;
        return index;
    }

    static encryptData(data) {  
        data =  Buffer.from(data, 'utf-8')
        const base64 = data.toString('base64');
        var algorithm = 'aes256'; 
        var key = global.keys.wbpprivatekey;
        var cipher = crypto.createCipher(algorithm, key);  
        var encrypted = cipher.update(base64, 'utf8', 'hex') + cipher.final('hex');
        return encrypted;
    }

    static decryptData(data) {
        var algorithm = 'aes256';
        var key = global.keys.wbpprivatekey;
        var decipher = crypto.createDecipher(algorithm, key);
        var decrypted = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
        const buff = Buffer.from(decrypted, 'base64');
        const descryptedData = buff.toString('utf-8');
        return descryptedData;
    }

    static filterObject(obj, filterKeys) {
        if (!obj || !filterKeys || !filterKeys.length > 0)
            return obj;
        const objClone = {...obj};
        filterKeys.forEach(key => delete objClone[key]);
        return objClone;
    }
}

export default Helper;