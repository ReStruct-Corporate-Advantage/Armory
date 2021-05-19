import React from "react"
import PropTypes from "prop-types"
import { Provider } from "react-redux"
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import Loadable from "react-loadable"
import { Modal, PageLoader } from "./components";

const LoadableAuthenticator = Loadable({
    loader: () => import("./authenticator"),
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

class Router extends React.Component {

    render() {
        const { store } = this.props
        return (
            <Provider store={store}>
                <BrowserRouter>
                    <Switch>
                        <Route exact path="/" component={LoadableComponentCreator} />
                        <Route path="/login" component={LoadableLogin} />
                        <Route path="/join" component={LoadableJoin} />
                        <Route path="/:user" component={LoadableAuthenticator} />
                        <Route render={() => <Redirect to="/" />} />
                    </Switch>
                </BrowserRouter>
                <Modal />
            </Provider>
        )
    }
}

Router.propTypes = {
    store: PropTypes.object
}

export default Router
