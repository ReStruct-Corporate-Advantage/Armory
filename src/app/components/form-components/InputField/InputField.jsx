import React, { memo, useRef, useState } from "react";
import PropTypes from "prop-types";
import EVENTS from "../../../utils/eventHandlers";
import "./InputField.component.scss";

const InputField = memo((props) => {
  const {
    alwaysDisabled,
    autoComplete,
    autoFocus,
    buttonClasses,
    buttonDisabled,
    buttonRef,
    buttonText,
    formId,
    id,
    inputClasses,
    inputRef,
    inputStyles,
    label,
    labelClasses,
    labelStyles,
    layoutClasses,
    min,
    max,
    onBlur,
    onClick,
    onChange,
    onFocus,
    onKeyUp,
    placeholder,
    readOnly,
    containerRef,
    required,
    style,
    submitOnClick,
    type,
    value,
    variant,
  } = props;
  const inputRefInternal = useRef();
  const key = formId ? formId + "-" + id : id;
  const [focussed, setFocussed] = useState(false);
  let variantRender;
  const iRef = inputRef || inputRefInternal;

  switch (variant) {
    case "fillAndSubmit":
      variantRender = <div
        className={`c-InputField row${layoutClasses ? " " + layoutClasses : ""}${" " + variant}`}
        onClick={onClick ? onClick : () => {}}
        style={style}
        ref={containerRef}
      >
        <div className="col-12 position-relative h-100">
          <input
            id={id}
            key={key}
            type={type}
            className={`px-3${inputClasses ? " " + inputClasses : ""}`}
            style={inputStyles}
            autoComplete={autoComplete || id}
            onKeyUp={e => onKeyUp(e, inputRef) || (() => {})}
            onChange={(e) =>
              onChange
                ? onChange(
                    formId,
                    id,
                    type === "number" ? +e.target.value : e.target.value
                  )
                : {}
            }
            placeholder={placeholder}
            value={value}
            required={required}
            onFocus={(e) => {
              onFocus && onFocus(e);
              setFocussed(true);
            }}
            onBlur={(e) => {
              onBlur && onBlur(e);
              setFocussed(false);
            }}
            ref={iRef}
            disabled={alwaysDisabled || readOnly}
            autoFocus={autoFocus}
          />
          <button className={buttonClasses}
            type="button"
            ref={buttonRef}
            disabled={buttonDisabled}
            onClick={submitOnClick &&
              (typeof submitOnClick == "function"
                ? (e => submitOnClick(e, iRef))
                : typeof submitOnClick == "string"
                  ? EVENTS[submitOnClick] && (e => EVENTS[submitOnClick](e, iRef))
                  : () => {}
              )
            }>{buttonText || "Submit"}</button>
        </div>
      </div>
      break;
    case "standard":
      variantRender = <div
          className={`c-InputField row${layoutClasses ? " " + layoutClasses : ""}${" " + variant}`}
          onClick={onClick ? onClick : () => {}}
        >
          <div className="col-12 position-relative">
            <label
              htmlFor={id}
              className={`mb-2${labelClasses ? " " + labelClasses : ""}`}
              style={labelStyles}
            >
              {label}
            </label>
            <input
              id={id}
              key={key}
              type={type}
              className={`${inputClasses ? " " + inputClasses : ""}`}
              style={inputStyles}
              onChange={(e) =>
                onChange
                  ? onChange(
                      formId,
                      key,
                      type === "number" ? +e.target.value : e.target.value
                    )
                  : {}
              }
              placeholder={placeholder}
              value={value}
              required={required}
              onFocus={(e) => {
                onFocus && onFocus(e);
                setFocussed(true);
              }}
              onBlur={(e) => {
                onBlur && onBlur(e);
                setFocussed(false);
              }}
              min={min ? min : -999999999}
              max={max ? max : 9999999999}
              ref={iRef}
              disabled={alwaysDisabled || readOnly}
            />
          </div>
        </div>;
        break;
    case "containedLabel":
    default:
      variantRender = <div
          className={`c-InputField row${layoutClasses ? " " + layoutClasses : ""}${" " + variant}`}
          onClick={onClick ? onClick : () => {}}
        >
          <div className="col-12 position-relative">
            <input
              id={id}
              key={key}
              type={type}
              className={`px-3${inputClasses ? " " + inputClasses : ""}`}
              style={inputStyles}
              onChange={(e) =>
                onChange
                  ? onChange(
                      formId,
                      key,
                      type === "number" ? +e.target.value : e.target.value
                    )
                  : {}
              }
              placeholder={placeholder}
              value={value}
              required={required}
              onFocus={(e) => {
                onFocus && onFocus(e);
                setFocussed(true);
              }}
              onBlur={(e) => {
                onBlur && onBlur(e);
                setFocussed(false);
              }}
              min={min ? min : -999999999}
              max={max ? max : 9999999999}
              ref={iRef}
              disabled={alwaysDisabled || readOnly}
            />
            {/* <label htmlFor={id} className={type !== "checkbox" ? `position-absolute label-contained${(shrunkable && (value || focussed || shrunk)) ? " shrunk" : " normal"}${labelClasses ? " " + labelClasses : ""}` : labelClasses}>{label}</label> */}
            <label
              htmlFor={id}
              className={`position-absolute label-contained
              ${labelClasses ? " " + labelClasses : ""}`}
              style={labelStyles}
            >
              {label}
            </label>
          </div>
        </div>;
  }
  return variantRender;
});

InputField.propTypes = {
  alwaysDisabled: PropTypes.bool,
  formId: PropTypes.string,
  id: PropTypes.string,
  inputClasses: PropTypes.string,
  label: PropTypes.string,
  labelClasses: PropTypes.string,
  layoutClasses: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  shrunkable: PropTypes.bool,
  shrunk: PropTypes.bool,
  type: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]),
};

export default InputField;
