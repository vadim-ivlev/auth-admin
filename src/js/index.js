// M O D E L  ******************************************************************************************

var model = {
    //---------------------------
    // if debug == true logs go to console.
    debug: false,
    oauth2email: "",
    oauth2name: "",
    oauth2id: "",

    //---------------------------
    // url of GraphQL endpoint = appurl + '/graphql'
    priv_origin: null, 
    set appurl(v){
        this.priv_origin = v
        document.getElementById('appUrl').innerHTML = '&#x21E2;&nbsp;'+v
        buildSocialIcons(v+"/oauthproviders")
        document.getElementById('graphqlTestLink').href = 'https://graphql-test.vercel.app/?end_point='+v+'/schema&tab_name=auth-proxy'
    },
    get appurl(){
        return this.priv_origin
    },
    //---------------------------
    // templatesCache keeps loaded templates, not to load them repeatedly
    templatesCache :[],

    //---------------------------
    get logined(){
         return (this._loginedUser != null)
    },
 

    //---------------------------
    urlParams: new URLSearchParams(window.location.search),
    //---------------------------
    _loginedUser: null,
    set loginedUser(v) {
        this._loginedUser = v
        if (v) {
            document.getElementById("userTab").innerText = v.username
            // getAuthRoles(model.loginedUser.username)
        } else {
            document.getElementById("userTab").innerText = ""
        }
        refreshApp()
    },
    get loginedUser() {
        return this._loginedUser
    },

    //---------------------------
    _selfRegAllowed: false,
    set selfRegAllowed(v) {
        this._selfRegAllowed = v
        if (v) {
            showElements("#selfRegButton")
            showElements("#selfRegHelp")
        } else {
            hideElements("#selfRegButton")
            hideElements("#selfRegHelp")
        }
    },
    get selfRegAllowed() {
        return this._selfRegAllowed
    },
    
    //---------------------------
    _captchaRequired: false,
    set captchaRequired(v) {
        this._captchaRequired = v
        if (v) {
            showElements("#captcha")
        } else {
            hideElements("#captcha")
        }
    },
    get captchaRequired() {
        return this._captchaRequired
    },

    //---------------------------
    _authRoles: null,
    set authRoles(v) {
        this._authRoles = v
        if (this.isAdmin){
            showElements('#usersTab')
            showElements('#rolesTab')
            showElements('#graphqlTest')
            showElements('#btnNewApp')
            showElements('#settingsButton')
        } else {
            hideElements('#usersTab')
            hideElements('#rolesTab')
            hideElements('#graphqlTest')
            hideElements('#btnNewApp')
            hideElements('#settingsButton')

            // showPage('apps')
        }
        renderTemplateFile('mustache/apps.html', model, '.app-search-results')
        
    },
    get authRoles() {
        return this._authRoles
    },
    get isAdmin() {
        if (!model.authRoles) return false
        return model.authRoles.some(e => (e.rolename == "authadmin" || e.rolename == "auditor"))
    },
    
    //---------------------------
    _user: null,
    set user(v) {
        this._user = v
        renderTemplateFile('mustache/user.html', model, '#userPage')
    },
    get user() {
        return this._user
    },
    
    //---------------------------
    _app: null,
    set app(v) {
        this._app = v
        renderTemplateFile('mustache/app.html', model, '#appPage')
    },
    get app() {
        return this._app
    },
    
    //---------------------------
    _users: null,
    set users(v) {
        this._users = v
        renderTemplateFile('mustache/users.html', model, '.user-search-results')
    },
    get users() {
        return this._users
    },
    
    //---------------------------
    _apps: null,
    set apps(v) {
        this._apps = v
        renderTemplateFile('mustache/apps.html', model, '.app-search-results')
    },
    get apps() {
        return this._apps
    },

    //---------------------------
    all_app_options: null,
    all_user_options:null,
    //---------------------------
    _allApps: null,
    set allApps(v) {
        this._allApps = v
        this.all_app_options = createOptions(v, "appname", "description", "url")
        document.querySelector("#allAppsDataList").innerHTML = this.all_app_options
    },
    get allApps() {
        return this._allApps
    },

    //---------------------------
    _allUsers: null,
    set allUsers(v) {
        this._allUsers = v
        this.all_user_options = createOptions(v, "username", "fullname", "email")
        document.querySelector("#allUsersDataList").innerHTML = this.all_user_options
    },
    get allUsers() {
        return this._allUsers
    },
    
    //---------------------------
    _app_user_roles: null,
    set app_user_roles(v) {
        this._app_user_roles = v
        renderTemplateFile('mustache/roles.html', model, '.app-user-roles-results')
    },
    get app_user_roles() {
        return this._app_user_roles
    },

    //---------------------------
    _params: null,
    set params(v) {
        this._params = v
        renderTemplateFile('mustache/params.html', model, '#paramsPage')
    },
    get params() {
        return this._params
    },

    //---------------------------
    _appstat: null,
    set appstat(v) {
        this._appstat = v
        if (! document.getElementById('gauges')) return

        document.getElementById('divSys').innerText = v.sys +' Mb'
        document.getElementById('divAlloc').innerText = 'allocated: '+v.alloc +' Mb'
        document.getElementById('divTotalAlloc').innerText = 'total allocated: '+v.total_alloc +' Mb'


        drawGauge("req / day", v.requests_per_day, 0,  "divDay")        // 10000
        drawGauge("req / hour", v.requests_per_hour, 0, "divHour")       // 1000
        drawGauge("req / min", v.requests_per_minute, 0, "divMinute")     // 100
        drawGauge("req / sec", v.requests_per_second, 0, "divSecond")      // 10
    },
    get appstat() {
        return this._appstat
    },

 
    
}



