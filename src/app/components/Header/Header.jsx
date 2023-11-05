import React from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import {Hamburger, MenuBar, Search, ToolBox} from "..";
import {TOOLS_CONFIG} from "../../config";
import {APP_LOGO} from "../../static/images"
import ROUTES, {AUTHENTICATED_CHILDREN} from "../../routes";
import "./Header.component.scss";

const menuLessPages = ROUTES.filter(r => r.menuLess).concat(AUTHENTICATED_CHILDREN.filter(r => r.menuLess)).map(r => r.class);
const noToolsPages = ROUTES.filter(r => r.noTools).concat(AUTHENTICATED_CHILDREN.filter(r => r.noTools)).map(r => r.class);
const noSearchPages = ROUTES.filter(r => r.noSearch).concat(AUTHENTICATED_CHILDREN.filter(r => r.noSearch)).map(r => r.class);
const concealHeaderHeightPages = ROUTES.filter(r => r.concealHeaderHeight).concat(AUTHENTICATED_CHILDREN.filter(r => r.concealHeaderHeight)).map(r => r.class);
const headerLessPages = ROUTES.filter(r => r.noHeader).concat(AUTHENTICATED_CHILDREN.filter(r => r.noHeader)).map(r => r.class);

const Header = props => {
  const {route} = props;
  const {class: classes, headerClasses, displaySignInPrompt} = route || {};
  const navigate = useNavigate();
  const displayMenu = classes && menuLessPages.findIndex(page => classes.indexOf(page) > -1) < 0;
  const displayTools = classes && noToolsPages.findIndex(page => classes.indexOf(page) > -1) < 0;
  const displaySearch = classes && noSearchPages.findIndex(page => classes.indexOf(page) > -1) < 0;
  const concealHeaderHeight = classes && concealHeaderHeightPages.findIndex(page => classes.indexOf(page) > -1) > -1;
  const hideHeader = classes && headerLessPages.findIndex(page => classes.indexOf(page) > -1) > -1;
  const juice = <header className={`c-Header d-flex align-items-center px-2 py-2
    ${classes ? " " + classes : ""}
    ${headerClasses ? " " + headerClasses : ""}`}>
      {hideHeader ? <span className="p-2 bg-white mx-auto" style={{borderRadius: "50%"}}>
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFXUlEQVR4nO2beYjVVRTHPy4tOtEiU1lWJGU5WdIKZVOQU+SobVa2WYSFf0SQWdEuiUT1h5RYVmbQIkZoi5SlKEZERWVhOVi2N1NqSZvZ2KLz4sB5cDme33u/N79l5r3eFw44c+/cc+659557zvf+hDrqqCMD9AFOBO4CXgXagI+Bt4C5wIXA7tQYdgUuAOYDG4BCGZE+U4F+1AD2BNbFmLQnq4D9qXJc1c3JF+Vr4FLgJuBhYDGwAngbeE///bLurjuAy4CRQH96CZojJvYZMAU4DTgKGAs8AmxJ6LCi/Am8BEzsDc6Y6Rj4mzqniMHAA8DvKTnA7qJJ9DBujVilccC0FFe+lCwH9utJJ1wH7KjA4K3AK8DdwPnA8cAQYB+VA4DDgFG6wtOB54AvS4z5HTCip4PivyUMFActAc4FdkugRwLhPOAfR8cmYDg9iPkRk5fVPjplXbLaHzq61usVnTuuBrqMMb8AF2WoUzLLFx0nPEXOOMPZ/p/qOc4auwArje4ujR+5YAjwozGgLedMrxH4ydiwIC/lS43iHzSKZwm58hrM724wdvyqBVqmuNwo/Rs4OWOd0/VGkVtgVlBYHenEAtkZmQagb43Ce3KoPu31d2eQcVoHZBqDrjfK1qmBWaKvU3Y/q22nOw5oyNKQ9UbZBPLBqCAj7NSJC5409nyepRFjjbI1eQScAP2UfSrm/8OA7cam2VkasMwok1og7SzvJGBQzP4TI+oN4RtSx77G21L57R3zb2WXjAbm6K6R2uAQ02eWmcjPSpA8rrfOgc64jXr9emm4lOypp7yFQJ6OOfFLgE8cAxcG/QZFFDlevj/TFD4HKYvk9b8tTQe8YAYfU6b/UOUAoyYjaWwRk2JM3sq7yj0UHT3VcaKkxuPTmHx/4A+T+JS6as7ULVxqAvcFY682bdsqcMQ8rQsELcpMhe1r03DAcWZQ4fyj0BJzAmP0Wp1jfi/ZXpPGl1OUXVqiMSdqrFWaEAlanfbEKfoUM+CMiH7NGoWtARucSUr+8IbTd1HE2AM16q9wyu+CUnASSO932hIXaJbwOMfpM9ipzArK5MY949/HXK1jlIWOM6Ycr8R4p0yuLUHoNUf5M5q82CvOk82a5MSFHJHXy4y5Xa/fxNgUDNqpZzfEZEf50oC/f7OMoRJTDu6GXWLHlUC7M+ZWfVRJjAZz5tY61WG7w9uH/Nxix8BOvVpHp5BOiw1n6/l/TANnanT5UGO4BKFShESXvg6FOFTT6A+AR/VulqBWFRhZgnKSlfvCOfc1hWYzQXnzL+IsJ+jkQYjmilYzyYeCtidMm1DVNYU+wPMRKay0bTRt8tFETeFeJ3qfp22Hm9//BQyghjDZmbxkhEVMMG2SLNUMWpzScmVQdRX7hO0bc6bHMkOTvu3Z5y55vrbJR6fpdyxVjkbnXt+s593DctP3dqoYA5yiZ1uZx8Zppr/k/FWJvlqH26AnJMRXyrW/r/f8jQEZOsL0l5fivahCzIhRrtrPUoQlEnSYNvkytOqwpUIHFI/HNc7LjGSHVYe2bjggLH3Dnzuq8Tps0pp9mX5mIkfiWuDiQK5QAtPj46wIZVWzGO/kCVZuoZdjnBKQ5VayQ6tBi2H6SXwpmroSDNcduDplWaQfUOwEG7lLidBdHgYqu+MdCXk42aMCB6xJEIPKyUdZOSCsCb5x/k5osLgod6SSiIy9E1pjOqE9xhsgutpzg90g/3OkEtwcM7hWKjs0W80NR2jqbGnzOJBX3hNSFhmzjjrqyC5PKFQoUXlFHMyOeHnORF9HhtdSuWvVw6k56+N/74DWjJwQN6/w8GA3jkASfXVQa/gPIhIyuWQlhYsAAAAASUVORK5CYII=" />
      </span>
      : <>
          <span className="c-Header__app-logo mx-3" onClick={() => navigate("/")}>
          <img src={APP_LOGO} className="h-100 w-100" />
          </span>
          {displayMenu && <MenuBar menuItems={[
              { name: "appCreator", label: "App Creator", selected: true }
                // { name: "pageCreator", label: "Page Creator" },
                // { name: "articleCreator", label: "Article Creator" },
                // { name: "configGenerator", label: "ArmConfig Generator" }
            ]} />}
          {displaySearch && <Search classes="ms-auto me-4 d-none d-sm-flex" />}
          {displaySignInPrompt && <span className="ms-auto me-4 my-4 ps-2 d-none d-sm-block">Or continue to <Link to="/login" className="fw-bold" style={{color: "white"}}>Sign in</Link></span>}
          {displayTools &&
            <>
              <ToolBox toolsConfig={TOOLS_CONFIG.PAGE_TOOLS} />
              <ToolBox toolsConfig={TOOLS_CONFIG.GLOBAL_TOOLS} />
            </>
          }
          {!displayTools && <>
            {/* <Link to="/login" */}
          </>}
          <Hamburger classes="d-sm-none d-block ms-auto" />
      </>}
    </header>;
  return concealHeaderHeight ? <div className="position-relative">{juice}</div> : juice;
};

Header.propTypes = {
  classes: PropTypes.string
}

export default Header;