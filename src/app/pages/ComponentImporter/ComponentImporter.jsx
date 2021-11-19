import React, { useState, useRef } from "react";
import { LoadableIcon } from "../../components";
import JsonView from "../../utils/JsonUtils/JsonUtil";
import DescriptorGenerator from "../../utils/CodeUtils/DescriptorGenerator";
import DOMHelper from "../../utils/DOMHelper";
import "./ComponentImporter.module.scss";

const ComponentImporter = props => {
  const [codeString, setCodeString] = useState("");
  const [jsonState, setJsonState] = useState({jsonString: "", jsonObj: null, jsonView: "object"});
  const [inputHovered, setInputHovered] = useState(false);
  const [outputHovered, setOutputHovered] = useState(false);
  const outRef = useRef(null);

  const renderDescriptor = () => {
    const outputNode = outRef && outRef.current;
    outputNode.innerHTML = "";
    const descriptor = DescriptorGenerator.generate(codeString);
    const descriptorString = descriptor ? JSON.stringify(descriptor, undefined, 2) : "Unable to Generate Descriptor, please review provided string";
    const tree = JsonView.createTree(descriptorString);
    console.log(tree)
    // const armoryFormat = convertToArmoryFormat(tree);
    // JsonView.render(armoryFormat, outputNode);
    JsonView.render(tree, outputNode);
    JsonView.expandChildren(tree);
    setJsonState({jsonString: descriptorString, jsonObj: tree, jsonView: "object"});
  }
  
  const toggleJson = () => {
    const jsonStateClone = {...jsonState};
    const outputNode = outRef && outRef.current;
    outputNode.innerHTML = "";
    jsonStateClone.jsonString = JSON.stringify(JSON.parse(jsonStateClone.jsonString), undefined, 2);
    jsonStateClone.jsonView === "string" ? JsonView.render(jsonStateClone.jsonObj, outputNode) : outputNode.innerHTML = jsonStateClone.jsonString;
    jsonStateClone.jsonView === "string" && JsonView.expandChildren(jsonStateClone.jsonObj);
    jsonStateClone.jsonView = jsonStateClone.jsonView === "object" ? "string" : "object";
    setJsonState(jsonStateClone);
  }

  const copyToClipboard = (string) => {
    navigator.clipboard.writeText(string).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }

  return (
    // <IconContext.Provider value={{ color: "white", size: "1.1rem", className: "global-class-name" }}>
      <div className="c-ComponentImporter px-3 overflow-auto flex-grow-1 d-flex flex-column">
        <div className="converter-tools row pt-2">
          <div className="col-12">
            <button className="btn btn-success mr-3" onClick={renderDescriptor}><LoadableIcon icon="Vsc.VscDebugStart" />Run</button>
            <button className="btn btn-danger" onClick={() => {
              setCodeString("");
              setJsonState({jsonString: "", jsonObj: null, jsonView: "object"});
              outRef && outRef.current && (outRef.current.innerHTML = "")
            }}>Clear</button>
          </div>
        </div>
        <div className="row flex-grow-1 mb-3 pt-2 pb-3">
          <div className={`col-6 pr-2 position-relative${inputHovered ? " hovered" : ""}`} onMouseEnter={() => setInputHovered(true)} onMouseLeave={() => setInputHovered(false)}>
            <div className="code-importer-input-tools position-absolute">
              {/* <IconContext.Provider value={{ color: "black", size: "0.8rem", className: "code-importer-input-tool" }}> */}
                <LoadableIcon icon="Vsc.VscDebugStart" onClick={renderDescriptor} />
                <LoadableIcon icon="Bs.BsCodeSlash" onClick={() => setCodeString(DOMHelper.process(codeString))} />
                <LoadableIcon icon="Ai.AiOutlineClear" onClick={() => setCodeString("")} />
                <LoadableIcon icon="Fa.FaRegCopy" onClick={() => copyToClipboard(codeString)} />
            </div>
            <textarea id="code-importer-input" className="c-ComponentImporter__code-input w-100 h-100" value={codeString} onChange={(e) => setCodeString(e.target.value)} name="code-importer-input" rows="20" />
          </div>
          <div className={`col-6 pl-2 position-relative${outputHovered ? " hovered" : ""}`}  onMouseEnter={() => setOutputHovered(true)} onMouseLeave={() => setOutputHovered(false)}>
            <div className="code-importer-output-tools position-absolute">
              {/* <IconContext.Provider value={{ color: "black", size: "0.8rem", className: "code-importer-output-tool" }}> */}
                <LoadableIcon icon="Ri.RiExchangeLine" onClick={toggleJson} />
                <LoadableIcon icon="Ai.AiOutlineClear" onClick={() => {
                  setJsonState({jsonString: "", jsonObj: null, jsonView: "object"});
                  outRef && outRef.current && (outRef.current.innerHTML = "");
                }} />
                <LoadableIcon icon="Fa.FaRegCopy" onClick={() => copyToClipboard(jsonState.jsonString)} />
                {jsonState.jsonView === "object" && <LoadableIcon icon="Vsc.VscExpandAll" onClick={() => JsonView.expandChildren(jsonState.jsonObj)} />}
                {jsonState.jsonView === "object" && <LoadableIcon icon="Vsc.VscCollapseAll" onClick={() => JsonView.collapseChildren(jsonState.jsonObj)} />}
            </div>
            <pre id="code-importer-output" className="c-ComponentImporter__code-output w-100 h-100 bg-white" ref={outRef} />
          </div>
        </div>
      </div>
  );
};

export default ComponentImporter;