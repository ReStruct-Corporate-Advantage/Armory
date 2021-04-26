import {useState} from "react";
import { BsToggleOff, BsToggleOn } from "react-icons/bs"

function useTool(toolName) {
    const [toggleValues, setToggleValues] = useState(null);
    const notifications = {
        panel: () => {
        }
    }

    const toggles = {
        jsx: (data) => {
            const toggles = data && data.toggles;
            return <ul className="list-unstyled font-weight-bold">
                {toggles && toggles.map(toggle => <li style={{borderBottom: "1px solid #aaa", padding: "0.3rem 0 0.5rem"}} onClick={() => {
                    const toggleValuesCloned = [...(toggleValues || toggles)];
                    const clickedToggle = toggleValuesCloned.find(toggleInner => toggle.name === toggleInner.name);
                    clickedToggle.selected = !clickedToggle.selected
                    setToggleValues(toggleValuesCloned);
                }}>
                <span>{toggle.name}</span>
                <span style={{float: "right"}}>{toggle.selected ? <BsToggleOn className="svg-stroke-theme" /> : <BsToggleOff className="svg-stroke-theme" />}</span>
            </li>)}</ul>
        },
        toggle: (toggleName) => !this.toggles[toggleName],
        hoverEffect: {},
        type: "TAGGED",
    }

    const toolProps = {notifications, toggles}[toolName]
    return toolProps || {};
}

export default useTool