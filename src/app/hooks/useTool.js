import {useState} from "react";
import { LoadableIcon } from "../components";
// import { BsToggleOff, BsToggleOn } from "react-icons/bs"

function useTool(toolName, props) {
    const [toggleValues, setToggleValues] = useState(null);

    const addpage = {
        jsx: () => {},
        type: "MODAL"
    }

    const addtoproject = {
        jsx: () => {},
        type: "MODAL"
    }

    const createcomponent = {
        jsx: () => {},
        type: "MODAL"
    }

    const displayconversation = {
        jsx: () => {},
        type: "MODAL"
    }

    const editarmament = {
        jsx: () => {},
        type: "MODAL"
    }

    const exportcode = {
        jsx: () => {},
        type: "MODAL"
    }

    const fileviewer = {
        jsx: () => {},
        type: "MODAL"
    }

    const editproperties = {
        onClickHandler: () => {
            const handlerObj = props.handler && props.handler.type === "onClick" && props.handler;
            const handler = handlerObj && handlerObj.handler;
            const currentValue = handlerObj && handlerObj.currentValue;
            return handler(!currentValue);
        },
        type: "ACTION"
    }

    const saveproperties = {
        onClickHandler: () => {
            const handlerObj = props.handler && props.handler.type === "onClick" && props.handler;
            const handler = handlerObj && handlerObj.handler;
            const currentValue = handlerObj && handlerObj.currentValue;
            return handler(!currentValue);
        },
        type: "ACTION"
    }

    const help = {
        jsx: () => {},
        type: "MODAL"
    }

    const notifications = {
        jsx: () => {},
        type: "MODAL"
    }

    const profile = {
        jsx: (data) => {
            const profileOptions = data && data.profileOptions;
            return <ul className="list-unstyled font-weight-bold">
                {profileOptions && profileOptions.map((profileOption, key) => <li key={key} style={{borderBottom: "1px solid #aaa", padding: "0.3rem 0 0.5rem"}} onClick={profileOption.onClick ? profileOption.onClick : () => {}}>
                <span>{profileOption.name}</span>
                {profileOption.selected !== undefined && <span style={{float: "right"}}>{profileOption.selected ? <LoadableIcon icon="Bs.BsToggleOn" className="svg-stroke-theme" /> : <LoadableIcon icon="Bs.BsToggleOff" className="svg-stroke-theme" />}</span>}
            </li>)}</ul>
        },
        type: "TAGGED"
    }

    const sharearmament = {
        jsx: () => {},
        type: "MODAL"
    }

    const toggles = {
        jsx: (data) => {
            const toggles = data && data.toggles;
            return <ul className="list-unstyled font-weight-bold">
                {toggles && toggles.map((toggle, key) => <li key={key} style={{borderBottom: "1px solid #aaa", padding: "0.3rem 0 0.5rem"}} onClick={() => {
                    if (toggle.selected !== undefined) {
                        const toggleValuesCloned = [...(toggleValues || toggles)];
                        const clickedToggle = toggleValuesCloned.find(toggleInner => toggle.name === toggleInner.name);
                        clickedToggle.selected = !clickedToggle.selected
                        setToggleValues(toggleValuesCloned);
                    }
                }}>
                <span>{toggle.name}</span>
                {toggle.selected !== undefined && <span style={{float: "right"}}>{toggle.selected ? <LoadableIcon icon="Bs.BsToggleOn" className="svg-stroke-theme" /> : <LoadableIcon icon="Bs.BsToggleOff" className="svg-stroke-theme" />}</span>}
            </li>)}</ul>
        },
        toggle: (toggleName) => !this.toggles[toggleName],
        hoverEffect: {},
        type: "TAGGED",
    }

    const viewarmament = {
        jsx: () => {
        }
    }

    const toolProps = {addpage, addtoproject, createcomponent, displayconversation, editarmament, exportcode, fileviewer, editproperties, saveproperties, help, notifications, profile, sharearmament, toggles, viewarmament}[toolName]
    return toolProps || {};
}

export default useTool