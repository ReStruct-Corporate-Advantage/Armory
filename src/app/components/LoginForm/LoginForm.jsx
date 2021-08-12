import React, {useState} from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {withRouter} from "react-router-dom";
import {createPropsSelector} from "reselect-immutable-helpers";
import {makeStyles} from "@material-ui/styles";
import { setLoggedIn, setUserRole } from "../../pages/Login/actions";
import {isLoggedIn} from "./../../global-selectors";
import {ButtonsPanel, InputField, SectionHeader} from "..";
import {AppBar, Box, Tab, Tabs} from "@material-ui/core";
import Network from "../../utils/network";
import Helper from "../../utils/Helper";
import { API_CONFIG } from "../../constants/api-config";
import "./LoginForm.component.scss";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={2}>
          {children}
        </Box>
      )}
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
}

const useStyles = makeStyles((theme) => ({
  root: {
    // flexGrow: 1,
    // backgroundColor: theme.palette.background.paper,
  },
}));


const LoginForm = props => {
  const {setLoggedIn, history} = props;
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [fieldValues, setFieldValues] = useState({loginform: {}, registerform: {}})
  const [loginApiMessage, setLoginApiMessage] = useState("");
  const [isLoginApiError, setLoginApiError] = useState(false);
  const [registerApiMessage, setRegisterApiMessage] = useState("");
  const [isRegisterApiError, setRegisterApiError] = useState(false);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const onChange = (formId, id, value) => {
    const fieldValuesCloned = {...fieldValues};
    fieldValuesCloned[formId][id] = value;
    setFieldValues(fieldValuesCloned);
  }

  const handleSubmit = (form) => {
    const formObj = fieldValues[form];
    Network.post(`http://${API_CONFIG.HOST.DEV}/api/auth/${form === "loginform" ? "login" : "register"}`, formObj)
      .then(res => {
        if (form === "loginform") {
          if (res.status === 200 && res.body.message === "Login Successful") {
            setLoggedIn(true);
            setLoginApiError(false);
            setLoginApiMessage("")
            res.body.access_token && Helper.setCookie("auth_session_token", res.body.access_token, 30);
            const username = res.body.user && res.body.user.username;
            res.body.access_token && Helper.setCookie("auth_session_token", res.body.access_token, 30);
            history.push(`/${username}`);
          } else if (res.body.error) {
            setLoginApiError(true);
            setLoginApiMessage(res.body.error)
          }
        } else {
          if (res.status === 200 && res.body.message && res.body.message.endsWith("please continue to login.")) {
            setRegisterApiError(false);
            setRegisterApiMessage(res.body.message)
            history.push("/login");
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
    <div className="c-LoginForm mx-auto row">
      {/* <TabPanel for login and register */}
      <div className={classes.root + " w-100 glass-panel"}>
        <AppBar position="static" className="darker-glass-panel">
          <Tabs value={value} onChange={handleChange} aria-label="simple tabs example" variant="fullWidth">
            <Tab label="Login" {...a11yProps(0)} />
            <Tab label="Register" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0} className="text-left">
          <SectionHeader title="Please enter your credentials to login" className="col-12" />
          <form className="fields-container col-12 mt-3">
            {loginApiMessage && <p className={`c-LoginForm__api-response-message sub-super-message${isLoginApiError ? " error" : ""}`}>{loginApiMessage}</p>}
            <InputField formId="loginform" id="username" label="User Name/Email" type="text" value={fieldValues["loginform"]["username"]} inputClasses="w-100 border-5 border-none px-2 py-3" required={true} onChange={onChange} />
            <InputField formId="loginform" id="password" label="Password" type="password" value={fieldValues["loginform"]["password"]} inputClasses="w-100 border-5 border-none px-2 py-3" required={true} onChange={onChange} />
            <ButtonsPanel formId="loginform" buttonsConfig={{btnSubmit: {type: "button", btnClasses: "btn btn-primary float-right", btnText: "Login", style: {background: "rgba(0, 150, 0, 0.7)"}, onClick: () => 
            {
              setLoginApiError(false);
              setLoginApiMessage("");
              handleSubmit("loginform", API_CONFIG)
            }}}}/>
          </form>
        </TabPanel>
        <TabPanel value={value} index={1} className="text-left">
          <SectionHeader title="Please enter following details to register" className="col-12" />
          <form className="fields-container col-12 mt-3">
            {registerApiMessage && <p className={`c-LoginForm__api-response-message sub-super-message${isRegisterApiError ? " error" : ""}`}>{registerApiMessage}</p>}
            <InputField formId="registerform" id="username" label="User Name/Email" type="text" value={fieldValues["registerform"]["username"]} inputClasses="border-5 border-none px-2 py-3" required={true} onChange={onChange} />
            <InputField formId="registerform" id="newpassword" label="New Password" type="password" value={fieldValues["registerform"]["newpassword"]} inputClasses="border-5 border-none px-2 py-3" required={true} onChange={onChange} />
            <InputField formId="registerform" id="confirmpassword" label="Confirm New Password" type="password" value={fieldValues["registerform"]["confirmpassword"]} inputClasses="border-5 border-none px-2 py-3" required={true} onChange={onChange} />
            <ButtonsPanel formId="registerform" buttonsConfig={
              {
                btnLogin: {
                  type: "button",
                  btnText: "< Back",
                  style: {background: "rgba(0, 0, 0, 0.7)", color: "white", marginRight: "1rem"},
                  onClick: (e) => handleChange(e, 0)
                },
                btnSubmit: {
                  type: "button",
                  btnText: "Register",
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LoginForm));