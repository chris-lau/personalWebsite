import{j as e}from"./jsx-runtime-DA5l6w1L.js";import{L as o,M as c}from"./index-BQHKi3_3.js";import"./iframe-CpHP2Gjh.js";import"./preload-helper-C1FmrZbK.js";import"./index-CjtVO0OQ.js";const n=({post:t})=>e.jsxs("article",{className:"blog-card","data-testid":`blog-card-${t.id}`,children:[e.jsxs("div",{className:"blog-card-meta",children:[e.jsxs("span",{className:"blog-card-date",children:["Updated: ",t.updatedDate]}),e.jsx("span",{className:"blog-card-dot",children:"•"}),e.jsx("span",{className:"blog-card-readtime",children:t.readTime})]}),e.jsx("h3",{className:"blog-card-title",children:e.jsx(o,{to:`/blog/${t.slug}`,children:t.title})}),e.jsx("p",{className:"blog-card-description",children:t.description}),e.jsx("div",{className:"blog-card-tags",children:t.tags.map(r=>e.jsxs("span",{className:"blog-tag",children:["#",r]},r))})]});n.__docgenInfo={description:"",methods:[],displayName:"BlogCard",props:{post:{required:!0,tsType:{name:"BlogPost"},description:""}}};const h={title:"Blog/BlogCard",component:n,decorators:[t=>e.jsx(c,{children:e.jsx("div",{style:{maxWidth:"600px",margin:"20px auto"},children:e.jsx(t,{})})})]},a={args:{post:{id:"demo-post",slug:"demo-post-slug",title:"Demystifying Modern React Architecture",description:"A beginner-friendly deep dive into TypeScript interfaces, static data layers, and dev servers.",updatedDate:"2026-07-26",readTime:"6 min read",tags:["React","TypeScript","Vite"],author:"Chris Lau",content:"Demo content"}}};var s,d,i;a.parameters={...a.parameters,docs:{...(s=a.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    post: {
      id: 'demo-post',
      slug: 'demo-post-slug',
      title: 'Demystifying Modern React Architecture',
      description: 'A beginner-friendly deep dive into TypeScript interfaces, static data layers, and dev servers.',
      updatedDate: '2026-07-26',
      readTime: '6 min read',
      tags: ['React', 'TypeScript', 'Vite'],
      author: 'Chris Lau',
      content: 'Demo content'
    }
  }
}`,...(i=(d=a.parameters)==null?void 0:d.docs)==null?void 0:i.source}}};const x=["Default"];export{a as Default,x as __namedExportsOrder,h as default};