// F U N C T I O N S  *********************************************************************************

function createOptions(selectValues, keyProp, textProp1, textProp2) {
    var output = []
    selectValues && selectValues.forEach(function(value)
    {
      output.push(`<option value="${value[keyProp]}">${value[textProp1]} &nbsp;&nbsp;&nbsp; ${value[textProp2]?value[textProp2]:''}</option>`);
    })
    let optionText = output.join('')
    return optionText
}


function highlightTab(tabid) {
        removeClass('.tab', "underlined")
        var tabid0 = tabid.split("/")[0]
        addClass('#'+tabid0+'Tab', "underlined")   
}


function showPage(pageid, dontpush){
    stopGettingAppstat()

    //распарсить pageidExtended
    var a = pageid.split("/")
    var pageid0 = a[0]
    var id = a[1]

    highlightTab(pageid)
    
    hideElements('.page')
    showElements('#'+pageid0+'Page')


    // setting focus
    var text = document.querySelector('#'+pageid0+'Page input[type="text"]')
    if(text) 
        text.focus()


    if (!dontpush){
        if (!history.state || history.state.pageid != pageid ){
            history.pushState({pageid:pageid},pageid, "#"+pageid) 
        }
    }

    if (id) {
        if (pageid0 == "app"){
            getApp(id)
        } 
        if (pageid0 == "user"){
            getUser(id)
        }
    }

    if (pageid0 == 'params')
        startGettingAppstat()

    return false
}


function renderTemplateFile(templateFile, data, targetSelector) {
    var cachedTemlpate = model.templatesCache[templateFile]
    
    if (cachedTemlpate) {
        renderTemplate(cachedTemlpate) 
        // console.info("from cache:",templateFile)
        return
    }
    
    fetch(templateFile).then(x => x.text()).then( t => {
        model.templatesCache[templateFile]=t 
        renderTemplate(t)
    })

    function renderTemplate(template) {
        var rendered = Mustache.render(template, data)
        document.querySelector(targetSelector).innerHTML = rendered
    }    

}



var delayTimeout
function delayFunc(f, delay=500) {
   clearTimeout(delayTimeout) 
   delayTimeout = setTimeout(f, delay)  
   return false 
}


function searchApps() {
    if (document.querySelector('#chkLocalSearch').checked) {
        return delayFunc(searchAppsInModel, 100)
    } else {
        return delayFunc(formListAppSubmit)
    }
}

function searchAppsInModel() {
    if (!model.allApps) return
    var text = document.querySelector("#formListApp input[name='search']").value.trim().replace(' ','.*')
    var r = new RegExp(text, 'i')
    let found = model.allApps.filter((v)=>{
        var s = Object.values(v).join(' ')
        return r.test(s)
    })
    model.apps = found
    return false   
}


function sortAppsBy(prop) {
    if (!model._allApps) return false
    model._allApps.sort( (a,b) => (a[prop]+a.appname)>(b[prop]+b.appname)? 1: -1)
    model._apps.sort( (a,b) => (a[prop]+a.appname)>(b[prop]+b.appname)? 1: -1 )
    model.apps = model._apps
    return false
}


function searchUsers() {
    if (document.querySelector('#chkLocalSearch').checked) {
        return delayFunc(searchUsersInModel, 100)
    } else {
        return delayFunc(formListUserSubmit)
    }
}


function searchUsersInModel() {
    if (!model.allUsers) return
    var text = document.querySelector("#formListUser input[name='search']").value.trim().replace(' ','.*')
    var r = new RegExp(text, 'i')
    let found = model.allUsers.filter( (v) => r.test (Object.values(v).join(' ')) )
    model.users = found
    return false   
}


