"use strict";(self.webpackChunkarmory=self.webpackChunkarmory||[]).push([[77],{2077:function(e,a,n){n.r(a);var o=n(2791),t=n(2007),r=n.n(t),d=n(364),i=n(7947),l=n(6871),u=n(7222),s=n.n(u),g=n(3502),c=n(5136),L=n(1746),b=n(443),h=n(8683),f=n(1040),P=n(1576),p=n(184),m={LoadableDashboard:s()({loader:function(){return n.e(178).then(n.bind(n,2178))},loading:g.PageLoader}),LoadableAuthorizer:s()({loader:function(){return n.e(357).then(n.bind(n,6357))},loading:g.PageLoader}),LoadableProjectCreator:s()({loader:function(){return Promise.all([n.e(511),n.e(315)]).then(n.bind(n,315))},loading:g.PageLoader}),LoadablePageCreator:s()({loader:function(){return Promise.all([n.e(511),n.e(478),n.e(840)]).then(n.bind(n,2840))},loading:g.PageLoader}),LoadableComponentCreator:s()({loader:function(){return Promise.all([n.e(511),n.e(478),n.e(69)]).then(n.bind(n,4069))},loading:g.PageLoader}),LoadableComponentSelector:s()({loader:function(){return n.e(981).then(n.bind(n,4981))},loading:g.PageLoader}),LoadableForgotPassword:s()({loader:function(){return n.e(444).then(n.bind(n,3444))},loading:g.PageLoader}),LoadableUserProfile:s()({loader:function(){return n.e(281).then(n.bind(n,6281))},loading:g.PageLoader}),LoadableNotifications:s()({loader:function(){return n.e(43).then(n.bind(n,6043))},loading:g.PageLoader}),LoadableSettings:s()({loader:function(){return n.e(591).then(n.bind(n,2591))},loading:g.PageLoader}),LoadableCollaborationBoard:s()({loader:function(){return n.e(4).then(n.bind(n,9004))},loading:g.PageLoader})};function C(e){var a=e.dispatchUserDetails,n=e.navigate,t=e.setLoggedIn,r=e.toggleLoader,d=e.userDetails,i=!!b.Z.getCookie("auth_session_token"),u=b.Z.getCookie("auth_session_user"),s=(0,l.TH)();(0,o.useEffect)((function(){t(i),i?(!d&&h.Z.get(f.Z.BE.USER.CURRENT,null,{toggleLoader:r}).then((function(e){return a(e.body)})).catch((function(e){return console.log(e)})),"/"===window.location.pathname&&n("/"+u)):n("/login")}),[i,s]);return(0,p.jsx)(l.Z5,{children:P.k.map((function(e,a){var o=m[e.element];return(0,p.jsx)(l.AW,{path:e.path,element:(0,p.jsx)(o,{navigate:n})},"authenticator-route-"+a)}))})}C.props={userDetails:r().object,dispatchUserDetails:r().func,setLoggedIn:r().func};var k=(0,i.iJ)({userDetails:L.M_}),D={dispatchUserDetails:c.s4,setLoggedIn:c.SL,toggleLoader:c.mn};a.default=(0,d.$j)(k,D)(C)}}]);
//# sourceMappingURL=77.5249b9cd.chunk.js.map