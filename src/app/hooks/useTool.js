import {useSelector} from "react-redux";
import Immutable from "immutable";
import {getToggles} from "../global-selectors";
import { LoadableIcon, Toggle } from "../components";
// import { BsToggleOff, BsToggleOn } from "react-icons/bs"

function useTool(toolName, props, setToolData) {
    const toggleStore = useSelector(getToggles);
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
                {profileOptions && profileOptions.map((profileOption, key) => <li key={key} style={{borderBottom: "1px solid #aaa", padding: "0.6rem 1rem 0.6rem"}} onClick={profileOption.onClick ? profileOption.onClick : () => {}}>
                <span>{profileOption.name}</span>
                <span style={{float: "right"}}>
                    <LoadableIcon size="1.4rem" color="#e83e8c" icon={profileOption.icon} className="svg-stroke-theme" />
                </span>
            </li>)}</ul>
        },
        type: "TAGGED"
    }

    const sharearmament = {
        jsx: () => {},
        type: "MODAL"
    }

    const toggles = {
        jsx: data => {
            const toggles = (toggleStore && toggleStore.size > 0) ? toggleStore.toJS() : data.toggles;
            return <ul className="list-unstyled font-weight-bold">
                {toggles.map((toggle, key) => <Toggle index={key} toggle={toggle} toggles={toggles} />)}
            </ul>
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