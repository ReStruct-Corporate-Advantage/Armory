import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import { connect, Provider } from "react-redux"
import { matchPath, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Loadable from "react-loadable"
import { dispatchDeviceType, dispatchHideQuickOptions } from "./global-actions";
import { Drawer, Header, Loader, Modal, Notification, PageLoader, RichTooltip, SidePanel } from "./components";
import Helper from "./utils/Helper";
import ROUTES from "./routes";
import usePageComponents from "./hooks/usePageComponents";
import DASHBOARD_CONFIG from "./config/dashboardNewConfig";

const LoadableAuthenticator = Loadable({
    loader: () => import("./authenticator"),
    loading: PageLoader
})

const LoadableLogin = Loadable({
    loader: () => import("./pages/Login"),
    loading: PageLoader
})

const LoadableJoin = Loadable({
    loader: () => import("./pages/Join"),
    loading: PageLoader
})

const LoadableLivePreview = Loadable({
    loader: () => import("./pages/LivePreview"),
    loading: PageLoader
})

const loadables = {
    LoadableAuthenticator,
    LoadableLogin,
    LoadableJoin,
    LoadableLivePreview
}

const Router = props => {
    const {dispatchDeviceType, dispatchHideQuickOptions, store} = props;
    const [matchedRoute, setMatchedRoute] = useState();
    const { DrawerConfig } = usePageComponents(DASHBOARD_CONFIG);
    const [drawerState, setDrawerState] = useState({collapsed: !(DrawerConfig && DrawerConfig.initialExpanded)});
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        let matchedRoute = ROUTES.find(route => matchPath({...route, caseSensitive: false, end: true}, location.pathname));
        if (matchedRoute && matchedRoute.children) {
            matchedRoute = matchedRoute.children.find(route => {
                const checkPath = matchedRoute.path.replace("*", route.path);
                return matchPath({...route, path: checkPath, caseSensitive: false, end: true}, location.pathname)
            });
        }
        setMatchedRoute(matchedRoute);
    }, [location]);

    useEffect(() => {
        dispatchDeviceType({ isMobile: Helper.isMobile() });
    }, []);

    const getRoutes = () => {
        const routeRenders = ROUTES.map((route, i) => {
            const Component = loadables[route.element];
            return <Route key={"router-route-" + i} path={route.path} element={<Component navigate={navigate} />} />
        });
        return <Routes>{routeRenders}</Routes>;
    };

    return  <Provider store={store}>
                <div className={`c-Router__global-events-interceptor h-100 w-100${matchedRoute && matchedRoute.class? " " + matchedRoute.class : ""}`} onClick={() => dispatchHideQuickOptions(true)}>
                    <div className="c-Router__app-container overflow-hidden h-100 w-100 d-flex flex-column">
                        <Header classes={matchedRoute && matchedRoute.class} />
                        <div className="d-flex h-100 w-100">
                            <SidePanel fixed={true} shouldDisplay={false} />
                            <Drawer
                                type="app-drawer"
                                config={{
                                    ...DrawerConfig,
                                    classes: `${DrawerConfig.classes} ${matchedRoute ? matchedRoute.class : ""}`,
                                    collapseWidth: DASHBOARD_CONFIG.DRAWER_WIDTH_COLLAPSED,
                                    expandWidth: DASHBOARD_CONFIG.DRAWER_WIDTH_EXPANDED,
                                }}
                                state={drawerState}
                                setState={setDrawerState}
                            />
                            {getRoutes()}
                        </div>
                        <Modal />
                        <RichTooltip />
                        <Notification />
                        <Loader />
                    </div>
                </div>
            </Provider>;
};

Router.propTypes = {
    store: PropTypes.object,
    dispatchDeviceType: PropTypes.func,
    dispatchHideTooltips: PropTypes.func
}

const mapDispatchToProps = {
    dispatchDeviceType,
    dispatchHideQuickOptions
}

export default connect(null, mapDispatchToProps)(Router);
