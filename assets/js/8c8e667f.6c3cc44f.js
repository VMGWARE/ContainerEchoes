"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[853],{7256:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>a,contentTitle:()=>o,default:()=>h,frontMatter:()=>r,metadata:()=>l,toc:()=>c});var i=t(5893),s=t(1151);const r={sidebar_position:2},o="Setting Up",l={id:"setup",title:"Setting Up",description:"Prerequisites",source:"@site/docs/20-setup.md",sourceDirName:".",slug:"/setup",permalink:"/ContainerEchoes/docs/setup",draft:!1,unlisted:!1,editUrl:"https://github.com/VMGWARE/ContainerEchoes/tree/master/docs/docs/20-setup.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2},sidebar:"docsSidebar",previous:{title:"Introduction",permalink:"/ContainerEchoes/docs/intro"},next:{title:"Environment Variables",permalink:"/ContainerEchoes/docs/env-vars"}},a={},c=[{value:"Prerequisites",id:"prerequisites",level:2},{value:"Installation Steps",id:"installation-steps",level:2},{value:"Server Setup",id:"server-setup",level:3},{value:"Agent Setup",id:"agent-setup",level:3},{value:"Initial Configuration",id:"initial-configuration",level:2},{value:"Next Steps",id:"next-steps",level:2}];function d(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",ul:"ul",...(0,s.a)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h1,{id:"setting-up",children:"Setting Up"}),"\n",(0,i.jsx)(n.h2,{id:"prerequisites",children:"Prerequisites"}),"\n",(0,i.jsx)(n.p,{children:"Before installing Container Echoes, ensure you have the following:"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"Docker installed and running"}),"\n",(0,i.jsx)(n.li,{children:"Node.js (version 12 or later)"}),"\n",(0,i.jsx)(n.li,{children:"PostgreSQL database"}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"installation-steps",children:"Installation Steps"}),"\n",(0,i.jsx)(n.h3,{id:"server-setup",children:"Server Setup"}),"\n",(0,i.jsxs)(n.ol,{children:["\n",(0,i.jsx)(n.li,{children:"Clone the Container Echoes repository."}),"\n",(0,i.jsx)(n.li,{children:"Navigate to the server directory."}),"\n",(0,i.jsxs)(n.li,{children:["Run ",(0,i.jsx)(n.code,{children:"npm install"})," to install dependencies."]}),"\n",(0,i.jsxs)(n.li,{children:["Configure the database connection in ",(0,i.jsx)(n.code,{children:"config.js"}),"."]}),"\n",(0,i.jsxs)(n.li,{children:["Start the server using ",(0,i.jsx)(n.code,{children:"npm start"}),"."]}),"\n"]}),"\n",(0,i.jsx)(n.h3,{id:"agent-setup",children:"Agent Setup"}),"\n",(0,i.jsxs)(n.ol,{children:["\n",(0,i.jsx)(n.li,{children:"On each Docker host, pull the Container Echoes agent image from the Docker registry."}),"\n",(0,i.jsx)(n.li,{children:"Run the agent container with the appropriate environment variables set."}),"\n",(0,i.jsx)(n.li,{children:"Verify connectivity with the server."}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"initial-configuration",children:"Initial Configuration"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["Set environment variables as per your setup requirements (see ",(0,i.jsx)(n.a,{href:"/ContainerEchoes/docs/env-vars",children:"Environment Variables"}),")."]}),"\n",(0,i.jsx)(n.li,{children:"Configure log paths and retention policies through the web interface."}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"next-steps",children:"Next Steps"}),"\n",(0,i.jsxs)(n.p,{children:["With Container Echoes installed, the next step is to configure your environment variables as detailed in ",(0,i.jsx)(n.a,{href:"env-vars",children:"Environment Variables"}),"."]})]})}function h(e={}){const{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}},1151:(e,n,t)=>{t.d(n,{Z:()=>l,a:()=>o});var i=t(7294);const s={},r=i.createContext(s);function o(e){const n=i.useContext(r);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function l(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),i.createElement(r.Provider,{value:n},e.children)}}}]);