import React, {useState} from "react";
import PropTypes from "prop-types";
import "./MenuBar.component.scss";

const MenuBar = props => {
  const {menuItems} = props;
  const defaultSelected = menuItems ? menuItems[0].name : "";
  const [hovered, setHovered] = useState({});
  const [selected, setSelected] = useState(defaultSelected);
  const tabTypes = ["New Web Project", "New Page", "New Document", "New Article/Blog", "New Demonstrator", "New Chart", "Extract Config"];
  
  return (
    <div className="c-MenuBar position-relative">
      {menuItems && menuItems.length > 0
        ? <ul className="menu-bar d-flex align-items-center mb-0">
            {menuItems.map(item => <li className={`menu-item px-2${hovered[item.name] ? " hovered" : ""}${selected === item.name ? " selected" : ""}`}
              onMouseEnter={() => setHovered({[item.name]: true})}
              onMouseLeave={() => setHovered({[item.name]: false})}
              onClick={() => setSelected(item.name)}>
                <span>{item.label}</span>
              </li>)}
            <li className={`menu-item px-2${hovered.add ? " hovered" : ""}`}
              onMouseEnter={() => setHovered({add: true})}
              onMouseLeave={() => setHovered({add: false})}>
                <span>+</span>
                <div className={`new-app-selector position-absolute${hovered.add ? " py-3 show" : ""}`}>
                  <ul className="list-unstyled">{tabTypes.map(type => <li className="tab-type px-3 py-2 mb-2">{type}</li>)}</ul>
                </div>
            </li>
          </ul>
        : null}
    </div>
  );
};

MenuBar.propTypes = {
  menuItems: PropTypes.array
};

export default MenuBar;