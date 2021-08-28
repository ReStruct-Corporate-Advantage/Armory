export default class ArmoryError {
    status;
    error;
    message;
    code;
  
    constructor (status, error, message, code) {
      this.status = status;
      this.error = error;
      this.message = message;
      this.code = code;
    }
}