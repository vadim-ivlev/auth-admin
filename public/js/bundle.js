"use strict";var delayTimeout,model={oauth2email:"",oauth2name:"",oauth2id:"",priv_origin:null,set appurl(e){this.priv_origin=e,document.getElementById("appUrl").innerHTML=e,buildSocialIcons(e+"/oauthproviders"),document.getElementById("graphqlTestLink").href="https://graphql-test.vercel.app/?end_point="+e+"/schema&tab_name=auth-proxy"},get appurl(){return this.priv_origin},templatesCache:[],get logined(){return null!=this._loginedUser},urlParams:new URLSearchParams(window.location.search),_loginedUser:null,set loginedUser(e){this._loginedUser=e,document.getElementById("userTab").innerText=e?e.username:"",refreshApp()},get loginedUser(){return this._loginedUser},_selfRegAllowed:!1,set selfRegAllowed(e){this._selfRegAllowed=e,e?(showElements("#selfRegButton"),showElements("#selfRegHelp")):(hideElements("#selfRegButton"),hideElements("#selfRegHelp"))},get selfRegAllowed(){return this._selfRegAllowed},_captchaRequired:!1,set captchaRequired(e){this._captchaRequired=e,e?showElements("#captcha"):hideElements("#captcha")},get captchaRequired(){return this._captchaRequired},_authRoles:null,set authRoles(e){this._authRoles=e,this.isAdmin?(showElements("#usersTab"),showElements("#rolesTab"),showElements("#graphqlTest"),showElements("#btnNewApp"),showElements("#settingsButton")):(hideElements("#usersTab"),hideElements("#rolesTab"),hideElements("#graphqlTest"),hideElements("#btnNewApp"),hideElements("#settingsButton")),renderTemplateFile("mustache/apps.html",model,".app-search-results")},get authRoles(){return this._authRoles},get isAdmin(){return!!model.authRoles&&model.authRoles.some(e=>"authadmin"==e.rolename||"auditor"==e.rolename)},_user:null,set user(e){this._user=e,renderTemplateFile("mustache/user.html",model,"#userPage")},get user(){return this._user},_app:null,set app(e){this._app=e,renderTemplateFile("mustache/app.html",model,"#appPage")},get app(){return this._app},_group:null,set group(e){this._group=e,renderTemplateFile("mustache/group.html",model,"#groupPage")},get group(){return this._group},_users:null,set users(e){this._users=e,renderTemplateFile("mustache/users.html",model,".user-search-results")},get users(){return this._users},_apps:null,set apps(e){this._apps=e,renderTemplateFile("mustache/apps.html",model,".app-search-results")},get apps(){return this._apps},_groups:null,set groups(e){this._groups=e,renderTemplateFile("mustache/groups.html",model,".group-search-results")},get groups(){return this._groups},all_app_options:null,all_user_options:null,all_group_options:null,_allApps:null,set allApps(e){this._allApps=e,this.all_app_options=createOptions(e,"appname","description","url"),document.querySelector("#allAppsDataList").innerHTML=this.all_app_options},get allApps(){return this._allApps},_allUsers:null,set allUsers(e){this._allUsers=e,this.all_user_options=createOptions(e,"username","fullname","email"),document.querySelector("#allUsersDataList").innerHTML=this.all_user_options},get allUsers(){return this._allUsers},_allGroups:null,set allGroups(e){this._allGroups=e,console.debug("allGroups",e)},get allGroups(){return this._allGroups},_app_user_roles:null,set app_user_roles(e){this._app_user_roles=e,renderTemplateFile("mustache/app-user-roles.html",model,".app-user-roles-results")},get app_user_roles(){return this._app_user_roles},_app_group_roles:null,set app_group_roles(e){this._app_group_roles=e,renderTemplateFile("mustache/app-group-roles.html",model,".app-group-roles-results")},get app_group_roles(){return this._app_group_roles},_user_group_roles:null,set user_group_roles(e){this._user_group_roles=e,renderTemplateFile("mustache/user-group-roles.html",model,".user-group-roles-results")},get user_group_roles(){return this._user_group_roles},_params:null,set params(e){this._params=e,renderTemplateFile("mustache/params.html",model,"#paramsPage"),document.getElementById("appName").innerText=e?e.app_name:""},get params(){return this._params},_appstat:null,set appstat(e){this._appstat=e,document.getElementById("gauges")&&(document.getElementById("divSys").innerText=e.sys+" Mb",document.getElementById("divAlloc").innerText="allocated: "+e.alloc+" Mb",document.getElementById("divTotalAlloc").innerText="total allocated: "+e.total_alloc+" Mb",drawGauge("req / day",e.requests_per_day,0,"divDay"),drawGauge("req / hour",e.requests_per_hour,0,"divHour"),drawGauge("req / min",e.requests_per_minute,0,"divMinute"),drawGauge("req / sec",e.requests_per_second,0,"divSecond"))},get appstat(){return this._appstat}};function pd(e){e&&e.preventDefault()}function createOptions(e,n,r,t){var a=[];return e&&e.forEach((function(e){a.push(`<option id="${e.id}" value="${e[n]}">${e[r]} &nbsp;&nbsp;&nbsp; ${e[t]?e[t]:""}</option>`)})),a.join("")}function highlightTab(e){removeClass(".tab","underlined"),addClass("#"+e.split("/")[0]+"Tab","underlined")}function showPage(e,n){stopGettingAppstat();var r=e.split("/"),t=r[0],a=r[1];highlightTab(e),hideElements(".page"),showElements("#"+t+"Page");var o=document.querySelector("#"+t+'Page input[type="text"]');return o&&o.focus(),n||history.state&&history.state.pageid==e||history.pushState({pageid:e},e,"#"+e),a&&("app"==t&&getApp(a),"user"==t&&getUser(a),"group"==t&&getGroup(a)),"params"==t&&startGettingAppstat(),!1}function renderTemplateFile(e,n,r){var t=model.templatesCache[e];function a(e){var t=Mustache.render(e,n);document.querySelector(r).innerHTML=t}t?a(t):fetch(e).then(e=>e.text()).then(n=>{model.templatesCache[e]=n,a(n)})}function delayFunc(e,n=500){return clearTimeout(delayTimeout),delayTimeout=setTimeout(e,n),!1}function searchApps(){return document.querySelector("#chkLocalSearch").checked?delayFunc(searchAppsInModel,100):delayFunc(formListAppSubmit)}function searchAppsInModel(){if(!model.allApps)return;var e=document.querySelector("#formListApp input[name='search']").value.trim().replace(" ",".*"),n=new RegExp(e,"i");let r=model.allApps.filter(e=>{var r=Object.values(e).join(" ");return n.test(r)});return model.apps=r,!1}function sortAppsBy(e){return!!model._allApps&&(model._allApps.sort((n,r)=>n[e]+n.appname>r[e]+r.appname?1:-1),model._apps.sort((n,r)=>n[e]+n.appname>r[e]+r.appname?1:-1),model.apps=model._apps,!1)}function searchUsers(){return document.querySelector("#chkLocalSearch").checked?delayFunc(searchUsersInModel,100):delayFunc(formListUserSubmit)}function searchUsersInModel(){if(!model.allUsers)return;var e=document.querySelector("#formListUser input[name='search']").value.trim().replace(" ",".*"),n=new RegExp(e,"i");let r=model.allUsers.filter(e=>n.test(Object.values(e).join(" ")));return model.users=r,!1}function sortUsersBy(e,n=!0){return!!model._allUsers&&(n?(model._allUsers.sort((n,r)=>n[e]+n.username>r[e]+r.username?1:-1),model._users.sort((n,r)=>n[e]+n.username>r[e]+r.username?1:-1)):(model._allUsers.sort((n,r)=>n[e]>r[e]?1:-1),model._users.sort((n,r)=>n[e]>r[e]?1:-1)),model.users=model._users,!1)}function searchGroups(){return document.querySelector("#chkLocalSearch").checked?delayFunc(searchGroupsInModel,100):delayFunc(formListGroupSubmit)}function searchGroupsInModel(){if(!model.allGroups)return;var e=document.querySelector("#formListGroup input[name='search']").value.trim().replace(" ",".*"),n=new RegExp(e,"i");let r=model.allGroups.filter(e=>n.test(Object.values(e).join(" ")));return model.groups=r,!1}function sortGroupsBy(e,n=!0){return!!model._allGroups&&(n?(model._allGroups.sort((n,r)=>n[e]+n.groupname>r[e]+r.groupname?1:-1),model._groups.sort((n,r)=>n[e]+n.groupname>r[e]+r.groupname?1:-1)):(model._allGroups.sort((n,r)=>n[e]>r[e]?1:-1),model._groups.sort((n,r)=>n[e]>r[e]?1:-1)),model.groups=model._groups,!1)}function errorMessage(e,n){console.debug(n),e&&(document.getElementById(e).innerText=n)}function doGraphQLRequest(e,n,r="loginError"){fetch(model.appurl+"/graphql",{method:"POST",credentials:"include",body:JSON.stringify({query:e,variables:{}})}).then(e=>{if(e.ok)return e.json();new Error(e)}).then(e=>{if(console.debug("doGraphQLRequest() result=",e),e.errors){let n=e.errors[0].message;errorMessage(r,n)}else n&&n(e)}).catch(e=>errorMessage(r,"doGraphQLRequest: "+e))}function loginGraphQLFormSubmit(e){e&&e.preventDefault();let n=document.getElementById("loginUsername").value,r=document.getElementById("loginPassword").value,t=document.getElementById("loginCaptcha").value,a=document.getElementById("loginPin").value;if(""!=n)return isPinRequired(n),doGraphQLRequest(`\n    query {\n        login(\n        username: "${n}",\n        password: "${r}",\n        captcha: "${t}",\n        pin: "${a}"\n        )\n        }    \n    `,(function(e){getLoginedUser()}),"loginError"),clearLoginForm(),!1;errorMessage("loginError","Заполните поле email")}function logoutGraphQLFormSubmit(e){e&&e.preventDefault();return doGraphQLRequest("\n    query {\n        logout {\n            message\n            email\n          }\n        }\n    ",(function(e){model.loginedUser=null,model.oauth2email="",model.oauth2id="",model.oauth2name="",refreshApp()})),!1}function isSelfRegAllowed(e){e&&e.preventDefault();return doGraphQLRequest(" query { is_selfreg_allowed }",(function(e){model.selfRegAllowed=e.data.is_selfreg_allowed})),!1}function checkUserRequirements(e){e&&e.preventDefault();let n=document.getElementById("loginUsername").value;return isCaptchaRequired(n),isPinRequired(n),!1}function isCaptchaRequired(e){doGraphQLRequest(`  query { is_captcha_required(  username: "${e}" ) \n        {\n            is_required \n            path\n        } \n    } `,(function(e){model.captchaRequired=e.data.is_captcha_required.is_required,model.captchaRequired&&(getNewCaptcha(),console.debug("Captcha IS required"))}))}function isPinRequired(e){errorMessage("loginError",""),doGraphQLRequest(`  query { is_pin_required(  username: "${e}" ) \n        {\n            use_pin \n            pinrequired\n        } \n    } `,(function(e){let n=e.data.is_pin_required;console.debug("isPinRequired()->",n),n.use_pin&&n.pinrequired?showElements(".pinclass"):hideElements(".pinclass")}))}function resetPasswordRest(e){e&&e.preventDefault(),errorMessage("resetError","");let n=document.getElementById("loginUsername").value;if(!n)return errorMessage("resetError","Заполните поле email"),!1;let r=location.origin+location.pathname,t=`${model.priv_origin}/reset_password?username=${n}&adminurl=${r}&authurl=${model.priv_origin}`;return fetch(t).then(e=>e.json()).then((function(e){errorMessage("resetError",e.error),e.result&&alert(e.result)})).catch((function(e){errorMessage("resetError","resetPasswordRest "+e)})),!1}function resetAuthenticator(e){e&&e.preventDefault(),errorMessage("resetError","");let n=document.getElementById("loginUsername").value;if(!n)return errorMessage("resetError","Заполните поле email"),!1;let r=location.origin+location.pathname,t=`${model.priv_origin}/reset_authenticator?username=${n}&adminurl=${r}&authurl=${model.priv_origin}`;return fetch(t).then(e=>e.json()).then((function(e){errorMessage("resetError",e.error),e.result&&alert(e.result)})).catch((function(e){errorMessage("resetError","resetAuthenticator "+e)})),!1}function getLoginedUser(){model.loginedUser=null;return doGraphQLRequest("\n    query {\n        get_logined_user {\n            description\n            email\n            fullname\n            username\n            disabled\n            id\n            pinhash\n            pinrequired\n            pinhash_temp  \n            emailhash\n            emailconfirmed    \n        }\n    }\n    ",(function(e){model.loginedUser=e.data.get_logined_user,getAuthRoles(model.loginedUser.username),getUser(model.loginedUser.username)})),!1}function getAuthRoles(e){return model.authRoles=null,doGraphQLRequest(`\n    query {\n        list_app_user_role(\n            appname: "auth",\n            username: "${e}"\n            ) {\n                rolename\n            }\n        }\n        `,(function(e){model.authRoles=e.data.list_app_user_role})),!1}function getParams(){model.params=null;return doGraphQLRequest("\n    query {\n        get_params {\n            app_name\n            max_attempts\n            reset_time\n            selfreg\n            use_captcha\n            use_pin\n          }\n        }\n    ",(function(e){var n=e.data.get_params;model.params=n,getAppstatRest()})),!1}function setParams(e){return e&&e.preventDefault(),doGraphQLRequest(`\n    query {\n        set_params(\n        selfreg:      ${document.querySelector("#formParams input[name='selfreg']").checked},\n        use_captcha:  ${document.querySelector("#formParams input[name='use_captcha']").checked},\n        use_pin:      ${document.querySelector("#formParams input[name='use_pin']").checked},\n        max_attempts: ${document.querySelector("#formParams input[name='max_attempts']").value},\n        reset_time:   ${document.querySelector("#formParams input[name='reset_time']").value}\n        ) {\n            max_attempts\n            reset_time\n            selfreg\n            use_captcha\n            use_pin\n          }\n        }\n    `,(function(e){model.params=e.data.set_params,alert("params saving success")}),"paramsError"),!1}function getAppstatRest(e){return e&&e.preventDefault(),getAppstatRest.counter=void 0===getAppstatRest.counter?0:getAppstatRest.counter+1,console.log("getAppstatRest.counter = ",getAppstatRest.counter),fetch(model.appurl+"/stat").then(e=>e.json()).then((function(e){var n=e;model.appstat=n})).catch(e=>{console.log("fetch error:",e)}),!1}function startGettingAppstat(){clearInterval(model.statInterval),getAppstatRest(),model.statInterval=setInterval(getAppstatRest,3e3),console.log("startGettingAppstat")}function stopGettingAppstat(){clearInterval(model.statInterval)}function formListUserSubmit(e){return e&&e.preventDefault(),model.users=null,doGraphQLRequest(`\n    query {\n        list_user(\n        search: "${document.querySelector("#formListUser input[name='search']").value}",\n        order: "fullname ASC"\n        ) {\n            length\n            list {\n              description\n              email\n              fullname\n              username\n              disabled\n              id\n              pinhash\n              pinrequired\n              pinhash_temp   \n              emailhash\n              emailconfirmed    \n              }\n          }\n        }        \n    `,(function(e){model.users=e.data.list_user.list})),!1}function updateUser(e){return e&&e.preventDefault(),doGraphQLRequest(`\n    mutation {\n        update_user(\n        id: ${document.querySelector("#user-id").innerText}\n        password: "${document.querySelector("#formUser input[name='password']").value}",\n        fullname: "${document.querySelector("#formUser input[name='fullname']").value}",\n        description: "${document.querySelector("#formUser *[name='description']").value}",\n        disabled: ${document.querySelector("#formUser input[name='disabled']").value},\n        pinrequired: ${document.querySelector("#formUser input[name='pinrequired']").checked}\n        ) {\n            description\n            email\n            fullname\n            username\n            disabled\n            id\n            pinhash\n            pinrequired\n            pinhash_temp      \n            emailhash\n            emailconfirmed    \n          }\n\n        }\n    `,(function(e){alert("update_user success"),refreshData(),model.user=e.data.update_user,getUser(model.user.username)}),"userError"),!1}function createUser(e){return e&&e.preventDefault(),doGraphQLRequest(`\n    mutation {\n        create_user(\n        email: "${document.querySelector("#formUser input[name='email']").value}",\n        password: "${document.querySelector("#formUser input[name='password']").value}",\n        fullname: "${document.querySelector("#formUser input[name='fullname']").value}",\n        description: "${document.querySelector("#formUser *[name='description']").value}",\n        disabled: ${document.querySelector("#formUser input[name='disabled']").value},        \n        pinrequired: ${document.querySelector("#formUser input[name='pinrequired']").checked},\n        ) {\n            description\n            email\n            fullname\n            username\n            disabled\n            id\n            pinhash\n            pinrequired \n            pinhash_temp       \n            emailhash\n            emailconfirmed    \n          }\n\n        }\n    `,(function(e){alert("create_user success"),refreshData(),model.user=e.data.create_user,model.logined?getUser(model.user.username):(alert(`"${model.user.username}" is created.`),showPage("login",!0))}),"userError"),!1}function getUser(e){return model.user=null,doGraphQLRequest(`\n    query {\n        get_user(\n        username: "${e}"\n        ) {\n            description\n            email\n            fullname\n            username\n            disabled\n            id\n            pinhash\n            pinrequired\n            pinhash_temp     \n            emailhash\n            emailconfirmed    \n          }\n        \n        list_app_user_role(\n        username: "${e}"\n        ) {\n            app_description\n            appname\n            rolename\n            username\n          }\n        \n        }\n\n    `,(function(e){var n=e.data.get_user;n.apps=groupApps(e.data.list_app_user_role),model.user=n})),!1}function groupApps(e){if(!e)return[];let n={};for(let r of e)n[r.appname]||(n[r.appname]=[]),n[r.appname].push(r);let r=[];for(let[e,t]of Object.entries(n)){let n={};n.appname=e,n.app_description=t[0].app_description,n.items=t,r.push(n)}return r}function deleteUser(e){return doGraphQLRequest(`\n    mutation {\n        delete_user(\n        username: "${e}"\n        ) {\n            username\n          }\n        }\n    `,(function(e){model.user=null,refreshData(),showPage("users")})),!1}function formListAppSubmit(e){return e&&e.preventDefault(),model.apps=null,doGraphQLRequest(`\n    query {\n        list_app(\n        search: "${document.querySelector("#formListApp input[name='search']").value}",\n        order: "description ASC"\n        ) {\n            length\n            list {\n              appname\n              description\n              url\n              rebase\n              public\n              sign\n            }\n          }\n        }    `,(function(e){model.apps=e.data.list_app.list})),!1}function createApp(e){e&&e.preventDefault();let n=document.querySelector("#formApp input[name='appname']").value,r=document.querySelector("#formApp input[name='url']").value,t=document.querySelector("#formApp input[name='description']").value,a=document.querySelector("#formApp input[name='rebase']").value,o=document.querySelector("#formApp input[name='public']").value,s=document.querySelector("#formApp input[name='sign']").value;return doGraphQLRequest(`\n    mutation {\n        create_app(\n        appname: "${n}",\n        url: "${r}",\n        description: "${t}",\n        rebase: "${a}",\n        public: "${o}",\n        sign: "${s}"\n        ) {\n            description\n            appname\n            url\n            rebase\n            public\n            sign\n          }\n\n        }\n    `,(function(e){alert("create_app success"),refreshData(),model.app=e.data.create_app,getApp(n)}),"appError"),!1}function updateApp(e,n="create_app"){e&&e.preventDefault();let r=document.querySelector("#formApp input[name='old_appname']").value,t=document.querySelector("#formApp input[name='appname']").value,a=document.querySelector("#formApp input[name='url']").value,o=document.querySelector("#formApp input[name='description']").value,s=document.querySelector("#formApp input[name='rebase']").value,l=document.querySelector("#formApp input[name='public']").value,u=document.querySelector("#formApp input[name='sign']").value;return doGraphQLRequest(`\n    mutation {\n        update_app(\n        old_appname: "${r}",\n        appname: "${t}",\n        url: "${a}",\n        description: "${o}",\n        rebase: "${s}",\n        public: "${l}",\n        sign: "${u}"\n        ) {\n            description\n            appname\n            url\n            rebase\n            public\n            sign\n          }\n\n        }\n    `,(function(e){alert("update_app success"),refreshData(),model.app=e.data.update_app,getApp(t)}),"appError"),!1}function getApp(e){return model.app=null,doGraphQLRequest(`\n    query {\n        get_app(\n        appname: "${e}"\n        ) {\n            description\n            appname\n            url\n            rebase\n            public\n            sign\n          }\n        \n        list_app_user_role(\n        appname: "${e}"\n        ) {\n            appname\n            rolename\n            user_fullname\n            user_disabled\n            username\n          }\n        \n        }\n\n    `,(function(e){var n=e.data.get_app;n.users=groupUsers(e.data.list_app_user_role),model.app=n})),!1}function groupUsers(e){let n={};for(let r of e)n[r.username]||(n[r.username]=[]),n[r.username].push(r);let r=[];for(let[e,t]of Object.entries(n)){let n={};n.username=e,n.user_fullname=t[0].user_fullname,n.items=t,r.push(n)}return r}function deleteApp(e){return doGraphQLRequest(`\n    mutation {\n        delete_app(\n        appname: "${e}"\n        ) {\n            appname\n          }\n        }\n    `,(function(e){model.app=null,refreshData(),showPage("apps")})),!1}function formListGroupSubmit(e){return e&&e.preventDefault(),model.groups=null,doGraphQLRequest(`\n    query {\n        list_group(\n        search: "${document.querySelector("#formListGroup input[name='search']").value}",\n        order: "description ASC"\n        ) {\n            length\n            list {\n              description\n              groupname\n              id\n           }\n          }\n        }    `,(function(e){model.groups=e.data.list_group.list})),!1}function createGroup(e){return e&&e.preventDefault(),doGraphQLRequest(`\n    mutation {\n        create_group(\n        groupname: "${document.querySelector("#formGroup input[name='groupname']").value}",\n        description: "${document.querySelector("#formGroup input[name='description']").value}"\n        ) {\n            description\n            groupname\n            id\n          }\n\n        }\n    `,(function(e){alert("create_group success"),refreshData(),model.group=e.data.create_group,getGroup(model.group.id)}),"groupError"),!1}function updateGroup(e){e&&e.preventDefault();let n=document.querySelector("#formGroup input[name='groupname']").value,r=document.querySelector("#formGroup input[name='description']").value,t=document.querySelector("#formGroup input[name='id']").value;return doGraphQLRequest(`\n    mutation {\n        update_group(\n        id: ${t},\n        groupname: "${n}",\n        description: "${r}"\n        ) {\n            description\n            groupname\n            id\n          }\n\n        }\n    `,(function(e){alert("update_group success"),refreshData(),model.group=e.data.update_group,getGroup(t)}),"groupError"),!1}function getGroup(e){return model.group=null,doGraphQLRequest(`\n    query {\n        get_group(\n        id: ${e}\n        ) {\n            description\n            groupname\n            id\n          }\n\n        list_group_app_role(\n        group_id:${e}\n        ) {\n            app_appname\n            app_description\n            app_id\n            app_url\n            group_description\n            group_groupname\n            group_id\n            rolename\n           }          \n                \n        }\n\n    `,(function(e){var n=e.data.get_group;n.apps=appsOfTheGroup(e.data.list_group_app_role),model.group=n}),"groupError"),!1}function groupByField(e,n){let r={};for(let t of e){let e=t[n];r[e]||(r[e]=[]),r[e].push(t)}return r}function appsOfTheGroup(e){let n=groupByField(e,"app_id"),r=[];for(let[e,t]of Object.entries(n)){let n={};n.app_id=e,n.group_id=t[0].group_id,n.app_appname=t[0].app_appname,n.app_description=t[0].app_description,n.app_url=t[0].app_url,n.items=t,r.push(n)}return r}function deleteGroup(e){return doGraphQLRequest(`\n    mutation {\n        delete_group(\n        id: ${e}\n        ) {\n            description\n          }\n        }\n    `,(function(e){alert("delete_group success"),model.group=null,refreshData(),searchGroups(),showPage("groups")}),"groupError"),!1}function getAllApps(e){e&&e.preventDefault(),model.allApps=null;return doGraphQLRequest('\n    query {\n        list_app(\n        order: "appname ASC"\n        ) {\n            length\n            list {\n              id\n              appname\n              description\n              url\n              rebase\n              public \n              sign\n            }\n          }\n        }    ',(function(e){model.allApps=e.data.list_app.list})),!1}function getAllUsers(e){e&&e.preventDefault(),model.allUsers=null;return doGraphQLRequest('\n    query {\n        list_user(\n        order: "fullname ASC"\n        ) {\n            length\n            list {\n              username\n              fullname\n              email\n              description\n              disabled\n              id\n              pinhash\n              pinrequired\n              pinhash_temp    \n              emailhash\n              emailconfirmed      \n              }\n          }\n        }    ',(function(e){model.allUsers=e.data.list_user.list})),!1}function getAllGroups(e){e&&e.preventDefault(),model.allGroups=null;return doGraphQLRequest('\n    query {\n        list_group(\n        order: "groupname ASC"\n        ) {\n            length\n            list {\n              groupname\n              description\n              id\n            }\n          }\n        }    ',(function(e){model.allGroups=e.data.list_group.list})),!1}function formListRoleSubmit(e){e&&e.preventDefault&&e.preventDefault(),model.app_user_roles=null;let n=document.getElementById("allApps").value,r=document.getElementById("allUsers").value;if(n&&r)return doGraphQLRequest(`\n    query {\n        list_app_user_role(\n        appname: "${n}",\n        username: "${r}"\n        ) {\n            rolename\n          }\n        }        \n        `,(function(e){model.app_user_roles=e.data.list_app_user_role})),!1}function modifyRole(e,n,r,t,a){if(n&&r&&t)return doGraphQLRequest(`\n    mutation {\n        ${e}_app_user_role(\n        appname: "${n}",\n        username: "${r}",\n        rolename: "${t}"\n        ) {\n            rolename\n            appname\n            username\n          }\n        }\n    `,(function(e){a&&a()})),!1}function modifyGroupAppRole(e,n,r,t,a){if(n&&r&&t)return doGraphQLRequest(`\n    mutation {\n        ${e}_group_app_role(\n        group_id: ${n},\n        app_id: ${r},\n        rolename: "${t}"\n        ) {\n            app_appname\n            app_description\n            app_id\n            app_url\n            group_description\n            group_groupname\n            group_id\n            rolename\n          }\n        }\n    `,(function(e){a&&a()})),!1}function refreshRoles(){let e=document.getElementById("allUsers").value;if(e){let n=document.querySelector(`#allUsersDataList>option[value='${e}']`).innerText;document.getElementById("userInfo").innerText=n}let n=document.getElementById("allApps").value;if(n){let e=document.querySelector(`#allAppsDataList>option[value='${n}']`).innerText;document.getElementById("appInfo").innerText=e}e&&n&&formListRoleSubmit()}function filterRows(e,n){var r=n.toLowerCase();document.querySelectorAll(e).forEach(e=>{-1==e.innerText.toLowerCase().indexOf(r)?e.classList.add("hidden"):e.classList.remove("hidden")})}function toggleElements(e){document.querySelectorAll(e).forEach(e=>e.classList.toggle("hidden"))}function hideElements(e){document.querySelectorAll(e).forEach(e=>e.classList.add("hidden"))}function showElements(e){document.querySelectorAll(e).forEach(e=>e.classList.remove("hidden"))}function addClass(e,n){document.querySelectorAll(e).forEach(e=>e.classList.add(n))}function removeClass(e,n){document.querySelectorAll(e).forEach(e=>e.classList.remove(n))}function hidePassword(){document.querySelector("#formUser input[name='password']").setAttribute("type","password")}function showPassword(){document.querySelector("#formUser input[name='password']").setAttribute("type","text")}function removeQueryStringFromBrowserURL(){let e=document.location.href.replace(/\?.*/,"")+"?url="+model.appurl;history.replaceState(null,null,e)}function newPassword(e,n=!1){let r=e=>e[Math.floor(Math.random()*e.length)];var t=n?["0123456789"]:["bcdfghjklmnpqrstvwxz","aeiou"],a="";for(let n=0;n<e;n++)a+=r(t[n%t.length]);return a}function generatePassword(){document.querySelector("#formUser input[name='password']").value=newPassword(9)}function generatePinHash(){let e=window.crypto&&window.crypto.randomUUID?window.crypto.randomUUID():newPassword(20,!0);document.querySelector("#formUser input[name='pinhash_temp']").value=e,setPinUrl()}function setPinUrl(){let e=document.querySelector("#formUser input[name='pinhash_temp']"),n=e.value;n=n.replaceAll(" ",""),e.value=n,document.getElementById("pinUrlContainer").style.display="none"}function buildSocialIcons(e){fetch(e).then(e=>e.json()).then(e=>renderOauthProvidersJSON(e)).catch(e=>{console.log("fetch error:",e)})}function renderOauthProvidersJSON(e){let n=document.getElementById("socialIcons");if(!n)return;n.innerHTML="";let r=[];for(let[n,t]of Object.entries(e))r.push(`\n        <div class="social-element">\n        <a class="button button-clear" title="login via ${n}" href="${model.appurl+t[0]}">\n        ${n}\n        <br>\n        <img class="social-icon" src="images/${n}.svg">\n        </a>\n        \x3c!--\n        <br>\n        <a class="social-logout" title="logout from ${n}" href="${model.appurl+t[1]}">logout</a>\n        --\x3e\n        </div>\n        \n        \n        `);r.length>0?(n.innerHTML='<div class="socialHeader">войти через социальную сеть</div>'+r.join(" "),showElements("#selfRegHelpText"),removeClass("#socialIcons","transparent")):hideElements("#selfRegHelpText")}function getNewCaptcha(){let e=model.appurl+"/captcha?"+(new Date).getTime();return document.getElementById("captchaImg").src=e,!1}model.statInterval=null;var gauges={};function drawGauge(e,n,r,t){if(!google)return;var a=document.getElementById(t);if(!a)return;gauges[e]||(gauges[e]={},gauges[e].data=google.visualization.arrayToDataTable([["Label","Value"],[e,0]])),""==a.innerHTML&&(gauges[a]=a,gauges[e].chart=new google.visualization.Gauge(a),console.log("Redraw gauge container:",t)),gauges[e].data.setValue(0,1,n);let o=r||getUpperLimit(n);var s={height:120,animation:{duration:700},greenFrom:0,greenTo:.2*o,yellowFrom:.8*o,yellowTo:.9*o,redFrom:.9*o,redTo:o,minorTicks:5,max:o};gauges[e].chart.draw(gauges[e].data,s)}function getUpperLimit(e){for(var n=10;e>n;)n*=10;return n}function clearLoginForm(){document.getElementById("loginUsername").value="",document.getElementById("loginPassword").value="",document.getElementById("loginCaptcha").value="",document.getElementById("loginPin").value="",document.getElementById("loginError").innerText="",document.getElementById("socialLoginError").innerHTML="",document.getElementById("oauth2email").innerHTML=""}function logout(){return logoutGraphQLFormSubmit(),clearLoginForm(),showPage("login",!0),isSelfRegAllowed(),model.captchaRequired=!1,!1}function refreshData(){if(model.logined)getAllApps(),getAllUsers(),getAllGroups(),formListAppSubmit(),formListUserSubmit(),formListGroupSubmit();else{for(const e of Object.keys(model))e.startsWith("_")&&(model[e]=null);isSelfRegAllowed()}}function getCurrentPageID(){var e=location.hash.slice(1);return!e||e.includes("=")?"apps":e}function refreshApp(){if(refreshData(),model.logined){showPage(getCurrentPageID()),showElements("#menu"),hideElements("#menuUnlogined")}else showPage("login",!0),hideElements("#menu"),showElements("#menuUnlogined");renderTemplateFile("mustache/group.html",model,"#groupPage"),renderTemplateFile("mustache/app.html",model,"#appPage"),renderTemplateFile("mustache/user.html",model,"#userPage")}function setAppParams(){model.oauth2email=model.urlParams.get("oauth2email")||"",model.oauth2name=model.urlParams.get("oauth2name")||"",model.oauth2id=model.oauth2email.replace(/@.*/,""),document.getElementById("oauth2email").innerHTML=model.oauth2email;var e=model.urlParams.get("url"),n=model.urlParams.get("css"),r=model.urlParams.get("oauth2error"),t=model.urlParams.get("alert");t&&alert(t),document.getElementById("socialLoginError").innerHTML=r,n&&(document.getElementById("theme").href=n),model.appurl=e||"https://auth-proxy.rg.ru",removeQueryStringFromBrowserURL(),model.captchaRequired=!1}function init(){renderTemplateFile("mustache/params.html",model,"#paramsPage"),google.charts.load("current",{packages:["gauge"]}),google.charts.setOnLoadCallback(getAppstatRest),setAppParams(),getLoginedUser(),refreshApp(),getParams()}window.onhashchange=function(e){console.debug("onhashchange ",e);var n=e.newURL.split("#")[1];n&&showPage(n)},init();
//# sourceMappingURL=bundle.js.map
