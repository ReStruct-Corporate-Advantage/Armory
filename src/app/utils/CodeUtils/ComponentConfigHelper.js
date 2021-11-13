import React from "react";

class ComponentConfigHelper extends React.PureComponent {
    constructor () {
        super ();
        this.generateContainer = this.generateContainer.bind(this);
    }

    generateContainer (props) {
        const {componentsConfig, dispatchComponentsConfig, dispatchSelectedComponent, dispatchLevels, userDetails, UID} = props;
        let {config} = props;
        config = JSON.parse(JSON.stringify(config));
        const componentsConfigCloned = {...componentsConfig};
        config.name = "Container"; // Set this up to allow picking Container component from generated components list
        config.uuid = `arm-Container-${UID}`;
        componentsConfigCloned.components[0].descriptor.children.push(config);
        dispatchComponentsConfig(componentsConfigCloned);
        dispatchSelectedComponent(config.uuid);
        dispatchLevels({username: {name: userDetails.username, type: "Expandable"}, section: {name: "Components"}, item: {name: config.displayName + "[DRAFT]", type: "Expandable"}})
    }
}

const helper = new ComponentConfigHelper();
export {helper};
export default ComponentConfigHelper;