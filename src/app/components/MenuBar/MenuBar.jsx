import React, {useState} from "react";
import PropTypes from "prop-types";
import "./MenuBar.component.scss";

const MenuBar = props => {
  const {menuItems} = props;
  const [hovered, setHovered] = useState({});
  const [selected, setSelected] = useState(menuItems[0].name);
  return (
    <div className="c-MenuBar">
      {menuItems && menuItems.length > 0
        ? <ul className="menu-bar d-flex align-items-center mb-0">
            {menuItems.map(item => <li className={`menu-item px-2${hovered[item.name] ? " hovered" : ""}${selected === item.name ? " selected" : ""}`}
              onMouseEnter={() => setHovered({[item.name]: true})}
              onMouseLeave={() => setHovered({[item.name]: false})}
              onClick={() => setSelected(item.name)}>
                <span>{item.label}</span>
              </li>)}
          </ul>
        : null}
    </div>
  );
};

MenuBar.propTypes = {
  menuItems: PropTypes.array
};

export default MenuBar;