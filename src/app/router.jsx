import React from "react"
import PropTypes from "prop-types"
import {Provider} from "react-redux"
import {BrowserRouter, Route} from "react-router-dom";
import Loadable from "react-loadable"
import PageLoader from "./components/PageLoader";

const LoadableHome = Loadable({
    loader: () => import("./pages/Home"),
    loading: PageLoader
})

const LoadableComponentCreator = Loadable({
    loader: () => import("./pages/ComponentCreator"),
    loading: PageLoader
})

const LoadableComponentSelector = Loadable({
    loader: () => import("./pages/ComponentSelector"),
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

const LoadableForgotPassword = Loadable({
    loader: () => import("./pages/ForgotPassword"),
    loading: PageLoader
})

const LoadableUserProfile = Loadable({
    loader: () => import("./pages/UserProfile"),
    loading: PageLoader
})

const LoadableNotifications = Loadable({
    loader: () => import("./pages/Notifications"),
    loading: PageLoader
})

const LoadableSettings = Loadable({
    loader: () => import("./pages/Settings"),
    loading: PageLoader
})

class Router extends React.Component {

    render() {
        const {store} = this.props
        return (
            <Provider store={store}>
                <BrowserRouter basename="/">
                    <Route exact path="/" component={LoadableHome} />
                    <Route exact path="/:user" component={LoadableComponentCreator} />
                    <Route exact path="/:user/create" component={LoadableComponentCreator} />
                    <Route exact path="/:user/view" component={LoadableComponentSelector} />
                    <Route exact path="/:user/login" component={LoadableLogin} />
                    <Route exact path="/:user/join" component={LoadableJoin} />
                    <Route exact path="/:user/resetPassword" component={LoadableForgotPassword} />
                    <Route exact path="/:user/profile" component={LoadableUserProfile} />
                    <Route exact path="/:user/notifications" component={LoadableNotifications} />
                    <Route exact path="/:user/settings" component={LoadableSettings} />
                </BrowserRouter>
            </Provider>
        )
    }
}

Router.propTypes = {
    store: PropTypes.object
}

export default Router
