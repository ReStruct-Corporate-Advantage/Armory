import React from "react"
import PropTypes from "prop-types"
import {Provider} from "react-redux"
import {BrowserRouter, Route} from "react-router-dom";
import Loadable from "react-loadable"
import PageLoader from "./components/PageLoader";

const LoadableComponentCreator = Loadable({
    loader: () => import("./pages/ComponentCreator"),
    loading: PageLoader
})

const LoadableComponentSelector = Loadable({
    loader: () => import("./pages/ComponentSelector"),
    loading: PageLoader
})

class Router extends React.Component {

    render() {
        const {store} = this.props
        return (
            <Provider store={store}>
                <BrowserRouter basename="armory">
                    <Route exact path="/" component={LoadableComponentCreator} />
                    <Route exact path="/create" component={LoadableComponentCreator} />
                    <Route exact path="/view" component={LoadableComponentSelector} />
                </BrowserRouter>
            </Provider>
        )
    }
}

Router.propTypes = {
    store: PropTypes.object
}

export default Router
