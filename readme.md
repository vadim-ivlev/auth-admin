# auth-admin

<https://auth-admin.vercel.app>

frozen version: <https://auth-admin-classic.vercel.app>

## User interface for `auth-proxy` service

**auth-poxy** is an authentication and authorization service to grant access and assign user roles to web applications.
<br>

## URL parameters

If no parameters are present in the browser URL <https://auth-admin.vercel.app>
the app uses a default auth-proxy service <https://auth-proxy.rg.ru>.


    https://auth-admin.vercel.app?url=auth_roxy_url&lang=en&theme=theme_url&css=css_url

- `auth_roxy_url` - relative or absolute URL of auth-proxy service. Default https://auth-proxy.rg.ru.
- `lang` - language of user interface. Default en.
- `theme`- relative or absolute URL of color theme. 
- `css` - relative or absolute URL of CSS style sheet. 