function sortUsersBy(prop, asStings = true) {
    if (!model._allUsers) return false
    if (asStings){
        model._allUsers.sort( (a,b) => (a[prop]+a.username)>(b[prop]+b.username)? 1: -1)
        model._users.sort( (a,b) => (a[prop]+a.username)>(b[prop]+b.username)? 1: -1 )
    } else {
        model._allUsers.sort( (a,b) => (a[prop])>(b[prop])? 1: -1)
        model._users.sort( (a,b) => (a[prop])>(b[prop])? 1: -1 )
    }
    model.users = model._users
    return false
}



// R E Q U E S T S  *******************************************************

function doGraphQLRequest(query, responseHandler, errorElementID) {
    fetch(model.appurl+'/graphql', { 
        method: 'POST', 
        credentials: 'include', 
        body: JSON.stringify({ query: query, variables: {} }) 
    })
        .then(res => { 
            if (res.ok) {
                return res.json();
            }
            new Error(res)
        })
        .then((res) => {
            model.debug && console.log(res)
            if (res.errors){
                model.debug && console.log(res.errors[0].message)
                if (errorElementID) {
                    document.getElementById(errorElementID).innerText = res.errors[0].message
                }
                return
            }
            responseHandler && responseHandler(res)
        })
        .catch( e => console.error(e) )    
    
}


// L O G I N  *****************************************************************************

function loginGraphQLFormSubmit(event) {
    if (event) event.preventDefault()
    
    let username = document.getElementById("loginUsername").value
    let password = document.getElementById("loginPassword").value
    let captcha =  document.getElementById("loginCaptcha").value
    let pin =  document.getElementById("loginPin").value

    isPinRequired(username)
    

    let query =`
    query {
        login(
        username: "${username}",
        password: "${password}",
        captcha: "${captcha}",
        pin: "${pin}"
        )
        }    
    `
    function onSuccess(res){
        getLoginedUser()
    }   
    
    doGraphQLRequest(query, onSuccess, "loginError")
    clearLoginForm()
    hideElements("#setAuthenticatorForm")
    return false       
}



function logoutGraphQLFormSubmit(event) {
    if (event) event.preventDefault()
    var query =`
    query {
        logout {
            message
            username
          }
        }
    `

    function onSuccess(res){
        model.loginedUser = null
        model.oauth2email =""
        model.oauth2id =""
        model.oauth2name =""

        refreshApp()
    }

    doGraphQLRequest(query, onSuccess)
    return false       
}



function isSelfRegAllowed(event) {
    if (event) event.preventDefault()
    var query =` query { is_selfreg_allowed }`

    function onSuccess(res){
        model.selfRegAllowed = res.data.is_selfreg_allowed
    }
       
    doGraphQLRequest(query, onSuccess)
    return false       
}

function checkUserRequirements(event) {
    if (event) event.preventDefault()
    let username = document.getElementById("loginUsername").value   
    isCaptchaRequired(username)
    isPinRequired(username)
    return false 
}


function isCaptchaRequired(username) {
    var query =`  query { is_captcha_required(  username: "${username}" ) 
        {
            is_required 
            path
        } 
    } `

    function onSuccess(res){
        model.captchaRequired = res.data.is_captcha_required.is_required
        if (model.captchaRequired) {
            getNewCaptcha()
            model.debug && console.log("Captcha IS required")
        }
    }
       
    doGraphQLRequest(query, onSuccess)   
}

function isPinRequired(username) {
    var query =`  query { is_pin_required(  username: "${username}" ) 
        {
            use_pin 
            pinrequired
            pinset
        } 
    } `

    function onSuccess(res){
        let r = res.data.is_pin_required;
        console.debug("isPinRequired()->", r);
        (r.pinset) ? hideElements("#setAuthenticatorForm") : showElements("#setAuthenticatorForm");
        (r.use_pin && r.pinrequired) ? showElements("#pin") : hideElements("#pin"); 
    }
       
    doGraphQLRequest(query, onSuccess)   
}



function resetPassword(event) {
    if (event) event.preventDefault()

    let username = document.getElementById("loginUsername").value

    var query =`
    mutation {
        generate_password(
        username: "${username}"
        ) 
        }
    `
    function onSuccess(res){
        alert(res.data.generate_password)
        refreshApp()
    }   

    doGraphQLRequest(query, onSuccess)
    return false       
}



// L O G I N E D   U S E R   **********************************************************************************************************************


