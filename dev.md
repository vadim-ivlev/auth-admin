
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


## deploy to vercel.com

Deploy to <https://auth-admin.vercel.app>

    sh/deploy.sh

or if changes were in a brunch

    git push gitlab branch:vercel


Deploy to <https://auth-admin-test.vercel.app>

    git push gitlab branch:vercel-test


Deploy to <https://auth-admin-classic.vercel.app>

    git push gitlab branch:vercel-classic






Testing <https://auth-admin-test.vercel.app>

staging-gl : <https://auth-admin-test.vercel.app/?url=https://gl-auth-staging.rg.ru>




## deploy to Gitlab

Result: <https://vadim-ivlev.gitlab.io/auth-admin/>

staging-gl : <https://vadim-ivlev.gitlab.io/auth-admin/?url=https://gl-auth-staging.rg.ru>


    git push gitlab branch:pages

