import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {createPropsSelector} from "reselect-immutable-helpers";
import { io } from "socket.io-client";
import { getPresentComponentsConfig } from "../ComponentCreator/selectors";
import { getUserDetails } from "../../global-selectors";
import { compGen } from "../../utils/CodeUtils/ComponentGenerator";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend"
import {TouchBackend} from "react-dnd-touch-backend"
import API_CONFIG from "../../constants/api-config";
import "./LivePreview.module.scss";

const LivePreview = props => {
  const {isMobile} = props;
  const [componentConfig, setComponentConfig] = useState(null);
  const [socket, setSocket] = useState(null);
  const items = componentConfig && componentConfig.value && componentConfig.value.components && componentConfig.value.components[0].descriptor.children;
  const componentRenders = items ? compGen.iterateAndGenerateWithConfig(items, null, "", "", () => {}).map(componentObj => componentObj.item) : null;
  const dndBackend = isMobile ? TouchBackend : Backend;

  useEffect(() => {
    if (!socket) {
      const host = API_CONFIG.HOST[process.env.NODE_ENV || "development"];
      const newSocket = io(host);
      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, [socket, setSocket])

  if (socket) {
    socket.on("message", message => setComponentConfig(message));
  }

  console.log(componentConfig);

  return (<DndProvider backend={dndBackend}>
        <div className="c-LivePreview">
          {componentRenders}
        </div>
    </DndProvider>);
};

LivePreview.propTypes = {
  componentsConfig: PropTypes.object,
  userDetails: PropTypes.object
};

const mapStateToProps = createPropsSelector({
  componentsConfig: getPresentComponentsConfig,
  userDetails: getUserDetails
})

export default connect(mapStateToProps)(LivePreview);