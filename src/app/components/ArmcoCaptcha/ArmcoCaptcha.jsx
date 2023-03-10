import React from "react";
import PropTypes from "prop-types";
import { withGoogleReCaptcha } from "react-google-recaptcha-v3";
import { Network } from "../../utils";
import "./ArmcoCaptcha.component.scss";

const ArmcoCaptcha = props => {
  const {
    id,
    placeholderCaptcha,
    recaptchaRef,
    style
  } = props;
  
  const onVerify = async () => {
    if (props.googleReCaptchaProps.executeRecaptcha && typeof props.googleReCaptchaProps.executeRecaptcha === "function") {
      const gRecaptchaToken = await props.googleReCaptchaProps.executeRecaptcha('register');
      Network.post("/auth/captchaVerify", {gRecaptchaToken});
    }
  };

  return (
    <div id={id} className="c-ArmcoCaptcha" style={style} ref={recaptchaRef}>
      <div id={placeholderCaptcha} />
      <button type="button" onClick={onVerify}>Verify</button>
    </div>
  );
};

ArmcoCaptcha.propTypes = {
  id: PropTypes.string,
  placeholderCaptcha: PropTypes.string,
  recaptchaRef: PropTypes.object,
  style: PropTypes.object
};

export default withGoogleReCaptcha(ArmcoCaptcha);