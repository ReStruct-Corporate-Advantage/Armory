import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=0d6af788"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=0d6af788"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react;
import __vite__cjsImport2_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=ab996866"; const ReactDOM = __vite__cjsImport2_reactDom_client.__esModule ? __vite__cjsImport2_reactDom_client.default : __vite__cjsImport2_reactDom_client;
import { BrowserRouter } from "/node_modules/.vite/deps/react-router-dom.js?v=0f15af85";
import { Provider } from "/node_modules/.vite/deps/react-redux.js?v=581c66db";
import { store } from "/src/app/store.ts";
import Router from "/src/app/Router.tsx?t=1712267068556";
import { init } from "/node_modules/.vite/deps/@armco_analytics.js?v=3317c294";
import CONFIG from "/analyticsrc.json?import";
import "/src/app/static/styles/global.scss";
const root = ReactDOM.createRoot(document.getElementById("root"));
const armcoStyles = Array.from(document.head.getElementsByTagName("style")).filter((t) => !!t).find((t) => {
  const styleLink = t.getAttribute("data-vite-dev-id");
  const styleIndex = styleLink?.indexOf("@armco");
  return styleIndex && styleIndex > -1;
});
armcoStyles && document.head.append(armcoStyles);
init && init(CONFIG);
root.render(/* @__PURE__ */ jsxDEV(React.StrictMode, { children: /* @__PURE__ */ jsxDEV(BrowserRouter, { children: /* @__PURE__ */ jsxDEV(Provider, { store, children: /* @__PURE__ */ jsxDEV(Router, {}, void 0, false, {
  fileName: "/Users/mohit/__Projects__/stuffle/src/index.tsx",
  lineNumber: 21,
  columnNumber: 9
}, this) }, void 0, false, {
  fileName: "/Users/mohit/__Projects__/stuffle/src/index.tsx",
  lineNumber: 20,
  columnNumber: 7
}, this) }, void 0, false, {
  fileName: "/Users/mohit/__Projects__/stuffle/src/index.tsx",
  lineNumber: 19,
  columnNumber: 5
}, this) }, void 0, false, {
  fileName: "/Users/mohit/__Projects__/stuffle/src/index.tsx",
  lineNumber: 18,
  columnNumber: 13
}, this));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBeUJRO0FBekJSLE9BQU9BLFdBQVc7QUFDbEIsT0FBT0MsY0FBYztBQUNyQixTQUFTQyxxQkFBcUI7QUFDOUIsU0FBU0MsZ0JBQWdCO0FBQ3pCLFNBQVNDLGFBQWE7QUFDdEIsT0FBT0MsWUFBWTtBQUNuQixTQUFTQyxZQUFZO0FBQ3JCLE9BQU9DLFlBQVk7QUFDbkIsT0FBTztBQUVQLE1BQU1DLE9BQU9QLFNBQVNRLFdBQVdDLFNBQVNDLGVBQWUsTUFBTSxDQUFnQjtBQUMvRSxNQUFNQyxjQUFjQyxNQUFNQyxLQUFLSixTQUFTSyxLQUFLQyxxQkFBcUIsT0FBTyxDQUFDLEVBQ3ZFQyxPQUFRQyxPQUFNLENBQUMsQ0FBQ0EsQ0FBQyxFQUNqQkMsS0FBTUQsT0FBTTtBQUNYLFFBQU1FLFlBQVlGLEVBQUVHLGFBQWEsa0JBQWtCO0FBQ25ELFFBQU1DLGFBQWFGLFdBQVdHLFFBQVEsUUFBUTtBQUM5QyxTQUFPRCxjQUFjQSxhQUFhO0FBQ3BDLENBQUM7QUFDSFYsZUFBZUYsU0FBU0ssS0FBS1MsT0FBT1osV0FBVztBQUMvQ04sUUFBUUEsS0FBS0MsTUFBTTtBQUVuQkMsS0FBS2lCLE9BQ0gsdUJBQUMsTUFBTSxZQUFOLEVBQ0MsaUNBQUMsaUJBQ0MsaUNBQUMsWUFBUyxPQUNSLGlDQUFDLFlBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUFPLEtBRFQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUVBLEtBSEY7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUlBLEtBTEY7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQU1BLENBQ0YiLCJuYW1lcyI6WyJSZWFjdCIsIlJlYWN0RE9NIiwiQnJvd3NlclJvdXRlciIsIlByb3ZpZGVyIiwic3RvcmUiLCJSb3V0ZXIiLCJpbml0IiwiQ09ORklHIiwicm9vdCIsImNyZWF0ZVJvb3QiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiYXJtY29TdHlsZXMiLCJBcnJheSIsImZyb20iLCJoZWFkIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJmaWx0ZXIiLCJ0IiwiZmluZCIsInN0eWxlTGluayIsImdldEF0dHJpYnV0ZSIsInN0eWxlSW5kZXgiLCJpbmRleE9mIiwiYXBwZW5kIiwicmVuZGVyIl0sInNvdXJjZXMiOlsiaW5kZXgudHN4Il0sImZpbGUiOiIvVXNlcnMvbW9oaXQvX19Qcm9qZWN0c19fL3N0dWZmbGUvc3JjL2luZGV4LnRzeCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIlxuaW1wb3J0IFJlYWN0RE9NIGZyb20gXCJyZWFjdC1kb20vY2xpZW50XCJcbmltcG9ydCB7IEJyb3dzZXJSb3V0ZXIgfSBmcm9tIFwicmVhY3Qtcm91dGVyLWRvbVwiXG5pbXBvcnQgeyBQcm92aWRlciB9IGZyb20gXCJyZWFjdC1yZWR1eFwiXG5pbXBvcnQgeyBzdG9yZSB9IGZyb20gXCIuL2FwcC9zdG9yZVwiXG5pbXBvcnQgUm91dGVyIGZyb20gXCIuL2FwcC9Sb3V0ZXJcIlxuaW1wb3J0IHsgaW5pdCB9IGZyb20gXCJAYXJtY28vYW5hbHl0aWNzXCJcbmltcG9ydCBDT05GSUcgZnJvbSBcIi4uL2FuYWx5dGljc3JjLmpzb25cIlxuaW1wb3J0IFwiLi9hcHAvc3RhdGljL3N0eWxlcy9nbG9iYWwuc2Nzc1wiXG5cbmNvbnN0IHJvb3QgPSBSZWFjdERPTS5jcmVhdGVSb290KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vdFwiKSBhcyBIVE1MRWxlbWVudClcbmNvbnN0IGFybWNvU3R5bGVzID0gQXJyYXkuZnJvbShkb2N1bWVudC5oZWFkLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic3R5bGVcIikpXG4gIC5maWx0ZXIoKHQpID0+ICEhdClcbiAgLmZpbmQoKHQpID0+IHtcbiAgICBjb25zdCBzdHlsZUxpbmsgPSB0LmdldEF0dHJpYnV0ZShcImRhdGEtdml0ZS1kZXYtaWRcIilcbiAgICBjb25zdCBzdHlsZUluZGV4ID0gc3R5bGVMaW5rPy5pbmRleE9mKFwiQGFybWNvXCIpXG4gICAgcmV0dXJuIHN0eWxlSW5kZXggJiYgc3R5bGVJbmRleCA+IC0xXG4gIH0pXG5hcm1jb1N0eWxlcyAmJiBkb2N1bWVudC5oZWFkLmFwcGVuZChhcm1jb1N0eWxlcylcbmluaXQgJiYgaW5pdChDT05GSUcpXG5cbnJvb3QucmVuZGVyKFxuICA8UmVhY3QuU3RyaWN0TW9kZT5cbiAgICA8QnJvd3NlclJvdXRlcj5cbiAgICAgIDxQcm92aWRlciBzdG9yZT17c3RvcmV9PlxuICAgICAgICA8Um91dGVyIC8+XG4gICAgICA8L1Byb3ZpZGVyPlxuICAgIDwvQnJvd3NlclJvdXRlcj5cbiAgPC9SZWFjdC5TdHJpY3RNb2RlPixcbilcbiJdfQ==