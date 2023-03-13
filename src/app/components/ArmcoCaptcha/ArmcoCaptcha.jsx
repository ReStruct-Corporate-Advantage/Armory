import React from "react";
import PropTypes from "prop-types";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Network } from "../../utils";
import "./ArmcoCaptcha.component.scss";

const ArmcoCaptcha = props => {
  const {
    id,
    recaptchaRef,
    style
  } = props;

  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const onVerify = async callback => {
    if (executeRecaptcha && typeof executeRecaptcha === "function") {
      const gRecaptchaToken = await executeRecaptcha('register');
      const result = await Network.post("/auth/captchaVerify", {gRecaptchaToken});
      if (result && result.body && result.body.raw.success) {
        callback && callback();
      }
    }
  };

  return <button id={id} className="c-ArmcoCaptcha mt-4 w-100" style={style} ref={recaptchaRef} type="button" onClick={onVerify}>
    <span className="c-ArmcoCaptcha__transition-text">Jump In</span>
  </button>;
};

ArmcoCaptcha.propTypes = {
  id: PropTypes.string,
  placeholderCaptcha: PropTypes.string,
  recaptchaRef: PropTypes.object,
  style: PropTypes.object
};

export default ArmcoCaptcha;