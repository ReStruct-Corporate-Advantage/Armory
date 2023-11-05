import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import { connect, Provider } from "react-redux"
import { matchPath, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Loadable from "react-loadable"
import { dispatchDeviceType, dispatchHideQuickOptions, dispatchHideSearchResults } from "./global-actions";
import { Drawer, Footer, Header, Loader, Modal, Notification, PageLoader, RichTooltip, SidePanel } from "./components";
import Helper from "./utils/Helper";
import ROUTES, { AUTHENTICATED_CHILDREN } from "./routes";
import usePageComponents from "./hooks/usePageComponents";
import DASHBOARD_CONFIG from "./config/dashboardNewConfig";

const LoadableAuthenticator = Loadable({
    loader: () => import("./authenticator"),
    loading: PageLoader
})

const LoadableLanding = Loadable({
    loader: () => import("./pages/Landing"),
    loading: PageLoader
})

const LoadableComponentCreator = Loadable({
    loader: () => import("./pages/ComponentCreator"),
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

const LoadableForgotPassword = Loadable({
    loader: () => import("./pages/ForgotPassword"),
    loading: PageLoader
})

const loadables = {
    LoadableAuthenticator,
    LoadableLanding,
    LoadableComponentCreator,
    LoadableLogin,
    LoadableJoin,
    LoadableLivePreview,
    LoadableForgotPassword,
}

const Router = props => {
    const {dispatchDeviceType, dispatchHideQuickOptions, dispatchHideSearchResults, store} = props;
    const [matchedRoute, setMatchedRoute] = useState();
    const { DrawerConfig } = usePageComponents(DASHBOARD_CONFIG);
    const [drawerState, setDrawerState] = useState({collapsed: !(DrawerConfig && DrawerConfig.initialExpanded)});
    const drawerWidth = drawerState.collapsed ? DASHBOARD_CONFIG.DRAWER_WIDTH_COLLAPSED : DASHBOARD_CONFIG.DRAWER_WIDTH_EXPANDED;
    const location = useLocation();
    const navigate = useNavigate();
    const drawerLess = ROUTES.filter(r => r.drawerLess).concat(AUTHENTICATED_CHILDREN.filter(r => r.drawerLess)).map(r => r.class);
    const rootClass = matchedRoute && matchedRoute.class ? " " + (matchedRoute.class.indexOf(" ") > -1 ? matchedRoute.class.split(" ")[0] : matchedRoute.class) : ""
    const footerHeight = "1.5rem";
    const mainContentPadding = rootClass && rootClass.replace(/\s/g, "") === "dashboard" ? "pb-2" : "pb-4"

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
            return <Route key={"router-route-" + i} path={route.path} element={
                <Component
                    drawerWidth={drawerWidth}
                    navigate={navigate}
                />}
            />
        });
        return <Routes>{routeRenders}</Routes>;
    };

    return  <Provider store={store}>
                <div className={`c-Router__global-events-interceptor h-100 w-100${rootClass}`} onClick={() => {
                    dispatchHideSearchResults(true)
                    dispatchHideQuickOptions(true)
                }}>
                    <div className="c-Router__app-container overflow-hidden h-100 w-100 d-flex flex-column">
                        <Header route={matchedRoute} />
                        <div className={`c-Router__main-content d-flex h-100 w-100 overflow-auto ${mainContentPadding}`}>
                            <SidePanel fixed={true} shouldDisplay={false} />
                            {matchedRoute && drawerLess.indexOf(matchedRoute.class) === -1 && <Drawer
                                type="app-drawer"
                                config={{
                                    ...DrawerConfig,
                                    classes: `${DrawerConfig.classes} ${matchedRoute ? matchedRoute.class : ""}`,
                                    collapseWidth: DASHBOARD_CONFIG.DRAWER_WIDTH_COLLAPSED,
                                    expandWidth: DASHBOARD_CONFIG.DRAWER_WIDTH_EXPANDED,
                                }}
                                state={drawerState}
                                setState={setDrawerState}
                            />}
                            {getRoutes()}
                        </div>
                        <Footer footerHeight={footerHeight} />
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
    dispatchHideQuickOptions,
    dispatchHideSearchResults
}

export default connect(null, mapDispatchToProps)(Router);
