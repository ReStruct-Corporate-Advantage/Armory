const ONBOARDER_CONFIG = (isEmail, isStrongPassword) => ({
  email: {
    component: "InputField",
    display: true,
    id: "email",
    variant: "fillAndSubmit",
    inputClasses: "w-100 py-2 border-5",
    buttonClasses: "hide fw-bold py-1 w-30 float-end onboard border-5 background-none",
    buttonText: "Continue",
    buttonDisabled: true,
    placeholder: "Email address",
    setError: "Please provide a valid email!",
    validator: isEmail,
    next: "password",
    autoFocus: true
  },
  password: {
    component: "InputField",
    autoComplete: "new-password",
    id: "password",
    type: "password",
    variant: "fillAndSubmit",
    layoutClasses: "fancy",
    inputClasses: "w-65 background-none onboard py-2 border-bottom",
    buttonClasses: "fw-bold py-1 w-30 float-end onboard border-5 background-none",
    buttonText: "Continue",
    buttonDisabled: true,
    placeholder: "Password",
    setError: "Password isn't strong enough!",
    next: "username",
    validator: s => isStrongPassword(s, {returnScore: true})
  },
  username: {
    component: "InputField",
    id: "username",
    type: "text",
    variant: "fillAndSubmit",
    layoutClasses: "fancy",
    inputClasses: "w-65 background-none onboard py-2 border-bottom",
    buttonClasses: "fw-bold py-1 w-30 float-end onboard border-5 background-none",
    buttonText: "Continue",
    buttonDisabled: true,
    next: "captcha",
    placeholder: "User Name"
  },
  captcha: {
    component: "ArmcoCaptcha",
    id: "captcha",
    placeholderCaptcha: "inline-captcha"
  }
});

export default ONBOARDER_CONFIG;