function getLoginedUser() {
    model.loginedUser = null
    var query =`
    query {
        get_logined_user {
            description
            email
            fullname
            username
            disabled
            id
            pinhash
            pinrequired
            pinset      
        }
    }
    `
    
    function onSuccess(res){
        model.loginedUser = res.data.get_logined_user
        getAuthRoles(model.loginedUser.username)
        getUser(model.loginedUser.username)
    } 
    
    doGraphQLRequest(query, onSuccess)
    return false       
}

function getAuthRoles(username) {
    model.authRoles = null

    var query =`
    query {
        list_app_user_role(
            appname: "auth",
            username: "${username}"
            ) {
                rolename
            }
        }
        `

    function onSuccess(res){
        model.authRoles = res.data.list_app_user_role
    } 

    doGraphQLRequest(query, onSuccess)
    return false       
}

// P A R A M S  ***********************************************************************************************************************


function getParams() {
    model.params = null
    var query =`
    query {
        get_params {
            max_attempts
            reset_time
            selfreg
            use_captcha
            use_pin
          }
        }
    `

    function onSuccess(res){
        var p = res.data.get_params
        model.params = p
        getAppstatRest()
    } 

    doGraphQLRequest(query, onSuccess)
    return false       
}

function setParams(event) {
    if (event) event.preventDefault()
    let selfreg =       document.querySelector("#formParams input[name='selfreg']").checked
    let use_captcha =   document.querySelector("#formParams input[name='use_captcha']").checked
    let use_pin =       document.querySelector("#formParams input[name='use_pin']").checked
    let max_attempts =  document.querySelector("#formParams input[name='max_attempts']").value
    let reset_time =    document.querySelector("#formParams input[name='reset_time']").value
    
    var query =`
    query {
        set_params(
        selfreg:      ${selfreg},
        use_captcha:  ${use_captcha},
        use_pin:      ${use_pin},
        max_attempts: ${max_attempts},
        reset_time:   ${reset_time}
        ) {
            max_attempts
            reset_time
            selfreg
            use_captcha
            use_pin
          }
        }
    `

    function onSuccess(res){
        model.params = res.data.set_params
        alert("params saving success")
    }

    doGraphQLRequest(query, onSuccess, "paramsError")
    return false       
}


// function getAppstat(event) {
//     if (event) event.preventDefault()
//     var query =`
//     query {
//         get_stat {
//             alloc
//             requests_per_day
//             requests_per_hour
//             requests_per_minute
//             requests_per_second
//             sys
//             total_alloc
//           }
//         }
//     `

//     function onSuccess(res){
//         var m = res.data.get_stat
//         model.appstat = m
//     } 

//     doGraphQLRequest(query, onSuccess, "appstatError")
//     return false       
// }

function getAppstatRest(event) {
    if (event) event.preventDefault()
    getAppstatRest.counter = getAppstatRest.counter === undefined ? 0: getAppstatRest.counter+1
    console.log("getAppstatRest.counter = ",getAppstatRest.counter)


    fetch(model.appurl + "/stat").then(x => x.json())
    .then( onSuccess )
    .catch( err => {
        console.log("fetch error:",err)
        return
        }
    )  

    function onSuccess(res){
        var m = res
        model.appstat = m
    } 
    return false       
}

model.statInterval = null
function startGettingAppstat(){
    clearInterval(model.statInterval)
    getAppstatRest()
    model.statInterval = setInterval(getAppstatRest, 3000)
    console.log('startGettingAppstat')
}

function stopGettingAppstat(){
    clearInterval(model.statInterval)
    console.log('stopGettingAppstat')
}

// U S E R S  ***********************************************************************************************************************


function formListUserSubmit(event) {
    if (event) event.preventDefault()
    model.users = null
    let search = document.querySelector("#formListUser input[name='search']").value
    
    var query =`
    query {
        list_user(
        search: "${search}",
        order: "fullname ASC"
        ) {
            length
            list {
              description
              email
              fullname
              username
              disabled
              id
              pinhash
              pinrequired
              pinset        
              }
          }
        }        
    `
    
    function onSuccess(res){
        model.users = res.data.list_user.list
    } 

    doGraphQLRequest(query, onSuccess)
    return false       
}




