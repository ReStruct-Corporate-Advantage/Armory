import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import { connect, Provider } from "react-redux"
import { matchPath, Route, Routes, useLocation } from "react-router-dom";
import Loadable from "react-loadable"
import { dispatchDeviceType, dispatchHideQuickOptions } from "./global-actions";
import { Header, Modal, Notification, PageLoader, RichTooltip, SidePanel } from "./components";
import Helper from "./utils/Helper";
import ROUTES from "./routes";

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
    const location = useLocation();

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
        const routeRenders = ROUTES.map(route => {
            const Component = loadables[route.element];
            return <Route path={route.path} element={<Component />} />
        });
        return <Routes>{routeRenders}</Routes>;
    };

    return  <Provider store={store}>
                <div className={`c-Router__global-events-interceptor h-100 w-100${matchedRoute && matchedRoute.class? " " + matchedRoute.class : ""}`} onClick={() => dispatchHideQuickOptions(true)}>
                    <div className="c-Router__app-container overflow-hidden h-100 w-100 d-flex flex-column">
                        <Header classes={matchedRoute && matchedRoute.class} />
                        <SidePanel fixed={true} shouldDisplay={false} />
                        {getRoutes()}
                        <Modal />
                        <RichTooltip />
                        <Notification />
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
