import React, {useState} from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import { useNavigate } from "react-router-dom";
import { setLoggedIn, setUserRole } from "../../pages/Login/actions";
import {isLoggedIn} from "../../global-selectors";
import {ButtonsPanel, InputField, SectionHeader, Tabs, Tab} from "..";
import Network from "../../utils/network";
import Helper from "../../utils/Helper";
import API_CONFIG from "../../constants/api-config";
import ENDPOINTS from "../../constants/endpoints";
import "./LoginForm.component.scss";

function TabPanel(props) {
  const { children, value, index, className, ...other } = props;

  return (
    <div
      className={`c-TabPanel${className ? " " + className : ""}`}
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

const LoginForm = props => {
  const {containerClasses, setLoggedIn, style} = props;
  const [tabValue, setTabValue] = React.useState(0);
  const [fieldValues, setFieldValues] = useState({loginform: {}, registerform: {}})
  const [loginApiMessage, setLoginApiMessage] = useState("");
  const [isLoginApiError, setLoginApiError] = useState(false);
  const [registerApiMessage, setRegisterApiMessage] = useState("");
  const [isRegisterApiError, setRegisterApiError] = useState(false);
  const navigate = useNavigate();

  const onChange = (formId, id, value) => {
    const fieldValuesCloned = {...fieldValues};
    fieldValuesCloned[formId][id] = value;
    setFieldValues(fieldValuesCloned);
  }

  const handleSubmit = (form) => {
    const formObj = fieldValues[form];
    Network.post(form === "loginform" ? ENDPOINTS.BE.AUTH.LOGIN : ENDPOINTS.BE.AUTH.REGISTER, formObj)
      .then(res => {
        if (form === "loginform") {
          if (res.status === 200 && res.body.message === "Login Successful") {
            setLoggedIn(true);
            setLoginApiError(false);
            setLoginApiMessage("")
            res.body.access_token && Helper.setCookie("auth_session_token", res.body.access_token, 30);
            const username = res.body.user && res.body.user.username;
            res.body.user && Helper.setCookie("auth_session_user", res.body.user.username, 30);
            navigate(`/${username}`, {replace: true});
          } else if (res.body.error) {
            setLoginApiError(true);
            setLoginApiMessage(res.body.error)
          }
        } else {
          if (res.status === 200 && res.body.message && res.body.message.endsWith("please continue to login.")) {
            setRegisterApiError(false);
            setRegisterApiMessage(res.body.message)
            navigate("login", {replace: true});
          } else if (res.body.error) {
            setRegisterApiError(true);
            setRegisterApiMessage(res.body.error)
          }
        }
      })
      .catch(e => {
        console.log(e)
        if (e.error) {
          if (form === "loginform") {
            setLoginApiError(true);
            setLoginApiMessage(e.error)
          } else {
            setRegisterApiError(true);
            setRegisterApiMessage(e.error)
          }
        }
      });
  }

  return (
    <div className={`c-LoginForm${containerClasses ? " " + containerClasses : ""}`} style={style || {}}>
      {/* <TabPanel for login and register */}
      <div className="w-100 h-100 border-small-radius overflow-hidden d-flex flex-column">
        <Tabs value={tabValue} onChange={setTabValue} aria-label="simple tabs example" variant="fullWidth">
          <Tab label="Login" {...a11yProps(0)} />
          <Tab label="Register" {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={tabValue} index={0} className="text-start flex-grow-1">
          <SectionHeader title="Please enter your credentials to login" className="col-12 font-size-12" />
          <form className="fields-container col-12 mt-3 p-3">
            {loginApiMessage && <p className={`c-LoginForm__api-response-message sub-super-message${isLoginApiError ? " error" : ""}`}>{loginApiMessage}</p>}
            <InputField formId="loginform" id="username" label="User Name/Email" type="text" value={fieldValues["loginform"]["username"]} layoutClasses="mb-5" inputClasses="w-100 border-5 border-none px-2 py-3" required={true} onChange={onChange} shrunkable />
            <InputField formId="loginform" id="password" label="Password" type="password" value={fieldValues["loginform"]["password"]} inputClasses="w-100 border-5 border-none px-2 py-3" required={true} onChange={onChange} shrunkable />
            <ButtonsPanel formId="loginform" buttonsConfig={
              {btnSubmit: 
                {type: "button", classes: "btn btn-success float-right raise-effect", displayValue: "Login", style: {background: "rgba(0, 150, 0, 0.7)"}, onClick: () => 
                  {
                    setLoginApiError(false);
                    setLoginApiMessage("");
                    handleSubmit("loginform", API_CONFIG)
                  }}}}/>
          </form>
        </TabPanel>
        <TabPanel value={tabValue} index={1} className="text-start">
          <SectionHeader title="Please enter following details to register" className="col-12 font-size-12" />
          <form className="fields-container col-12 mt-3 p-3">
            {registerApiMessage && <p className={`c-LoginForm__api-response-message sub-super-message${isRegisterApiError ? " error" : ""}`}>{registerApiMessage}</p>}
            <InputField formId="registerform" id="username" label="User Name/Email" type="text" value={fieldValues["registerform"]["username"]} layoutClasses="mb-5" inputClasses="w-100 border-5 border-none px-2 py-3" required={true} onChange={onChange} shrunkable />
            <InputField formId="registerform" id="newpassword" label="New Password" type="password" value={fieldValues["registerform"]["newpassword"]} layoutClasses="mb-5" inputClasses="w-100 border-5 border-none px-2 py-3" required={true} onChange={onChange} shrunkable />
            <InputField formId="registerform" id="confirmpassword" label="Confirm New Password" type="password" value={fieldValues["registerform"]["confirmpassword"]} inputClasses="w-100 border-5 border-none px-2 py-3" required={true} onChange={onChange} shrunkable />
            <ButtonsPanel formId="registerform" buttonsConfig={
              {
                btnLogin: {
                  type: "button",
                  classes: "btn btn-success raise-effect",
                  displayValue: "< Back",
                  style: {background: "rgba(0, 0, 0, 0.7)", color: "white", marginRight: "1rem"},
                  onClick: () => setTabValue(0)
                },
                btnSubmit: {
                  type: "button",
                  classes: "btn btn-success raise-effect",
                  displayValue: "Register",
                  style: {background: "rgba(0, 150, 0, 0.7)"},
                  onClick: () => {
                    setRegisterApiError(false);
                    setRegisterApiMessage("");
                    handleSubmit("registerform", API_CONFIG);
                  }
                }
              }
            }/>
          </form>
        </TabPanel>
      </div>
    </div>
  );
};

LoginForm.propTypes = {
  setLoggedIn: PropTypes.func
};

const mapStateToProps = createPropsSelector({
  isLoggedIn
})

const mapDispatchToProps = {
  setLoggedIn,
  setUserRole
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);