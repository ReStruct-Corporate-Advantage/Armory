"use strict";(self.webpackChunkarmory=self.webpackChunkarmory||[]).push([[267],{7267:function(n,e,o){o.r(e),o.d(e,{default:function(){return j}});var t=o(1413),r=o(885),s=o(2791),i=o(4073),c=o(329),a=o(4916),l=o(719),u=o(184),j=function(n){var e=(0,s.useState)(""),o=(0,r.Z)(e,2),j=o[0],d=o[1],p=(0,s.useState)({jsonString:"",jsonObj:null,jsonView:"object"}),b=(0,r.Z)(p,2),x=b[0],f=b[1],g=(0,s.useState)(!1),C=(0,r.Z)(g,2),m=C[0],v=C[1],h=(0,s.useState)(!1),w=(0,r.Z)(h,2),L=w[0],S=w[1],V=(0,s.useRef)(null),k=function(){var n=V&&V.current;n.innerHTML="";var e=a.Z.generate(j),o=e?JSON.stringify(e,void 0,2):"Unable to Generate Descriptor, please review provided string",t=c.Z.createTree(o);console.log(t),c.Z.render(t,n),c.Z.expandChildren(t),f({jsonString:o,jsonObj:t,jsonView:"object"})},N=function(n){navigator.clipboard.writeText(n).then((function(){console.log("Async: Copying to clipboard was successful!")}),(function(n){console.error("Async: Could not copy text: ",n)}))};return(0,u.jsxs)("div",{className:"c-ComponentImporter px-3 overflow-auto flex-grow-1 d-flex flex-column",children:[(0,u.jsx)("div",{className:"converter-tools row pt-2",children:(0,u.jsxs)("div",{className:"col-12",children:[(0,u.jsxs)("button",{className:"btn btn-success me-3",onClick:k,children:[(0,u.jsx)(i.LoadableIcon,{icon:"Vsc.VscDebugStart"}),"Run"]}),(0,u.jsx)("button",{className:"btn btn-danger",onClick:function(){d(""),f({jsonString:"",jsonObj:null,jsonView:"object"}),V&&V.current&&(V.current.innerHTML="")},children:"Clear"})]})}),(0,u.jsxs)("div",{className:"row flex-grow-1 mb-3 pt-2 pb-3",children:[(0,u.jsxs)("div",{className:"col-6 pe-2 position-relative".concat(m?" hovered":""),onMouseEnter:function(){return v(!0)},onMouseLeave:function(){return v(!1)},children:[(0,u.jsxs)("div",{className:"code-importer-input-tools position-absolute",children:[(0,u.jsx)(i.LoadableIcon,{icon:"Vsc.VscDebugStart",onClick:k}),(0,u.jsx)(i.LoadableIcon,{icon:"Bs.BsCodeSlash",onClick:function(){return d(l.Z.process(j))}}),(0,u.jsx)(i.LoadableIcon,{icon:"Ai.AiOutlineClear",onClick:function(){return d("")}}),(0,u.jsx)(i.LoadableIcon,{icon:"Fa.FaRegCopy",onClick:function(){return N(j)}})]}),(0,u.jsx)("textarea",{id:"code-importer-input",className:"c-ComponentImporter__code-input w-100 h-100",value:j,onChange:function(n){return d(n.target.value)},name:"code-importer-input",rows:"20"})]}),(0,u.jsxs)("div",{className:"col-6 ps-2 position-relative".concat(L?" hovered":""),onMouseEnter:function(){return S(!0)},onMouseLeave:function(){return S(!1)},children:[(0,u.jsxs)("div",{className:"code-importer-output-tools position-absolute",children:[(0,u.jsx)(i.LoadableIcon,{icon:"Ri.RiExchangeLine",onClick:function(){var n=(0,t.Z)({},x),e=V&&V.current;e.innerHTML="",n.jsonString=JSON.stringify(JSON.parse(n.jsonString),void 0,2),"string"===n.jsonView?c.Z.render(n.jsonObj,e):e.innerHTML=n.jsonString,"string"===n.jsonView&&c.Z.expandChildren(n.jsonObj),n.jsonView="object"===n.jsonView?"string":"object",f(n)}}),(0,u.jsx)(i.LoadableIcon,{icon:"Ai.AiOutlineClear",onClick:function(){f({jsonString:"",jsonObj:null,jsonView:"object"}),V&&V.current&&(V.current.innerHTML="")}}),(0,u.jsx)(i.LoadableIcon,{icon:"Fa.FaRegCopy",onClick:function(){return N(x.jsonString)}}),"object"===x.jsonView&&(0,u.jsx)(i.LoadableIcon,{icon:"Vsc.VscExpandAll",onClick:function(){return c.Z.expandChildren(x.jsonObj)}}),"object"===x.jsonView&&(0,u.jsx)(i.LoadableIcon,{icon:"Vsc.VscCollapseAll",onClick:function(){return c.Z.collapseChildren(x.jsonObj)}})]}),(0,u.jsx)("pre",{id:"code-importer-output",className:"c-ComponentImporter__code-output w-100 h-100 bg-white",ref:V})]})]})]})}}}]);
//# sourceMappingURL=267.268d255a.chunk.js.map