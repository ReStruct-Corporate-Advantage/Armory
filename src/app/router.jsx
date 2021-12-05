import React from "react"
import PropTypes from "prop-types"
import { connect, Provider } from "react-redux"
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import Loadable from "react-loadable"
import { dispatchDeviceType, dispatchHideQuickOptions } from "./global-actions";
import { Header, Modal, PageLoader, RichTooltip } from "./components";
import Helper from "./utils/Helper";

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

class Router extends React.Component {

    componentDidMount() {
        this.props.dispatchDeviceType({isMobile: Helper.isMobile()});
    }

    render() {
        const { store, dispatchHideQuickOptions } = this.props
        return (
            <Provider store={store}>
                <div className="global-events-interceptor h-100 w-100" onClick={() => dispatchHideQuickOptions(true)}>
                    <Header />
                    <BrowserRouter>
                        <Switch>
                            <Route exact path="/" component={LoadableAuthenticator} />
                            <Route path="/login" component={LoadableLogin} />
                            <Route path="/join" component={LoadableJoin} />
                            <Route path="/:user" component={LoadableAuthenticator} />
                            <Route render={() => <Redirect to="/" />} />
                        </Switch>
                    </BrowserRouter>
                    <Modal />
                    <RichTooltip />
                    <BrowserRouter>
                        <Route exact path="/:user/page/live" component={LoadableLivePreview} />
                    </BrowserRouter>
                </div>
            </Provider>
        )
    }
}

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
