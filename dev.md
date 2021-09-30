
## install

    npm i
    npm i -g now@latest


## develop

    npm run dev

Result: <http://localhost:5000>

## build

    npm run build


## push

    sh/push.sh

    

    

## deploy to Vercel

Testing <https://auth-admin-test.vercel.app>

staging-gl : <https://auth-admin-test.vercel.app/?url=https://gl-auth-staging.rg.ru>

    git push gitlab branch:vercel-test


Production: <https://auth-admin.vercel.app>

    git push gitlab branch:vercel

## deploy to Gitlab

Result: <https://vadim-ivlev.gitlab.io/auth-admin/>

staging-gl : <https://vadim-ivlev.gitlab.io/auth-admin/?url=https://gl-auth-staging.rg.ru>


    git push gitlab branch:pages

