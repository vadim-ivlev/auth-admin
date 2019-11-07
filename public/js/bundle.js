"use strict";var delayTimeout,model={debug:!0,oauth2email:"",oauth2name:"",oauth2id:"",priv_origin:null,set origin(e){this.priv_origin=e,document.getElementById("appUrl").innerHTML="&#x21E2;&nbsp;"+e,buildSocialIcons(e+"/oauthproviders"),document.getElementById("graphqlTestLink").href="https://graphql-test.now.sh/?end_point="+e+"/schema&tab_name=auth-proxy"},get origin(){return this.priv_origin},templatesCache:[],get logined(){return null!=this._loginedUser},urlParams:new URLSearchParams(window.location.search),_loginedUser:null,set loginedUser(e){this._loginedUser=e,document.getElementById("userTab").innerText=e?e.username:"",refreshApp()},get loginedUser(){return this._loginedUser},_selfRegAllowed:!1,set selfRegAllowed(e){this._selfRegAllowed=e,e?(showElements("#selfRegButton"),showElements("#selfRegHelp")):(hideElements("#selfRegButton"),hideElements("#selfRegHelp"))},get selfRegAllowed(){return this._selfRegAllowed},_captchaRequired:!1,set captchaRequired(e){this._captchaRequired=e,e?showElements("#captcha"):hideElements("#captcha")},get captchaRequired(){return this._captchaRequired},_authRoles:null,set authRoles(e){this._authRoles=e,this.isAdmin?(showElements("#usersTab"),showElements("#rolesTab"),showElements("#graphqlTest"),showElements("#btnNewApp"),showElements("#settingsButton")):(hideElements("#usersTab"),hideElements("#rolesTab"),hideElements("#graphqlTest"),hideElements("#btnNewApp"),hideElements("#settingsButton")),renderPage("apps",".app-search-results")},get authRoles(){return this._authRoles},get isAdmin(){return!!model.authRoles&&model.authRoles.some(e=>"authadmin"==e.rolename)},_user:null,set user(e){this._user=e,renderPage("user","#userPage")},get user(){return this._user},_app:null,set app(e){this._app=e,renderPage("app","#appPage")},get app(){return this._app},_users:null,set users(e){this._users=e,renderPage("users",".user-search-results")},get users(){return this._users},_apps:null,set apps(e){this._apps=e,renderPage("apps",".app-search-results")},get apps(){return this._apps},all_app_options:null,all_user_options:null,_allApps:null,set allApps(e){this._allApps=e,this.all_app_options=createOptions(e,"appname","description","url"),document.querySelector("#allAppsDataList").innerHTML=this.all_app_options},get allApps(){return this._allApps},_allUsers:null,set allUsers(e){this._allUsers=e,this.all_user_options=createOptions(e,"username","fullname","email"),document.querySelector("#allUsersDataList").innerHTML=this.all_user_options},get allUsers(){return this._allUsers},_app_user_roles:null,set app_user_roles(e){this._app_user_roles=e,renderPage("roles",".app-user-roles-results")},get app_user_roles(){return this._app_user_roles},_params:null,set params(e){this._params=e,renderPage("params","#paramsPage")},get params(){return this._params},_appstat:null,set appstat(e){this._appstat=e,document.getElementById("preAppstat")&&(document.getElementById("preAppstat").innerText=JSON.stringify(e,null,2))},get appstat(){return this._appstat}};function createOptions(e,n,t,r){var a=[];return e&&e.forEach((function(e){a.push(`<option value="${e[n]}">${e[t]} &nbsp;&nbsp;&nbsp; ${e[r]?e[r]:""}</option>`)})),a.join("")}function highlightTab(e){removeClass(".tab","underlined"),addClass("#"+e.split("/")[0]+"Tab","underlined")}function showPage(e,n){var t=e.split("/"),r=t[0],a=t[1];highlightTab(e),hideElements(".page"),showElements("#"+r+"Page");var s=document.querySelector("#"+r+'Page input[type="text"]');return s&&s.focus(),n||history.state&&history.state.pageid==e||history.pushState({pageid:e},e,"#"+e),a&&("app"==r&&getApp(a),"user"==r&&getUser(a)),!1}function renderTemplateFile(e,n,t){function r(e){var r=Mustache.render(e,n);document.querySelector(t).innerHTML=r}var a=model.templatesCache[e];if(a)return r(a),void console.info("from cache:",e);fetch(e).then(e=>e.text()).then(n=>{model.templatesCache[e]=n,r(n)})}function renderPage(e,n){renderTemplateFile("mustache/"+e+".html",model,n)}function alertOnError(e,n){alert(n,e)}function delayFunc(e,n=500){return clearTimeout(delayTimeout),delayTimeout=setTimeout(e,n),!1}function searchApps(){return document.querySelector("#chkLocalSearch").checked?delayFunc(searchAppsInModel,100):delayFunc(formListAppSubmit)}function searchAppsInModel(){if(!model.allApps)return;var e=document.querySelector("#formListApp input[name='search']").value.trim().replace(" ",".*"),n=new RegExp(e,"i");let t=model.allApps.filter(e=>{var t=Object.values(e).join(" ");return n.test(t)});return model.apps=t,!1}function sortAppsBy(e){return!!model._allApps&&(model._allApps.sort((n,t)=>n[e]+n.appname>t[e]+t.appname?1:-1),model._apps.sort((n,t)=>n[e]+n.appname>t[e]+t.appname?1:-1),model.apps=model._apps,!1)}function searchUsers(){return document.querySelector("#chkLocalSearch").checked?delayFunc(searchUsersInModel,100):delayFunc(formListUserSubmit)}function searchUsersInModel(){if(!model.allUsers)return;var e=document.querySelector("#formListUser input[name='search']").value.trim().replace(" ",".*"),n=new RegExp(e,"i");let t=model.allUsers.filter(e=>n.test(Object.values(e).join(" ")));return model.users=t,!1}function sortUsersBy(e){return!!model._allUsers&&(model._allUsers.sort((n,t)=>n[e]+n.username>t[e]+t.username?1:-1),model._users.sort((n,t)=>n[e]+n.username>t[e]+t.username?1:-1),model.users=model._users,!1)}function doGraphQLRequest(e,n,t){fetch(model.origin+"/graphql",{method:"POST",credentials:"include",body:JSON.stringify({query:e,variables:{}})}).then(e=>{if(e.ok)return e.json();new Error(e)}).then(e=>{if(model.debug&&console.log(e),e.errors)return model.debug&&console.log(e.errors[0].message),void(t&&(document.getElementById(t).innerText=e.errors[0].message));n&&n(e)}).catch(e=>console.error(e))}function loginGraphQLFormSubmit(e){return e&&e.preventDefault(),doGraphQLRequest(`\n    query {\n        login(\n        username: "${document.getElementById("loginUsername").value}",\n        password: "${document.getElementById("loginPassword").value}",\n        captcha: "${document.getElementById("loginCaptcha").value}"\n        )\n        }    \n    `,(function(e){getLoginedUser()}),"loginError"),clearLoginForm(),!1}function logoutGraphQLFormSubmit(e){e&&e.preventDefault();return doGraphQLRequest("\n    query {\n        logout {\n            message\n            username\n          }\n        }\n    ",(function(e){model.loginedUser=null,model.oauth2email="",model.oauth2id="",model.oauth2name="",refreshApp()})),!1}function isSelfRegAllowed(e){e&&e.preventDefault();return doGraphQLRequest(" query { is_selfreg_allowed }",(function(e){model.selfRegAllowed=e.data.is_selfreg_allowed})),!1}function isCaptchaRequired(e){return e&&e.preventDefault(),doGraphQLRequest(`  query { is_captcha_required(  username: "${document.getElementById("loginUsername").value}" ) \n        {\n            is_required \n            path\n        } \n    } `,(function(e){model.captchaRequired=e.data.is_captcha_required.is_required,model.captchaRequired&&(getNewCaptcha(),model.debug&&console.log("Captcha IS required"))})),!1}function generateNewPassword(e){return e&&e.preventDefault(),doGraphQLRequest(`\n    mutation {\n        generate_password(\n        username: "${document.getElementById("loginUsername").value}"\n        ) \n        }\n    `,(function(e){alert(e.data.generate_password),refreshApp()})),!1}function getLoginedUser(){model.loginedUser=null;return doGraphQLRequest("\n    query {\n        get_logined_user {\n            description\n            email\n            fullname\n            username\n            disabled\n        }\n    }\n    ",(function(e){model.loginedUser=e.data.get_logined_user,getAuthRoles(model.loginedUser.username),getUser(model.loginedUser.username)})),!1}function getAuthRoles(e){return model.authRoles=null,doGraphQLRequest(`\n    query {\n        list_app_user_role(\n            appname: "auth",\n            username: "${e}"\n            ) {\n                rolename\n            }\n        }\n        `,(function(e){model.authRoles=e.data.list_app_user_role})),!1}function getParams(){model.params=null;return doGraphQLRequest("\n    query {\n        get_params {\n            max_attempts\n            reset_time\n            selfreg\n            use_captcha\n          }\n        }\n    ",(function(e){var n=e.data.get_params;model.params=n})),!1}function setParams(e){return e&&e.preventDefault(),doGraphQLRequest(`\n    query {\n        set_params(\n        selfreg:      ${document.querySelector("#formParams input[name='selfreg']").checked},\n        use_captcha:  ${document.querySelector("#formParams input[name='use_captcha']").checked},\n        max_attempts: ${document.querySelector("#formParams input[name='max_attempts']").value},\n        reset_time:   ${document.querySelector("#formParams input[name='reset_time']").value}\n        ) {\n            max_attempts\n            reset_time\n            selfreg\n            use_captcha\n          }\n        }\n    `,(function(e){model.params=e.data.set_params,alert("params saving success")}),"paramsError"),!1}function getAppstat(e){e&&e.preventDefault();return doGraphQLRequest("\n    query {\n        get_stat {\n            alloc\n            requests_per_day\n            requests_per_hour\n            requests_per_minute\n            requests_per_second\n            sys\n            total_alloc\n          }\n        }\n    ",(function(e){var n=e.data.get_stat;model.appstat=n}),"appstatError"),!1}function formListUserSubmit(e){return e&&e.preventDefault(),model.users=null,doGraphQLRequest(`\n    query {\n        list_user(\n        search: "${document.querySelector("#formListUser input[name='search']").value}",\n        order: "fullname ASC"\n        ) {\n            length\n            list {\n              description\n              email\n              fullname\n              username\n              disabled\n            }\n          }\n        }        \n    `,(function(e){model.users=e.data.list_user.list})),!1}function formUserSubmit(e,n="create_user"){e&&e.preventDefault();let t=document.querySelector("#formUser input[name='username']").value,r=document.querySelector("#formUser input[name='password']").value,a=document.querySelector("#formUser input[name='email']").value,s=document.querySelector("#formUser input[name='fullname']").value,l=document.querySelector("#formUser *[name='description']").value,o=document.querySelector("#formUser input[name='disabled']").value;return doGraphQLRequest(`\n    mutation {\n        ${n}(\n        username: "${t}",\n        password: "${r}",\n        email: "${a}",\n        fullname: "${s}",\n        description: "${l}",\n        disabled: ${o}\n        ) {\n            description\n            email\n            fullname\n            username\n            disabled\n          }\n\n        }\n    `,(function(e){alert(n+" success"),refreshData(),model.user=e.data[n],"create_user"!=n||model.logined||(alert(`"${t}" is created.`),showPage("login",!0)),getUser(t)}),"userError"),!1}function getUser(e){return model.user=null,doGraphQLRequest(`\n    query {\n        get_user(\n        username: "${e}"\n        ) {\n            description\n            email\n            fullname\n            username\n            disabled\n          }\n        \n        list_app_user_role(\n        username: "${e}"\n        ) {\n            app_description\n            appname\n            rolename\n            username\n          }\n        \n        }\n\n    `,(function(e){var n=e.data.get_user;n.apps=groupApps(e.data.list_app_user_role),model.user=n})),!1}function groupApps(e){if(!e)return[];let n={};for(let t of e)n[t.appname]||(n[t.appname]=[]),n[t.appname].push(t);let t=[];for(let[e,r]of Object.entries(n)){let n={};n.appname=e,n.app_description=r[0].app_description,n.items=r,t.push(n)}return t}function deleteUser(e){return doGraphQLRequest(`\n    mutation {\n        delete_user(\n        username: "${e}"\n        ) {\n            username\n          }\n        }\n    `,(function(e){model.user=null,refreshData(),showPage("users")})),!1}function formListAppSubmit(e){return e&&e.preventDefault(),model.apps=null,doGraphQLRequest(`\n    query {\n        list_app(\n        search: "${document.querySelector("#formListApp input[name='search']").value}",\n        order: "description ASC"\n        ) {\n            length\n            list {\n              appname\n              description\n              url\n              rebase\n              public\n            }\n          }\n        }    `,(function(e){model.apps=e.data.list_app.list})),!1}function formAppSubmit(e,n="create_app"){e&&e.preventDefault();let t=document.querySelector("#formApp input[name='appname']").value,r=document.querySelector("#formApp input[name='url']").value,a=document.querySelector("#formApp input[name='description']").value,s=document.querySelector("#formApp input[name='rebase']").value,l=document.querySelector("#formApp input[name='public']").value;return doGraphQLRequest(`\n    mutation {\n        ${n}(\n        appname: "${t}",\n        url: "${r}",\n        description: "${a}",\n        rebase: "${s}",\n        public: "${l}"\n        ) {\n            description\n            appname\n            url\n            rebase\n            public\n          }\n\n        }\n    `,(function(e){alert(n+" success"),refreshData(),model.app=e.data[n],getApp(t)}),"appError"),!1}function getApp(e){return model.app=null,doGraphQLRequest(`\n    query {\n        get_app(\n        appname: "${e}"\n        ) {\n            description\n            appname\n            url\n            rebase\n            public\n          }\n        \n        list_app_user_role(\n        appname: "${e}"\n        ) {\n            appname\n            rolename\n            user_fullname\n            user_disabled\n            username\n          }\n        \n        }\n\n    `,(function(e){var n=e.data.get_app;n.users=groupUsers(e.data.list_app_user_role),model.app=n})),!1}function groupUsers(e){let n={};for(let t of e)n[t.username]||(n[t.username]=[]),n[t.username].push(t);let t=[];for(let[e,r]of Object.entries(n)){let n={};n.username=e,n.user_fullname=r[0].user_fullname,n.items=r,t.push(n)}return t}function deleteApp(e){return doGraphQLRequest(`\n    mutation {\n        delete_app(\n        appname: "${e}"\n        ) {\n            appname\n          }\n        }\n    `,(function(e){model.app=null,refreshData(),showPage("apps")})),!1}function getAllApps(e){e&&e.preventDefault(),model.allApps=null;return doGraphQLRequest('\n    query {\n        list_app(\n        order: "appname ASC"\n        ) {\n            length\n            list {\n              appname\n              description\n              url\n              rebase\n              public \n            }\n          }\n        }    ',(function(e){model.allApps=e.data.list_app.list})),!1}function getAllUsers(e){e&&e.preventDefault(),model.allUsers=null;return doGraphQLRequest('\n    query {\n        list_user(\n        order: "fullname ASC"\n        ) {\n            length\n            list {\n              username\n              fullname\n              email\n              description\n              disabled\n            }\n          }\n        }    ',(function(e){model.allUsers=e.data.list_user.list})),!1}function formListRoleSubmit(e){e&&e.preventDefault&&e.preventDefault(),model.app_user_roles=null;let n=document.getElementById("allApps").value,t=document.getElementById("allUsers").value;if(n&&t)return doGraphQLRequest(`\n    query {\n        list_app_user_role(\n        appname: "${n}",\n        username: "${t}"\n        ) {\n            rolename\n          }\n        }        \n        `,(function(e){model.app_user_roles=e.data.list_app_user_role})),!1}function modifyRole(e,n,t,r,a){if(n&&t&&r)return doGraphQLRequest(`\n    mutation {\n        ${e}_app_user_role(\n        appname: "${n}",\n        username: "${t}",\n        rolename: "${r}"\n        ) {\n            rolename\n            appname\n            username\n          }\n        }\n    `,(function(e){a&&a()})),!1}function refreshRoles(){let e=document.getElementById("allUsers").value;if(e){let n=document.querySelector(`#allUsersDataList>option[value='${e}']`).innerText;document.getElementById("userInfo").innerText=n}let n=document.getElementById("allApps").value;if(n){let e=document.querySelector(`#allAppsDataList>option[value='${n}']`).innerText;document.getElementById("appInfo").innerText=e}e&&n&&formListRoleSubmit()}function filterRows(e,n){var t=n.toLowerCase();document.querySelectorAll(e).forEach(e=>{-1==e.innerText.toLowerCase().indexOf(t)?e.classList.add("hidden"):e.classList.remove("hidden")})}function hideElements(e){document.querySelectorAll(e).forEach(e=>e.classList.add("hidden"))}function showElements(e){document.querySelectorAll(e).forEach(e=>e.classList.remove("hidden"))}function addClass(e,n){document.querySelectorAll(e).forEach(e=>e.classList.add(n))}function removeClass(e,n){document.querySelectorAll(e).forEach(e=>e.classList.remove(n))}function hidePassword(){document.querySelector("#formUser input[name='password']").setAttribute("type","password")}function showPassword(){document.querySelector("#formUser input[name='password']").setAttribute("type","text")}function removeQueryStringFromBrowserURL(){let e=document.location.href.replace(/\?.*/,"")+"?url="+model.origin;history.replaceState(null,null,e)}function generatePassword(){document.querySelector("#formUser input[name='password']").value=function(e){let n=e=>e[Math.floor(Math.random()*e.length)];var t=["bcdfghjklmnpqrstvwxz","aeiou"],r="";for(let a=0;a<e;a++)r+=n(t[a%t.length]);return r}(9)}function buildSocialIcons(e){fetch(e).then(e=>e.json()).then(e=>renderOauthProvidersJSON(e)).catch(e=>{console.log("fetch error:",e)})}function renderOauthProvidersJSON(e){let n=document.getElementById("socialIcons");if(!n)return;n.innerHTML="";let t=[];for(let[n,r]of Object.entries(e))t.push(`\n        <div class="social-element">\n        <a class="button button-clear" title="login via ${n}" href="${model.origin+r[0]}">\n        ${n}\n        <br>\n        <img class="social-icon" src="images/${n}.svg">\n        </a>\n        \x3c!--\n        <br>\n        <a class="social-logout" title="logout from ${n}" href="${model.origin+r[1]}">logout</a>\n        --\x3e\n        </div>\n        \n        \n        `);t.length>0?(n.innerHTML='<div class="socialHeader">войти через</div>'+t.join(" "),showElements("#selfRegHelpText"),removeClass("#socialIcons","transparent")):hideElements("#selfRegHelpText")}function getNewCaptcha(){let e=model.origin+"/captcha?"+(new Date).getTime();return document.getElementById("captchaImg").src=e,!1}function clearLoginForm(){document.getElementById("loginUsername").value="",document.getElementById("loginPassword").value="",document.getElementById("loginCaptcha").value="",document.getElementById("loginError").innerText="",document.getElementById("socialLoginError").innerHTML="",document.getElementById("oauth2email").innerHTML=""}function logout(){return logoutGraphQLFormSubmit(),clearLoginForm(),showPage("login",!0),isSelfRegAllowed(),model.captchaRequired=!1,!1}function refreshData(){if(model.logined)getAllApps(),getAllUsers(),formListAppSubmit(),formListUserSubmit();else{for(const e of Object.keys(model))e.startsWith("_")&&(model[e]=null);isSelfRegAllowed()}}function getCurrentPageID(){var e=location.hash.slice(1);return!e||e.includes("=")?"apps":e}function refreshApp(){if(refreshData(),model.logined){showPage(getCurrentPageID()),showElements("#menu"),hideElements("#menuUnlogined")}else showPage("login",!0),hideElements("#menu"),showElements("#menuUnlogined")}function setAppParams(){model.oauth2email=model.urlParams.get("oauth2email")||"",model.oauth2name=model.urlParams.get("oauth2name")||"",model.oauth2id=model.oauth2email.replace(/@.*/,""),document.getElementById("oauth2email").innerHTML=model.oauth2email;var e=model.urlParams.get("url"),n=model.urlParams.get("css"),t=model.urlParams.get("oauth2error"),r=model.urlParams.get("alert");r&&alert(r),document.getElementById("socialLoginError").innerHTML=t,n&&(document.getElementById("theme").href=n),model.origin=e||"https://auth-proxy.rg.ru",removeQueryStringFromBrowserURL(),model.captchaRequired=!1}function init(){setAppParams(),getLoginedUser(),refreshApp()}window.onhashchange=function(e){model.debug&&console.log("onhashchange",e);var n=e.newURL.split("#")[1];n&&showPage(n)},init();
//# sourceMappingURL=bundle.js.map
