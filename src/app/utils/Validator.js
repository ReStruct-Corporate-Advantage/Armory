import Helper from "./Helper";

class Validator {
  static validate(value, parentRef) {
    const { validators } = this.props;
    let errorMsg;
    validators &&
      Object.keys(validators).every((validation) => {
        errorMsg = Validator[validation](
          value,
          validators[validation],
          parentRef
        );
        this.setState({ error: errorMsg });
        return !errorMsg;
      });
    return errorMsg;
  }

  static validateRequired(value, validationObj) {
    const formFieldValue = value;
    if (validationObj && formFieldValue === "") {
      return validationObj.error;
    } else {
      return "";
    }
  }

  static validateLength(value, validationObj) {
    value = value ? value.trim() : "";
    const length = value.length;
    if (
      (validationObj &&
        validationObj.minLength &&
        length < validationObj.minLength) ||
      (validationObj.maxLength && length > validationObj.maxLength)
    ) {
      return validationObj.error;
    } else {
      return "";
    }
  }

  static validateRegex(value, validationObj, parentRef, regexSelector) {
    const formFieldValue = value.trim();
    if (validationObj) {
      const formFieldRegexString =
        validationObj.dataRuleRegex &&
        (validationObj.dataRuleRegex[regexSelector]
          ? validationObj.dataRuleRegex[regexSelector]
          : validationObj.dataRuleRegex);
      const formFieldRegex = new RegExp(formFieldRegexString);
      const compliesRegex = formFieldRegex.test(formFieldValue);
      if (!compliesRegex) {
        return validationObj.error;
      } else {
        return "";
      }
    } else {
      return "";
    }
  }

  static validateDate(value, validationObj) {
    const formFieldValue = value;
    if (validationObj) {
      const month = +formFieldValue.substring(0, formFieldValue.indexOf("/"));
      const year = +formFieldValue.substring(formFieldValue.indexOf("/") + 1);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      if (year > 2032 || month > 12 || month < 1) {
        return validationObj.error;
      }
      if (
        year < currentYear ||
        (year === currentYear && month < currentMonth + 1)
      ) {
        return validationObj.error;
      } else {
        return "";
      }
    } else {
      return "";
    }
  }

  static validatePasswordMatch(value, validationObj, parentRef) {
    const form = parentRef.state.form;
    const sibling = Helper.search(validationObj.siblingField, parentRef);
    if (sibling && sibling.isDirty) {
      form.passwordsDifferent = value !== sibling.value;
      parentRef.setState({ form });
    }
  }
}

export default Validator;