function updateUser(event) {
    if (event) event.preventDefault()
    let old_username =  document.querySelector("#formUser input[name='old_username']").value
    let username =      document.querySelector("#formUser input[name='username']").value
    let password =      document.querySelector("#formUser input[name='password']").value
    let email    =      document.querySelector("#formUser input[name='email']").value
    let fullname =      document.querySelector("#formUser input[name='fullname']").value
    let description =   document.querySelector("#formUser *[name='description']").value
    let disabled =      document.querySelector("#formUser input[name='disabled']").value
    let pinhash =       document.querySelector("#formUser input[name='pinhash']").value
    let pinrequired =   document.querySelector("#formUser input[name='pinrequired']").checked
    let pinset =        document.querySelector("#formUser input[name='pinset']").checked
    
    var query =`
    mutation {
        update_user(
        old_username: "${old_username}",
        username: "${username}",
        password: "${password}",
        email: "${email}",
        fullname: "${fullname}",
        description: "${description}",
        disabled: ${disabled},
        pinhash: "${pinhash}",
        pinrequired: ${pinrequired},
        pinset: ${pinset}
        ) {
            description
            email
            fullname
            username
            disabled
            id
            pinhash
            pinrequired
            pinset        
          }

        }
    `

    function onSuccess(res){
        alert("update_user success")
        refreshData()
        model.user = res.data["update_user"]
        getUser(username)
    }

    doGraphQLRequest(query, onSuccess, "userError")
    return false       
}


function createUser(event) {
    if (event) event.preventDefault()
    let username =      document.querySelector("#formUser input[name='username']").value
    let password =      document.querySelector("#formUser input[name='password']").value
    let email    =      document.querySelector("#formUser input[name='email']").value
    let fullname =      document.querySelector("#formUser input[name='fullname']").value
    let description =   document.querySelector("#formUser *[name='description']").value
    let disabled =      document.querySelector("#formUser input[name='disabled']").value
    let pinhash =       document.querySelector("#formUser input[name='pinhash']").value
    let pinrequired =   document.querySelector("#formUser input[name='pinrequired']").checked
    let pinset =        document.querySelector("#formUser input[name='pinset']").checked
    
    var query =`
    mutation {
        create_user(
        username: "${username}",
        password: "${password}",
        email: "${email}",
        fullname: "${fullname}",
        description: "${description}",
        disabled: ${disabled},
        pinhash: "${pinhash}",
        pinrequired: ${pinrequired},
        pinset: ${pinset}
        ) {
            description
            email
            fullname
            username
            disabled
            id
            pinhash
            pinrequired 
            pinset       
          }

        }
    `

    function onSuccess(res){
        alert("create_user success")
        refreshData()
        model.user = res.data["create_user"]
        if (!model.logined) {
            alert(`"${username}" is created.` )
            showPage('login',true)
        }
        getUser(username)
    }

    doGraphQLRequest(query, onSuccess, "userError")
    return false       
}


function getUser(username) {
    model.user = null
    var query =`
    query {
        get_user(
        username: "${username}"
        ) {
            description
            email
            fullname
            username
            disabled
            id
            pinhash
            pinrequired
            pinset     
          }
        
        list_app_user_role(
        username: "${username}"
        ) {
            app_description
            appname
            rolename
            username
          }
        
        }

    `

    function onSuccess(res){
        var u = res.data.get_user
        u.apps = groupApps(res.data.list_app_user_role)
        // render 
        model.user = u
    } 

    doGraphQLRequest(query, onSuccess)
    return false       
}



function groupApps(list_app_user_role) {
    if (!list_app_user_role) return []
    
    let gr = {}
    for (let aur of list_app_user_role ){
        if (!gr[aur.appname]) gr[aur.appname] =[]
        gr[aur.appname].push(aur)
    }

    let arr = []

    for (let [key, value] of Object.entries(gr)) {
        let rec = {}
        rec.appname =key
        rec.app_description = value[0].app_description
        rec.items = value
        arr.push(rec)
    }
    return arr
}



function deleteUser(username) {
    var query =`
    mutation {
        delete_user(
        username: "${username}"
        ) {
            username
          }
        }
    `
    function onSuccess(res){
        model.user = null
        refreshData()
        showPage('users')
    } 

    doGraphQLRequest(query, onSuccess)
    return false       
}


// A P P S  *******************************************************************

function formListAppSubmit(event) {
    if (event) event.preventDefault()
    model.apps = null
    let search = document.querySelector("#formListApp input[name='search']").value
    var query =`
    query {
        list_app(
        search: "${search}",
        order: "description ASC"
        ) {
            length
            list {
              appname
              description
              url
              rebase
              public
              sign
            }
          }
        }    `

    function onSuccess(res){
        model.apps = res.data.list_app.list
    } 

    doGraphQLRequest(query, onSuccess)
    return false       
}




