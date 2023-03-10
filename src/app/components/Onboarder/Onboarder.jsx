import React, { createRef, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { isEmail, isStrongPassword } from "validator";
import * as components from "..";
import { Helper } from "../../utils";
import ONBOARDER_CONFIG from "../../config/onboarderConfig";
import { CAPTCHA_SITE_KEY, ENTER_KEY_CODE } from "../../constants";
import "./Onboarder.component.scss";

const iConfig = ONBOARDER_CONFIG(isEmail, isStrongPassword);

const Onboarder = (props) => {
  const { classes, contentRef, isVisible } = props;
  const refs = useRef({});
  const [animate, initiateOnboarding] = useState();
  const [focussedInput, setFocussedInput] = useState(iConfig.email.id);
  const [formComponents, setFormComponents] = useState(iConfig);
  useEffect(() => {
    if (isVisible && formComponents) {
      const initialConfig = formComponents.email;
      initialConfig.inputClasses =
        initialConfig.inputClasses
          .replace("w-100", "")
          .replace("border-5", "") +
        " w-65 background-none onboard border-bottom";
      initialConfig.layoutClasses = initialConfig.layoutClasses
        ? initialConfig.layoutClasses + " fancy"
        : "fancy";
      initialConfig.buttonClasses = initialConfig.buttonClasses.replace(
        "hide",
        ""
      );
      setFormComponents(formComponents);
      initiateOnboarding(true);
    }
  }, [isVisible]);

  const updateLayoutClasses = (props, display) => {
    props.layoutClasses = props.layoutClasses
      ? props.layoutClasses +
        (display
          ? props.layoutClasses.indexOf("mt-4") === -1
            ? " mt-4"
            : ""
          : props.layoutClasses.indexOf("mt-0") === -1
          ? " mt-0"
          : "")
      : display
      ? "mt-4"
      : "mt-0";
  };

  const injectHandlers = (props, validator) => {
    props.onFocus = () => setFocussedInput(props.id);
    props.onChange = Helper.debounce((formId, id, value) => {
      const formComponentsClone = { ...formComponents };
      const currentComponent =
        formComponentsClone[id.substring(id.indexOf("-") + 1)];
      if (currentComponent.value !== value) {
        currentComponent.value = value;
        const result = validator && validator(value);
        let error;
        if (result !== undefined) {
          if (typeof result === "boolean") {
            error = result ? "" : props.setError;
          } else if (typeof result === "number") {
            error = result > 40 ? "" : props.setError;
          }
        } else {
          error = "";
        }

        currentComponent.error = error;
        currentComponent.buttonDisabled = !!error;
        setFormComponents(formComponentsClone);
      }
    }, 500);
    props.submitOnClick = (e, ref) => {
      const formComponentsClone = { ...formComponents };
      const clickedElement = formComponentsClone[ref.current.id];
      if (clickedElement && !clickedElement.buttonDisabled) {
        const nextElement = formComponentsClone[clickedElement.next];
        const nextRef = refs.current[nextElement.id];
        nextRef.current && nextRef.current.focus && nextRef.current.focus();
        nextElement.display = true;
        setFocussedInput(nextElement.id);
        setFormComponents(formComponentsClone);
      }
    };
    props.onKeyUp = (e, ref) =>
      ("which" in e ? e.which : e.keyCode) === ENTER_KEY_CODE &&
      props.submitOnClick(e, ref);
  };

  const injectRefs = (props) => {
    const isCaptcha = props.id === "captcha";
    let objRef = refs.current[props.id];
    if (!objRef) {
      objRef = createRef();
      refs.current[props.id] = objRef;
    }
    if (isCaptcha) {
      props.recaptchaRef = objRef;
    } else {
      let buttonRef = refs.current["button_" + props.id];
      if (!buttonRef) {
        buttonRef = createRef();
        refs.current["button_" + props.id] = buttonRef;
      }
      props.inputRef = objRef;
      props.buttonRef = buttonRef;
    }
  };

  const handleButtonVisibility = (props) => {
    if (props.id === focussedInput) {
      if (
        props.buttonClasses &&
        props.buttonClasses.indexOf("visible") === -1
      ) {
        props.buttonClasses += " visible";
      }
    } else {
      if (props.buttonClasses && props.buttonClasses.indexOf("visible") > -1) {
        props.buttonClasses = props.buttonClasses.replace("visible", "");
      }
    }
  };

  const itemRenders =
    formComponents &&
    Object.values(formComponents).map((obj, key) => {
      obj.style = { maxHeight: obj.display ? "5rem" : 0, overflow: "auto" };
      const { component, display, validator, ...props } = obj;
      updateLayoutClasses(props, display);
      injectHandlers(props, validator);
      handleButtonVisibility(props);
      injectRefs(props);
      const propsClone = { ...props };
      delete propsClone.value;
      const Component = components[component];
      return (
        <Component
          formId="armco_onboarder"
          key={"armco_onboarder-" + obj.id + "-" + key}
          {...propsClone}
        />
      );
    });

  const error =
    formComponents[focussedInput] && formComponents[focussedInput].error;

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={CAPTCHA_SITE_KEY}
      container={{
        element: "inline-captcha",
        parameters: {
          theme: "dark"
        }
      }}
      useEnterprise={true}>
      <div
        className={`c-Onboarder${classes ? " " + classes : ""}${
          animate ? " animate" : ""
        }`}
      >
        <div className="c-Onboarder__content m-4 p-4" ref={contentRef}>
          <header className="c-Onboarder__header">
            <span className="d-block">One step closer to awesomeness!</span>
            <span className="d-block">Let's kickstart.</span>
          </header>
          <form className="c-Onboarder__input-container">{itemRenders}</form>
        </div>
        {error && <div className="c-Onboarder__error ms-4">{error}</div>}
      </div>
    </GoogleReCaptchaProvider>
  );
};

Onboarder.propTypes = {
  classes: PropTypes.string,
  contentRef: PropTypes.object,
  isVisible: PropTypes.bool,
};

export default Onboarder;
