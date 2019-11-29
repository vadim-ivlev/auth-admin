"use strict";var delayTimeout,model={debug:!1,oauth2email:"",oauth2name:"",oauth2id:"",priv_origin:null,set appurl(e){this.priv_origin=e,document.getElementById("appUrl").innerHTML="&#x21E2;&nbsp;"+e,buildSocialIcons(e+"/oauthproviders"),document.getElementById("graphqlTestLink").href="https://graphql-test.now.sh/?end_point="+e+"/schema&tab_name=auth-proxy"},get appurl(){return this.priv_origin},templatesCache:[],get logined(){return null!=this._loginedUser},urlParams:new URLSearchParams(window.location.search),_loginedUser:null,set loginedUser(e){this._loginedUser=e,document.getElementById("userTab").innerText=e?e.username:"",refreshApp()},get loginedUser(){return this._loginedUser},_selfRegAllowed:!1,set selfRegAllowed(e){this._selfRegAllowed=e,e?(showElements("#selfRegButton"),showElements("#selfRegHelp")):(hideElements("#selfRegButton"),hideElements("#selfRegHelp"))},get selfRegAllowed(){return this._selfRegAllowed},_captchaRequired:!1,set captchaRequired(e){this._captchaRequired=e,e?showElements("#captcha"):hideElements("#captcha")},get captchaRequired(){return this._captchaRequired},_authRoles:null,set authRoles(e){this._authRoles=e,this.isAdmin?(showElements("#usersTab"),showElements("#rolesTab"),showElements("#graphqlTest"),showElements("#btnNewApp"),showElements("#settingsButton")):(hideElements("#usersTab"),hideElements("#rolesTab"),hideElements("#graphqlTest"),hideElements("#btnNewApp"),hideElements("#settingsButton")),renderTemplateFile("mustache/apps.html",model,".app-search-results")},get authRoles(){return this._authRoles},get isAdmin(){return!!model.authRoles&&model.authRoles.some(e=>"authadmin"==e.rolename||"auditor"==e.rolename)},_user:null,set user(e){this._user=e,renderTemplateFile("mustache/user.html",model,"#userPage")},get user(){return this._user},_app:null,set app(e){this._app=e,renderTemplateFile("mustache/app.html",model,"#appPage")},get app(){return this._app},_users:null,set users(e){this._users=e,renderTemplateFile("mustache/users.html",model,".user-search-results")},get users(){return this._users},_apps:null,set apps(e){this._apps=e,renderTemplateFile("mustache/apps.html",model,".app-search-results")},get apps(){return this._apps},all_app_options:null,all_user_options:null,_allApps:null,set allApps(e){this._allApps=e,this.all_app_options=createOptions(e,"appname","description","url"),document.querySelector("#allAppsDataList").innerHTML=this.all_app_options},get allApps(){return this._allApps},_allUsers:null,set allUsers(e){this._allUsers=e,this.all_user_options=createOptions(e,"username","fullname","email"),document.querySelector("#allUsersDataList").innerHTML=this.all_user_options},get allUsers(){return this._allUsers},_app_user_roles:null,set app_user_roles(e){this._app_user_roles=e,renderTemplateFile("mustache/roles.html",model,".app-user-roles-results")},get app_user_roles(){return this._app_user_roles},_params:null,set params(e){this._params=e,renderTemplateFile("mustache/params.html",model,"#paramsPage")},get params(){return this._params},_appstat:null,set appstat(e){this._appstat=e,document.getElementById("gauges")&&(document.getElementById("divSys").innerText=e.sys+" Mb",document.getElementById("divAlloc").innerText="allocated: "+e.alloc+" Mb",document.getElementById("divTotalAlloc").innerText="total allocated: "+e.total_alloc+" Mb",drawGauge("req / day",e.requests_per_day,0,"divDay"),drawGauge("req / hour",e.requests_per_hour,0,"divHour"),drawGauge("req / min",e.requests_per_minute,0,"divMinute"),drawGauge("req / sec",e.requests_per_second,0,"divSecond"))},get appstat(){return this._appstat}};function createOptions(e,t,n,r){var a=[];return e&&e.forEach((function(e){a.push(`<option value="${e[t]}">${e[n]} &nbsp;&nbsp;&nbsp; ${e[r]?e[r]:""}</option>`)})),a.join("")}function highlightTab(e){removeClass(".tab","underlined"),addClass("#"+e.split("/")[0]+"Tab","underlined")}function showPage(e,t){stopGettingAppstat();var n=e.split("/"),r=n[0],a=n[1];highlightTab(e),hideElements(".page"),showElements("#"+r+"Page");var s=document.querySelector("#"+r+'Page input[type="text"]');return s&&s.focus(),t||history.state&&history.state.pageid==e||history.pushState({pageid:e},e,"#"+e),a&&("app"==r&&getApp(a),"user"==r&&getUser(a)),"params"==r&&startGettingAppstat(),!1}function renderTemplateFile(e,t,n){var r=model.templatesCache[e];function a(e){var r=Mustache.render(e,t);document.querySelector(n).innerHTML=r}r?a(r):fetch(e).then(e=>e.text()).then(t=>{model.templatesCache[e]=t,a(t)})}function delayFunc(e,t=500){return clearTimeout(delayTimeout),delayTimeout=setTimeout(e,t),!1}function searchApps(){return document.querySelector("#chkLocalSearch").checked?delayFunc(searchAppsInModel,100):delayFunc(formListAppSubmit)}function searchAppsInModel(){if(!model.allApps)return;var e=document.querySelector("#formListApp input[name='search']").value.trim().replace(" ",".*"),t=new RegExp(e,"i");let n=model.allApps.filter(e=>{var n=Object.values(e).join(" ");return t.test(n)});return model.apps=n,!1}function sortAppsBy(e){return!!model._allApps&&(model._allApps.sort((t,n)=>t[e]+t.appname>n[e]+n.appname?1:-1),model._apps.sort((t,n)=>t[e]+t.appname>n[e]+n.appname?1:-1),model.apps=model._apps,!1)}function searchUsers(){return document.querySelector("#chkLocalSearch").checked?delayFunc(searchUsersInModel,100):delayFunc(formListUserSubmit)}function searchUsersInModel(){if(!model.allUsers)return;var e=document.querySelector("#formListUser input[name='search']").value.trim().replace(" ",".*"),t=new RegExp(e,"i");let n=model.allUsers.filter(e=>t.test(Object.values(e).join(" ")));return model.users=n,!1}function sortUsersBy(e,t=!0){return!!model._allUsers&&(t?(model._allUsers.sort((t,n)=>t[e]+t.username>n[e]+n.username?1:-1),model._users.sort((t,n)=>t[e]+t.username>n[e]+n.username?1:-1)):(model._allUsers.sort((t,n)=>t[e]>n[e]?1:-1),model._users.sort((t,n)=>t[e]>n[e]?1:-1)),model.users=model._users,!1)}function doGraphQLRequest(e,t,n){fetch(model.appurl+"/graphql",{method:"POST",credentials:"include",body:JSON.stringify({query:e,variables:{}})}).then(e=>{if(e.ok)return e.json();new Error(e)}).then(e=>{if(model.debug&&console.log(e),e.errors)return model.debug&&console.log(e.errors[0].message),void(n&&(document.getElementById(n).innerText=e.errors[0].message));t&&t(e)}).catch(e=>console.error(e))}function loginGraphQLFormSubmit(e){return e&&e.preventDefault(),doGraphQLRequest(`\n    query {\n        login(\n        username: "${document.getElementById("loginUsername").value}",\n        password: "${document.getElementById("loginPassword").value}",\n        captcha: "${document.getElementById("loginCaptcha").value}"\n        )\n        }    \n    `,(function(e){getLoginedUser()}),"loginError"),clearLoginForm(),!1}function logoutGraphQLFormSubmit(e){e&&e.preventDefault();return doGraphQLRequest("\n    query {\n        logout {\n            message\n            username\n          }\n        }\n    ",(function(e){model.loginedUser=null,model.oauth2email="",model.oauth2id="",model.oauth2name="",refreshApp()})),!1}function isSelfRegAllowed(e){e&&e.preventDefault();return doGraphQLRequest(" query { is_selfreg_allowed }",(function(e){model.selfRegAllowed=e.data.is_selfreg_allowed})),!1}function isCaptchaRequired(e){return e&&e.preventDefault(),doGraphQLRequest(`  query { is_captcha_required(  username: "${document.getElementById("loginUsername").value}" ) \n        {\n            is_required \n            path\n        } \n    } `,(function(e){model.captchaRequired=e.data.is_captcha_required.is_required,model.captchaRequired&&(getNewCaptcha(),model.debug&&console.log("Captcha IS required"))})),!1}function generateNewPassword(e){return e&&e.preventDefault(),doGraphQLRequest(`\n    mutation {\n        generate_password(\n        username: "${document.getElementById("loginUsername").value}"\n        ) \n        }\n    `,(function(e){alert(e.data.generate_password),refreshApp()})),!1}function getLoginedUser(){model.loginedUser=null;return doGraphQLRequest("\n    query {\n        get_logined_user {\n            description\n            email\n            fullname\n            username\n            disabled\n            id\n        }\n    }\n    ",(function(e){model.loginedUser=e.data.get_logined_user,getAuthRoles(model.loginedUser.username),getUser(model.loginedUser.username)})),!1}function getAuthRoles(e){return model.authRoles=null,doGraphQLRequest(`\n    query {\n        list_app_user_role(\n            appname: "auth",\n            username: "${e}"\n            ) {\n                rolename\n            }\n        }\n        `,(function(e){model.authRoles=e.data.list_app_user_role})),!1}function getParams(){model.params=null;return doGraphQLRequest("\n    query {\n        get_params {\n            max_attempts\n            reset_time\n            selfreg\n            use_captcha\n          }\n        }\n    ",(function(e){var t=e.data.get_params;model.params=t,getAppstatRest()})),!1}function setParams(e){return e&&e.preventDefault(),doGraphQLRequest(`\n    query {\n        set_params(\n        selfreg:      ${document.querySelector("#formParams input[name='selfreg']").checked},\n        use_captcha:  ${document.querySelector("#formParams input[name='use_captcha']").checked},\n        max_attempts: ${document.querySelector("#formParams input[name='max_attempts']").value},\n        reset_time:   ${document.querySelector("#formParams input[name='reset_time']").value}\n        ) {\n            max_attempts\n            reset_time\n            selfreg\n            use_captcha\n          }\n        }\n    `,(function(e){model.params=e.data.set_params,alert("params saving success")}),"paramsError"),!1}function getAppstatRest(e){return e&&e.preventDefault(),getAppstatRest.counter=void 0===getAppstatRest.counter?0:getAppstatRest.counter+1,console.log("getAppstatRest.counter = ",getAppstatRest.counter),fetch(model.appurl+"/stat").then(e=>e.json()).then((function(e){var t=e;model.appstat=t})).catch(e=>{console.log("fetch error:",e)}),!1}function startGettingAppstat(){clearInterval(model.statInterval),getAppstatRest(),model.statInterval=setInterval(getAppstatRest,3e3),console.log("startGettingAppstat")}function stopGettingAppstat(){clearInterval(model.statInterval),console.log("stopGettingAppstat")}function formListUserSubmit(e){return e&&e.preventDefault(),model.users=null,doGraphQLRequest(`\n    query {\n        list_user(\n        search: "${document.querySelector("#formListUser input[name='search']").value}",\n        order: "fullname ASC"\n        ) {\n            length\n            list {\n              description\n              email\n              fullname\n              username\n              disabled\n              id\n            }\n          }\n        }        \n    `,(function(e){model.users=e.data.list_user.list})),!1}function updateUser(e){e&&e.preventDefault();let t=document.querySelector("#formUser input[name='old_username']").value,n=document.querySelector("#formUser input[name='username']").value,r=document.querySelector("#formUser input[name='password']").value,a=document.querySelector("#formUser input[name='email']").value,s=document.querySelector("#formUser input[name='fullname']").value,l=document.querySelector("#formUser *[name='description']").value,o=document.querySelector("#formUser input[name='disabled']").value;return doGraphQLRequest(`\n    mutation {\n        update_user(\n        old_username: "${t}",\n        username: "${n}",\n        password: "${r}",\n        email: "${a}",\n        fullname: "${s}",\n        description: "${l}",\n        disabled: ${o}\n        ) {\n            description\n            email\n            fullname\n            username\n            disabled\n            id\n          }\n\n        }\n    `,(function(e){alert("update_user success"),refreshData(),model.user=e.data.update_user,getUser(n)}),"userError"),!1}function createUser(e){e&&e.preventDefault();let t=document.querySelector("#formUser input[name='username']").value,n=document.querySelector("#formUser input[name='password']").value,r=document.querySelector("#formUser input[name='email']").value,a=document.querySelector("#formUser input[name='fullname']").value,s=document.querySelector("#formUser *[name='description']").value,l=document.querySelector("#formUser input[name='disabled']").value;return doGraphQLRequest(`\n    mutation {\n        create_user(\n        username: "${t}",\n        password: "${n}",\n        email: "${r}",\n        fullname: "${a}",\n        description: "${s}",\n        disabled: ${l}\n        ) {\n            description\n            email\n            fullname\n            username\n            disabled\n            id\n          }\n\n        }\n    `,(function(e){alert("create_user success"),refreshData(),model.user=e.data.create_user,model.logined||(alert(`"${t}" is created.`),showPage("login",!0)),getUser(t)}),"userError"),!1}function getUser(e){return model.user=null,doGraphQLRequest(`\n    query {\n        get_user(\n        username: "${e}"\n        ) {\n            description\n            email\n            fullname\n            username\n            disabled\n            id\n          }\n        \n        list_app_user_role(\n        username: "${e}"\n        ) {\n            app_description\n            appname\n            rolename\n            username\n          }\n        \n        }\n\n    `,(function(e){var t=e.data.get_user;t.apps=groupApps(e.data.list_app_user_role),model.user=t})),!1}function groupApps(e){if(!e)return[];let t={};for(let n of e)t[n.appname]||(t[n.appname]=[]),t[n.appname].push(n);let n=[];for(let[e,r]of Object.entries(t)){let t={};t.appname=e,t.app_description=r[0].app_description,t.items=r,n.push(t)}return n}function deleteUser(e){return doGraphQLRequest(`\n    mutation {\n        delete_user(\n        username: "${e}"\n        ) {\n            username\n          }\n        }\n    `,(function(e){model.user=null,refreshData(),showPage("users")})),!1}function formListAppSubmit(e){return e&&e.preventDefault(),model.apps=null,doGraphQLRequest(`\n    query {\n        list_app(\n        search: "${document.querySelector("#formListApp input[name='search']").value}",\n        order: "description ASC"\n        ) {\n            length\n            list {\n              appname\n              description\n              url\n              rebase\n              public\n            }\n          }\n        }    `,(function(e){model.apps=e.data.list_app.list})),!1}function createApp(e){e&&e.preventDefault();let t=document.querySelector("#formApp input[name='appname']").value,n=document.querySelector("#formApp input[name='url']").value,r=document.querySelector("#formApp input[name='description']").value,a=document.querySelector("#formApp input[name='rebase']").value,s=document.querySelector("#formApp input[name='public']").value;return doGraphQLRequest(`\n    mutation {\n        create_app(\n        appname: "${t}",\n        url: "${n}",\n        description: "${r}",\n        rebase: "${a}",\n        public: "${s}"\n        ) {\n            description\n            appname\n            url\n            rebase\n            public\n          }\n\n        }\n    `,(function(e){alert("create_app success"),refreshData(),model.app=e.data.create_app,getApp(t)}),"appError"),!1}function updateApp(e,t="create_app"){e&&e.preventDefault();let n=document.querySelector("#formApp input[name='old_appname']").value,r=document.querySelector("#formApp input[name='appname']").value,a=document.querySelector("#formApp input[name='url']").value,s=document.querySelector("#formApp input[name='description']").value,l=document.querySelector("#formApp input[name='rebase']").value,o=document.querySelector("#formApp input[name='public']").value;return doGraphQLRequest(`\n    mutation {\n        update_app(\n        old_appname: "${n}",\n        appname: "${r}",\n        url: "${a}",\n        description: "${s}",\n        rebase: "${l}",\n        public: "${o}"\n        ) {\n            description\n            appname\n            url\n            rebase\n            public\n          }\n\n        }\n    `,(function(e){alert("update_app success"),refreshData(),model.app=e.data.update_app,getApp(r)}),"appError"),!1}function getApp(e){return model.app=null,doGraphQLRequest(`\n    query {\n        get_app(\n        appname: "${e}"\n        ) {\n            description\n            appname\n            url\n            rebase\n            public\n          }\n        \n        list_app_user_role(\n        appname: "${e}"\n        ) {\n            appname\n            rolename\n            user_fullname\n            user_disabled\n            username\n          }\n        \n        }\n\n    `,(function(e){var t=e.data.get_app;t.users=groupUsers(e.data.list_app_user_role),model.app=t})),!1}function groupUsers(e){let t={};for(let n of e)t[n.username]||(t[n.username]=[]),t[n.username].push(n);let n=[];for(let[e,r]of Object.entries(t)){let t={};t.username=e,t.user_fullname=r[0].user_fullname,t.items=r,n.push(t)}return n}function deleteApp(e){return doGraphQLRequest(`\n    mutation {\n        delete_app(\n        appname: "${e}"\n        ) {\n            appname\n          }\n        }\n    `,(function(e){model.app=null,refreshData(),showPage("apps")})),!1}function getAllApps(e){e&&e.preventDefault(),model.allApps=null;return doGraphQLRequest('\n    query {\n        list_app(\n        order: "appname ASC"\n        ) {\n            length\n            list {\n              appname\n              description\n              url\n              rebase\n              public \n            }\n          }\n        }    ',(function(e){model.allApps=e.data.list_app.list})),!1}function getAllUsers(e){e&&e.preventDefault(),model.allUsers=null;return doGraphQLRequest('\n    query {\n        list_user(\n        order: "fullname ASC"\n        ) {\n            length\n            list {\n              username\n              fullname\n              email\n              description\n              disabled\n              id\n            }\n          }\n        }    ',(function(e){model.allUsers=e.data.list_user.list})),!1}function formListRoleSubmit(e){e&&e.preventDefault&&e.preventDefault(),model.app_user_roles=null;let t=document.getElementById("allApps").value,n=document.getElementById("allUsers").value;if(t&&n)return doGraphQLRequest(`\n    query {\n        list_app_user_role(\n        appname: "${t}",\n        username: "${n}"\n        ) {\n            rolename\n          }\n        }        \n        `,(function(e){model.app_user_roles=e.data.list_app_user_role})),!1}function modifyRole(e,t,n,r,a){if(t&&n&&r)return doGraphQLRequest(`\n    mutation {\n        ${e}_app_user_role(\n        appname: "${t}",\n        username: "${n}",\n        rolename: "${r}"\n        ) {\n            rolename\n            appname\n            username\n          }\n        }\n    `,(function(e){a&&a()})),!1}function refreshRoles(){let e=document.getElementById("allUsers").value;if(e){let t=document.querySelector(`#allUsersDataList>option[value='${e}']`).innerText;document.getElementById("userInfo").innerText=t}let t=document.getElementById("allApps").value;if(t){let e=document.querySelector(`#allAppsDataList>option[value='${t}']`).innerText;document.getElementById("appInfo").innerText=e}e&&t&&formListRoleSubmit()}function filterRows(e,t){var n=t.toLowerCase();document.querySelectorAll(e).forEach(e=>{-1==e.innerText.toLowerCase().indexOf(n)?e.classList.add("hidden"):e.classList.remove("hidden")})}function hideElements(e){document.querySelectorAll(e).forEach(e=>e.classList.add("hidden"))}function showElements(e){document.querySelectorAll(e).forEach(e=>e.classList.remove("hidden"))}function addClass(e,t){document.querySelectorAll(e).forEach(e=>e.classList.add(t))}function removeClass(e,t){document.querySelectorAll(e).forEach(e=>e.classList.remove(t))}function hidePassword(){document.querySelector("#formUser input[name='password']").setAttribute("type","password")}function showPassword(){document.querySelector("#formUser input[name='password']").setAttribute("type","text")}function removeQueryStringFromBrowserURL(){let e=document.location.href.replace(/\?.*/,"")+"?url="+model.appurl;history.replaceState(null,null,e)}function generatePassword(){document.querySelector("#formUser input[name='password']").value=function(e){let t=e=>e[Math.floor(Math.random()*e.length)];var n=["bcdfghjklmnpqrstvwxz","aeiou"],r="";for(let a=0;a<e;a++)r+=t(n[a%n.length]);return r}(9)}function buildSocialIcons(e){fetch(e).then(e=>e.json()).then(e=>renderOauthProvidersJSON(e)).catch(e=>{console.log("fetch error:",e)})}function renderOauthProvidersJSON(e){let t=document.getElementById("socialIcons");if(!t)return;t.innerHTML="";let n=[];for(let[t,r]of Object.entries(e))n.push(`\n        <div class="social-element">\n        <a class="button button-clear" title="login via ${t}" href="${model.appurl+r[0]}">\n        ${t}\n        <br>\n        <img class="social-icon" src="images/${t}.svg">\n        </a>\n        \x3c!--\n        <br>\n        <a class="social-logout" title="logout from ${t}" href="${model.appurl+r[1]}">logout</a>\n        --\x3e\n        </div>\n        \n        \n        `);n.length>0?(t.innerHTML='<div class="socialHeader">войти через</div>'+n.join(" "),showElements("#selfRegHelpText"),removeClass("#socialIcons","transparent")):hideElements("#selfRegHelpText")}function getNewCaptcha(){let e=model.appurl+"/captcha?"+(new Date).getTime();return document.getElementById("captchaImg").src=e,!1}model.statInterval=null;var gauges={};function drawGauge(e,t,n,r){if(!google)return;var a=document.getElementById(r);if(!a)return;gauges[e]||(gauges[e]={},gauges[e].data=google.visualization.arrayToDataTable([["Label","Value"],[e,0]])),""==a.innerHTML&&(gauges[a]=a,gauges[e].chart=new google.visualization.Gauge(a),console.log("Redraw gauge container:",r)),gauges[e].data.setValue(0,1,t);let s=n||getUpperLimit(t);var l={height:120,animation:{duration:700},greenFrom:0,greenTo:.2*s,yellowFrom:.8*s,yellowTo:.9*s,redFrom:.9*s,redTo:s,minorTicks:5,max:s};gauges[e].chart.draw(gauges[e].data,l)}function getUpperLimit(e){for(var t=10;e>t;)t*=10;return t}function clearLoginForm(){document.getElementById("loginUsername").value="",document.getElementById("loginPassword").value="",document.getElementById("loginCaptcha").value="",document.getElementById("loginError").innerText="",document.getElementById("socialLoginError").innerHTML="",document.getElementById("oauth2email").innerHTML=""}function logout(){return logoutGraphQLFormSubmit(),clearLoginForm(),showPage("login",!0),isSelfRegAllowed(),model.captchaRequired=!1,!1}function refreshData(){if(model.logined)getAllApps(),getAllUsers(),formListAppSubmit(),formListUserSubmit();else{for(const e of Object.keys(model))e.startsWith("_")&&(model[e]=null);isSelfRegAllowed()}}function getCurrentPageID(){var e=location.hash.slice(1);return!e||e.includes("=")?"apps":e}function refreshApp(){if(refreshData(),model.logined){showPage(getCurrentPageID()),showElements("#menu"),hideElements("#menuUnlogined")}else showPage("login",!0),hideElements("#menu"),showElements("#menuUnlogined")}function setAppParams(){model.oauth2email=model.urlParams.get("oauth2email")||"",model.oauth2name=model.urlParams.get("oauth2name")||"",model.oauth2id=model.oauth2email.replace(/@.*/,""),document.getElementById("oauth2email").innerHTML=model.oauth2email;var e=model.urlParams.get("url"),t=model.urlParams.get("css"),n=model.urlParams.get("oauth2error"),r=model.urlParams.get("alert");r&&alert(r),document.getElementById("socialLoginError").innerHTML=n,t&&(document.getElementById("theme").href=t),model.appurl=e||"https://auth-proxy.rg.ru",removeQueryStringFromBrowserURL(),model.captchaRequired=!1}function init(){renderTemplateFile("mustache/params.html",model,"#paramsPage"),google.charts.load("current",{packages:["gauge"]}),google.charts.setOnLoadCallback(getAppstatRest),setAppParams(),getLoginedUser(),refreshApp()}window.onhashchange=function(e){model.debug&&console.log("onhashchange",e);var t=e.newURL.split("#")[1];t&&showPage(t)},init();
//# sourceMappingURL=bundle.js.map