function createApp(event) {
    if (event) event.preventDefault()
    let appname =     document.querySelector("#formApp input[name='appname']"    ).value
    let url =         document.querySelector("#formApp input[name='url']"        ).value
    let description = document.querySelector("#formApp input[name='description']").value
    let rebase =      document.querySelector("#formApp input[name='rebase']"     ).value
    let _public =     document.querySelector("#formApp input[name='public']"     ).value
    let sign =        document.querySelector("#formApp input[name='sign']"       ).value
    
    var query =`
    mutation {
        create_app(
        appname: "${appname}",
        url: "${url}",
        description: "${description}",
        rebase: "${rebase}",
        public: "${_public}",
        sign: "${sign}"
        ) {
            description
            appname
            url
            rebase
            public
            sign
          }

        }
    `
    function onSuccess(res){
        alert("create_app success")
        refreshData()
        model.app = res.data["create_app"]
        getApp(appname)
    } 

    doGraphQLRequest(query, onSuccess, "appError")
    return false       
}


function updateApp(event, appOperationName = 'create_app') {
    if (event) event.preventDefault()
    let old_appname = document.querySelector("#formApp input[name='old_appname']"    ).value
    let appname =     document.querySelector("#formApp input[name='appname']"    ).value
    let url =         document.querySelector("#formApp input[name='url']"        ).value
    let description = document.querySelector("#formApp input[name='description']").value
    let rebase =      document.querySelector("#formApp input[name='rebase']"     ).value
    let _public =     document.querySelector("#formApp input[name='public']"     ).value
    let sign =        document.querySelector("#formApp input[name='sign']"       ).value
    
    var query =`
    mutation {
        update_app(
        old_appname: "${old_appname}",
        appname: "${appname}",
        url: "${url}",
        description: "${description}",
        rebase: "${rebase}",
        public: "${_public}",
        sign: "${sign}"
        ) {
            description
            appname
            url
            rebase
            public
            sign
          }

        }
    `
    function onSuccess(res){
        alert("update_app success")
        refreshData()
        model.app = res.data["update_app"]
        getApp(appname)
    } 

    doGraphQLRequest(query, onSuccess, "appError")
    return false       
}





function getApp(appname) {
    model.app = null

    var query =`
    query {
        get_app(
        appname: "${appname}"
        ) {
            description
            appname
            url
            rebase
            public
            sign
          }
        
        list_app_user_role(
        appname: "${appname}"
        ) {
            appname
            rolename
            user_fullname
            user_disabled
            username
          }
        
        }

    `

    function onSuccess(res){
        var a = res.data.get_app
        a.users = groupUsers(res.data.list_app_user_role)
        // render
        model.app = a
    } 

    doGraphQLRequest(query, onSuccess)
    return false       
}


function groupUsers(list_app_user_role) {
    let gr = {}
    for (let aur of list_app_user_role ){
        if (!gr[aur.username]) gr[aur.username] =[]
        gr[aur.username].push(aur)
    }

    let arr = []

    for (let [key, value] of Object.entries(gr)) {
        let rec = {}
        rec.username =key
        rec.user_fullname = value[0].user_fullname
        rec.items = value
        arr.push(rec)
    }
    return arr
}



function deleteApp(appname) {
    var query =`
    mutation {
        delete_app(
        appname: "${appname}"
        ) {
            appname
          }
        }
    `
    function onSuccess(res){
        model.app = null
        refreshData()
        showPage('apps') ;
    } 

    doGraphQLRequest(query, onSuccess)
    return false       
}




// A P P   U S E R   R O L E   **************************************************************************************************

function getAllApps(event) {
    if (event) event.preventDefault()
    model.allApps = null
    var query =`
    query {
        list_app(
        order: "appname ASC"
        ) {
            length
            list {
              appname
              description
              url
              rebase
              public 
              sign
            }
          }
        }    `

    function onSuccess(res){
        model.allApps = res.data.list_app.list
    } 

    doGraphQLRequest(query, onSuccess)
    return false       
}


function getAllUsers(event) {
    if (event) event.preventDefault()
    model.allUsers = null
    var query =`
    query {
        list_user(
        order: "fullname ASC"
        ) {
            length
            list {
              username
              fullname
              email
              description
              disabled
              id
              pinhash
              pinrequired
              pinset       
              }
          }
        }    `

    function onSuccess(res){
        model.allUsers = res.data.list_user.list
    } 

    doGraphQLRequest(query, onSuccess)
    return false       
}

function formListRoleSubmit(event) {
    if (event && event.preventDefault ) event.preventDefault()
    model.app_user_roles = null
    let appname =  document.getElementById("allApps").value
    let username = document.getElementById("allUsers").value
    if (!appname || !username) 
        return

    var query =`
    query {
        list_app_user_role(
        appname: "${appname}",
        username: "${username}"
        ) {
            rolename
          }
        }        
        `

    function onSuccess(res){
        model.app_user_roles = res.data.list_app_user_role
    } 

    doGraphQLRequest(query, onSuccess)
    return false       
}


