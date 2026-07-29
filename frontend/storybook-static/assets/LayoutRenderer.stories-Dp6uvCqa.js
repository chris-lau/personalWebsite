import{j as e}from"./jsx-runtime-DA5l6w1L.js";import{u as d,T as h}from"./ThemeContext-DKeLIHLs.js";import{A as p}from"./AsciiLayout-C2z8EbXs.js";import{C as u}from"./CliLayout-B9kQH9bf.js";import{M as s}from"./ModernLayout-CwXKDioo.js";import{M as l}from"./index-BQHKi3_3.js";import"./iframe-CpHP2Gjh.js";import"./preload-helper-C1FmrZbK.js";import"./ThemeToggle-DFux3qEP.js";import"./index-CjtVO0OQ.js";const y={ascii:p,cli:u,modern:s},i=({children:o})=>{const{theme:m}=d(),c=y[m]??s;return e.jsx(c,{children:o})};i.__docgenInfo={description:"",methods:[],displayName:"LayoutRenderer",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""}}};const w={title:"Layout/LayoutRenderer",component:i,decorators:[o=>e.jsx(h,{children:e.jsx(l,{children:e.jsx(o,{})})})]},t={args:{children:e.jsxs("div",{children:[e.jsx("h2",{children:"Dynamic Theme Layout Demo"}),e.jsx("p",{children:"Click the mode toggle button in the header above to watch the entire layout instantly switch between ASCII and CLI themes!"})]})}};var r,a,n;t.parameters={...t.parameters,docs:{...(r=t.parameters)==null?void 0:r.docs,source:{originalSource:`{
  args: {
    children: <div>
        <h2>Dynamic Theme Layout Demo</h2>
        <p>Click the mode toggle button in the header above to watch the entire layout instantly switch between ASCII and CLI themes!</p>
      </div>
  }
}`,...(n=(a=t.parameters)==null?void 0:a.docs)==null?void 0:n.source}}};const A=["Default"];export{t as Default,A as __namedExportsOrder,w as default};
