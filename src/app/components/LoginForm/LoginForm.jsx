import React, {useState} from "react";
import PropTypes from "prop-types";
import { connect, useDispatch } from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import { Link, useNavigate } from "react-router-dom";
import { setLoggedIn, setUserRole } from "../../pages/Login/actions";
import {isLoggedIn} from "../../global-selectors";
import {ButtonsPanel, InputField, SectionHeader, CheckBox} from "..";
import Network from "../../utils/network";
import Helper from "../../utils/Helper";
import ENDPOINTS from "../../constants/endpoints";
import "./LoginForm.component.scss";

const LoginForm = props => {
  const {containerClasses, setLoggedIn, style} = props;
  const [fieldValues, setFieldValues] = useState({})
  const [loginApiMessage, setLoginApiMessage] = useState("");
  const [isLoginApiError, setLoginApiError] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onChange = (formId, id, value) => {
    const fieldValuesCloned = {...fieldValues};
    fieldValuesCloned[id] = value;
    setFieldValues(fieldValuesCloned);
  }

  const handleSubmit = () => {
    Network.post(ENDPOINTS.BE.AUTH.LOGIN, fieldValues)
      .then(res => {
        if (res.status === 200 && res.body.message === "Login Successful") {
          setLoggedIn(true);
          setLoginApiError(false);
          setLoginApiMessage("")
          res.body.access_token && Helper.setCookie("auth_session_token", res.body.access_token, 30);
          const username = res.body.user && res.body.user.username;
          res.body.user && Helper.setCookie("auth_session_user", res.body.user.username, 30);
          navigate(`/${username}`);
        } else if (res.body.error) {
          setLoginApiError(true);
          setLoginApiMessage(res.body.error)
        }
      })
      .catch(e => {
        console.log(e)
        if (e.error) {
          setLoginApiError(true);
          setLoginApiMessage(e.error);
        }
      });
  }

  return (
    <div className={`c-LoginForm mx-auto${containerClasses ? " " + containerClasses : ""}`} style={style || {}}>
      <SectionHeader title="Dive into Armco" className="background-none text-center h3 border-none mb-5" />
      <div className="c-LoginForm__layout-provider border-grey dark-glass-panel border-small-radius overflow-hidden d-flex flex-column mb-3">
          <form className="fields-container col-12 mt-3 p-3" onSubmit={e => {
            e.preventDefault();
            setLoginApiError(false);
            setLoginApiMessage("");
            handleSubmit()
          }}>
            {loginApiMessage && <p className={`c-LoginForm__api-response-message sub-super-message${isLoginApiError ? " error" : ""}`}>{loginApiMessage}</p>}
            <InputField id="username" label="User Name/Email" type="text" value={fieldValues["username"]} layoutClasses="mb-3"
              inputClasses="w-100 border-5 p-2 bg-black text-light border-grey" required={true} onChange={onChange} variant="standard" shrunkable />
            <InputField id="password" label="Password" type="password" value={fieldValues["password"]}
              inputClasses="w-100 border-5 p-2 bg-black text-light border-grey" required={true} onChange={onChange} variant="standard" shrunkable />
            <ButtonsPanel buttonsConfig={{
              btnSubmit: {type: "submit", classes: "btn btn-success float-right raise-effect w-100 fw-bold", displayValue: "Sign in", style: {background: "rgba(0, 150, 0, 0.7)"}}
            }} />
            <CheckBox id="rememberme" label="Remember me" value={fieldValues["rememberme"]} layoutClasses="mb-3"
              inputClasses="me-2 p-2 text-light" onChange={onChange} />
            <Link className="mt-4 fw-bold" to="/reset">Forgot password?</Link>
          </form>
      </div>
      <div className="c-LoginForm__sign-up-prompt border-grey darker-glass-panel border-small-radius text-center p-4">
            New to Armco?
            <Link className="ms-3" to="/join">Create an account</Link>
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