function modifyRole(action,appname,username,rolename, onsuccess ) {
    if (!appname || !username || !rolename) return

    var query =`
    mutation {
        ${action}_app_user_role(
        appname: "${appname}",
        username: "${username}",
        rolename: "${rolename}"
        ) {
            rolename
            appname
            username
          }
        }
    `
    function onSuccess(res){
        if (onsuccess) onsuccess()
    }

    doGraphQLRequest(query, onSuccess)
    return false       
}

// works when input values on roles page change
function refreshRoles() {
    let allUsersValue = document.getElementById("allUsers").value
    if (allUsersValue) {
        let ui = document.querySelector(`#allUsersDataList>option[value='${allUsersValue}']`).innerText
        document.getElementById('userInfo').innerText = ui   
    }

    let allAppsValue = document.getElementById("allApps").value
    if (allAppsValue) {
        let ai = document.querySelector(`#allAppsDataList>option[value='${allAppsValue}']`).innerText
        document.getElementById('appInfo').innerText = ai
    }

    if (allUsersValue && allAppsValue) 
        formListRoleSubmit() 
}


function filterRows(selector, value ){
    var v = value.toLowerCase()
    var rows = document.querySelectorAll(selector)
    rows.forEach(e => {
        var txt = e.innerText.toLowerCase()
        if (txt.indexOf(v) == -1) {
            e.classList.add("hidden")
        } else {
            e.classList.remove("hidden")
        }
    });
}

function hideElements(selector) {
    document.querySelectorAll(selector).forEach(e => e.classList.add("hidden"));
}


function showElements(selector) {
    document.querySelectorAll(selector).forEach(e => e.classList.remove("hidden"));
}

function addClass(selector, classname) {
        document.querySelectorAll(selector).forEach(e => e.classList.add(classname));
}

function removeClass(selector, classname) {
    document.querySelectorAll(selector).forEach(e => e.classList.remove(classname));
}


function hidePassword() {
    document.querySelector("#formUser input[name='password']").setAttribute('type','password')
}

function showPassword() {
    document.querySelector("#formUser input[name='password']").setAttribute('type','text')
}

function removeQueryStringFromBrowserURL() {
    let url = document.location.href
    let url1 = url.replace(/\?.*/, '')
    let url2 = url1+"?url="+model.appurl
    history.replaceState(null,null,url2)   
}

function newPassword (n, numbers=false) {
    let pickSymbol =(s) => s[Math.floor(Math.random()*s.length)]
    var symbolSets =numbers? ["0123456789"]:["bcdfghjklmnpqrstvwxz","aeiou"] 
    var password = ''
    for (let i=0; i<n; i++){
        password += pickSymbol(symbolSets[i%symbolSets.length])
    }
    return password
}


function generatePassword() {
    document.querySelector("#formUser input[name='password']").value = newPassword(9)
}

function generatePinHash() {
    let hash = newPassword(20,true);
    document.querySelector("#formUser input[name='pinhash']").value = hash;
    setPinUrl();
}

function setPinUrl(){
    console.debug("setPinUrl()")
    let input = document.querySelector("#formUser input[name='pinhash']")
    let hash = input.value
    hash = hash.replaceAll(" ","")
    input.value = hash
    let url = model.appurl+'/set_authenticator/'+hash
    let link = document.getElementById('newPinUrl')
    link.innerText = url
    link.href = url
    document.getElementById('pinUrlContainer').style.display= hash? "block": "none"
}

function buildSocialIcons(url) {
        fetch(url).then(x => x.json())
        .then( t => renderOauthProvidersJSON(t) )
        .catch( err => {
            console.log("fetch error:",err)
            return
            }
        )  
}

function renderOauthProvidersJSON(jsn) {
    let el = document.getElementById('socialIcons')
    
    if (!el) return
    
    el.innerHTML = ''
    let icons = []
    for (let [k,v] of Object.entries(jsn) ) {
        icons.push(`
        <div class="social-element">
        <a class="button button-clear" title="login via ${k}" href="${model.appurl + v[0]}">
        ${k}
        <br>
        <img class="social-icon" src="images/${k}.svg">
        </a>
        <!--
        <br>
        <a class="social-logout" title="logout from ${k}" href="${model.appurl + v[1]}">logout</a>
        -->
        </div>
        
        
        `)
    }
    
    
    if (icons.length > 0){
        el.innerHTML = '<div class="socialHeader">войти через</div>' + icons.join(' ')
        showElements("#selfRegHelpText")
        removeClass('#socialIcons', 'transparent')
    } else {
        hideElements("#selfRegHelpText")
    }
}



