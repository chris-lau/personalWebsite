import{j as e}from"./jsx-runtime-DA5l6w1L.js";/* empty css                         */import"./iframe-CpHP2Gjh.js";import"./preload-helper-C1FmrZbK.js";const p=({repo:a})=>e.jsxs("div",{className:`gh-repo-card ${a.isRecentlyUpdated?"recently-active":""}`,children:[e.jsxs("div",{className:"gh-card-header",children:[e.jsx("h3",{className:"gh-repo-name",children:e.jsx("a",{href:a.githubUrl,target:"_blank",rel:"noopener noreferrer",children:a.name})}),a.isRecentlyUpdated&&e.jsx("span",{className:"gh-active-badge",title:"Pushed to or updated within the last 30 days",children:"🔥 Active"})]}),e.jsx("p",{className:"gh-repo-desc",children:a.description}),a.topics.length>0&&e.jsx("div",{className:"gh-topic-tags",children:a.topics.slice(0,4).map(r=>e.jsxs("span",{className:"gh-topic-tag",children:["#",r]},r))}),e.jsxs("div",{className:"gh-repo-meta",children:[e.jsxs("div",{className:"gh-meta-left",children:[e.jsxs("span",{className:"gh-lang-badge",children:[e.jsx("span",{className:"gh-lang-dot"}),a.primaryLanguage]}),a.stars>0&&e.jsxs("span",{className:"gh-meta-stat",title:"Stars",children:["⭐ ",a.stars]}),a.forks>0&&e.jsxs("span",{className:"gh-meta-stat",title:"Forks",children:["🍴 ",a.forks]})]}),e.jsx("span",{className:"gh-time-updated",children:a.formattedLastUpdated})]}),e.jsxs("div",{className:"gh-repo-actions",children:[e.jsx("a",{href:a.githubUrl,target:"_blank",rel:"noopener noreferrer",className:"gh-link-button",children:"GitHub ↗"}),a.demoUrl&&e.jsx("a",{href:a.demoUrl,target:"_blank",rel:"noopener noreferrer",className:"gh-link-button live-demo",children:"Live Demo 🌐"})]})]});p.__docgenInfo={description:"",methods:[],displayName:"GitHubRepoCard",props:{repo:{required:!0,tsType:{name:"GitHubRepo"},description:""}}};const m={id:1,name:"personalWebsite",fullName:"chris-lau/personalWebsite",description:"Triple-themed personal website and technical blog engine built with React 18, TypeScript, and Vite.",githubUrl:"https://github.com/chris-lau/personalWebsite",demoUrl:"https://chrislau.dev",stars:24,forks:5,primaryLanguage:"TypeScript",topics:["react","typescript","vite","storybook"],isFork:!1,updatedAt:new Date().toISOString(),pushedAt:new Date().toISOString(),formattedLastUpdated:"2 hours ago",isRecentlyUpdated:!0},y={title:"GitHub/GitHubRepoCard",component:p,tags:["autodocs"]},s={args:{repo:m}},t={args:{repo:{...m,name:"legacy-utility",description:"Older command line utility for log parsing.",demoUrl:null,stars:3,forks:0,primaryLanguage:"Python",isRecentlyUpdated:!1,formattedLastUpdated:"1 year ago"}}};var n,i,o;s.parameters={...s.parameters,docs:{...(n=s.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    repo: baseRepo
  }
}`,...(o=(i=s.parameters)==null?void 0:i.docs)==null?void 0:o.source}}};var d,l,c;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    repo: {
      ...baseRepo,
      name: 'legacy-utility',
      description: 'Older command line utility for log parsing.',
      demoUrl: null,
      stars: 3,
      forks: 0,
      primaryLanguage: 'Python',
      isRecentlyUpdated: false,
      formattedLastUpdated: '1 year ago'
    }
  }
}`,...(c=(l=t.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};const f=["ActiveRepo","StandardRepo"];export{s as ActiveRepo,t as StandardRepo,f as __namedExportsOrder,y as default};
