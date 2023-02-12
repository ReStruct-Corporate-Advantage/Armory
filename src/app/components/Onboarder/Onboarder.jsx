import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import InputField from "../form-components/InputField";
import "./Onboarder.component.scss";

const iConfig = [
  {
    display: true,
    variant: "fillAndSubmit",
    inputClasses: "w-100 py-2 border-5",
    buttonClasses: "hide fw-bold py-1 w-30 float-end onboard border-5 background-none disabled",
    buttonText: "Continue",
    placeholder: "Email address"
  },
  {
    variant: "fillAndSubmit",
    layoutClasses: "fancy",
    inputClasses: "w-65 background-none onboard py-2 border-bottom",
    buttonClasses: "fw-bold py-1 w-30 float-end onboard border-5 background-none",
    buttonText: "Continue",
    placeholder: "Password"
  },
  {
    variant: "fillAndSubmit",
    layoutClasses: "fancy",
    inputClasses: "w-65 background-none onboard py-2 border-bottom",
    buttonClasses: "fw-bold py-1 w-30 float-end onboard border-5 background-none",
    buttonText: "Continue",
    placeholder: "User Name"
  }
];
const Onboarder = props => {
  const {classes, contentRef, isVisible} = props;
  const [animate, initiateOnboarding] = useState();
  iConfig.forEach(config => config.submitOnClick = () => {
    const inputsClone = [...inputs];
    inputsClone.find(input => !input.display).display = true;
    setInputs(inputsClone);
  });
  const [inputs, setInputs] = useState(iConfig);
  useEffect(() => {
    if (isVisible && inputs) {
      const initialConfig = inputs[0];
      initialConfig.inputClasses = initialConfig.inputClasses.replace("w-100", "").replace("border-5", "") + " w-65 background-none onboard border-bottom";
      initialConfig.layoutClasses = initialConfig.layoutClasses ? initialConfig.layoutClasses + " fancy" : "fancy";
      initialConfig.buttonClasses = initialConfig.buttonClasses.replace("hide", "");
      setInputs(inputs);
      initiateOnboarding(true);
    }
  }, [isVisible]);
  const inputRenders = inputs && inputs.map((input, key) => {
    input.style = {height: input.display ? "auto" : 0, overflow: "auto"};
    input.layoutClasses = input.layoutClasses + (input.display ? " mt-4" : " mt-0");
    return <InputField key={key} {...input} />
  });
  return (
    <div className={`c-Onboarder${classes ? " " + classes : ""}${animate ? " animate" : ""}`}>
      <div className="c-Onboarder__content m-4 p-4" ref={contentRef}>
        <header className="c-Onboarder__header">
          <span className="d-block">One step closer to awesomeness!</span>
          <span className="d-block">Let's kickstart.</span>
        </header>
        <div className="c-Onboarder__input-container">
          {inputRenders}
        </div>
      </div>
      <div className="c-Onboarder__error ms-4">
        Please enter a valid email ID!
      </div>
    </div>
  );
};

Onboarder.propTypes = {

};

export default Onboarder;