function getNewCaptcha() {
    let uri = model.appurl+"/captcha?"+ new Date().getTime()
    document.getElementById("captchaImg").src = uri
    return false
}


// G O O G L E   C H A R T S  ***************************************************************

var gauges = {}

function drawGauge(title, val, maxV, containerID) {

    if (!google) return
    var container = document.getElementById(containerID)
    if (! container) return

    if (! gauges[title]) {
        gauges[title]={}
        gauges[title].data = google.visualization.arrayToDataTable([['Label', 'Value'], [title, 0]])
    }
    if (container.innerHTML == ""){
        gauges[container]=container
        gauges[title].chart = new google.visualization.Gauge(container)
        console.log("Redraw gauge container:", containerID)
    }

    // set values
    gauges[title].data.setValue(0, 1, val)

    let maxVal = maxV ? maxV: getUpperLimit(val)
    var options = {
        // width: 120,
        height:  120, 
        animation:{
            duration: 700
        },
        greenFrom:0, greenTo: maxVal*0.2,
        yellowFrom: maxVal*0.8, yellowTo: maxVal*0.9,
        redFrom: maxVal*0.9, redTo: maxVal,
        minorTicks: 5,
        // redColor: '#E10098',
        // greenColor: 'cyan',
        max: maxVal
    }

    // draw the chart
    gauges[title].chart.draw(gauges[title].data, options)
}


function getUpperLimit(n) {
    var lim = 10
    while (n > lim) lim *= 10
    return lim
}

// **********************************************************************************************
// **********************************************************************************************
// **********************************************************************************************


function clearLoginForm() {
    document.getElementById("loginUsername").value = ""
    document.getElementById("loginPassword").value = ""
    document.getElementById("loginCaptcha").value = ""
    document.getElementById("loginError").innerText = ""
    document.getElementById("socialLoginError").innerHTML = ""
    document.getElementById("oauth2email").innerHTML = ""
}


function logout() {
    logoutGraphQLFormSubmit()
    clearLoginForm()
    showPage('login',true)
    isSelfRegAllowed()
    model.captchaRequired = false
    return false
}


// refreshData() если пользователь залогинен наполняет модель данными,
// в противном случае или обнуляет модель.
function refreshData() {
    if (model.logined) {
        getAllApps()
        getAllUsers()
        formListAppSubmit()
        formListUserSubmit()  
    } else {
        // nullify model's inner props
        for (const k of Object.keys(model)) {
            if (k.startsWith('_')) {
                model[k] = null
            }
        }
        isSelfRegAllowed()
   }    
}

function getCurrentPageID(){
    var p = location.hash.slice(1)
    return (!p || p.includes('=')) ? 'apps' : p
}

// refreshApp обновляет данные модели и GUI
function refreshApp() {
    refreshData()
    
    if (model.logined) {
        let page = getCurrentPageID()
        showPage(page) 
        showElements('#menu')     
        hideElements('#menuUnlogined')     
    } else {
        showPage('login',true)
        hideElements('#menu')
        showElements('#menuUnlogined')
    }  
}



window.onhashchange = function(event) {
    model.debug && console.log("onhashchange", event)
    var newpage = event.newURL.split('#')[1]
    if (newpage) 
        showPage(newpage)
}


function setAppParams(){
    model.oauth2email = model.urlParams.get('oauth2email') || ''
    model.oauth2name = model.urlParams.get('oauth2name') || ''
    model.oauth2id = model.oauth2email.replace(/@.*/,'')
    document.getElementById('oauth2email').innerHTML = model.oauth2email

    var url = model.urlParams.get('url')
    var css = model.urlParams.get('css')
    var oauth2error = model.urlParams.get('oauth2error')
    var alrt = model.urlParams.get('alert')
    if (alrt) alert(alrt)
    document.getElementById('socialLoginError').innerHTML = oauth2error
    if (css) 
        document.getElementById('theme').href = css
    model.appurl = url ? url : 'https://auth-proxy.rg.ru'
    removeQueryStringFromBrowserURL()
    //?
    model.captchaRequired = false
}



function init() {
    renderTemplateFile('mustache/params.html', model, '#paramsPage')
    google.charts.load('current', {'packages':['gauge']})
    google.charts.setOnLoadCallback(getAppstatRest)
    
    setAppParams()
    getLoginedUser()
    refreshApp()      
}


// O N   P A G E   L O A D  ****************************************************************************************

init()
