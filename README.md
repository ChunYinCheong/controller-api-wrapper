# WARNING
# WARNING
# WARNING
# WARNING
This package is still in development and not well tested.


# controller-api-wrapper
Generate api wrapper by existing controller

# example
Please check example/koa for more details

Project structure
```
koa/
    api-wrapper/ # generate server-api.js for frontend
        generated/
            api-wrapper/
                server-api.d.ts
                server-api.js
            src/ # *.d.ts only
                ...
        generate-server-api.ts # generate the js file
        server-api.ts # tsc will compile it to server-api.d.ts
        tsconfig.json # tsc config for code generation
    src/ server side code
        controllers/
            ...
        models/
            ...
        routers/
            ...
        app.ts
    .babelrc
    package-lock.json
    package.json
    tsconfig.json  
```

Router structure
```
// src/routers/user.ts
import userController from "../controllers/UserController";

const user = {
    path: '/user',
    route: {
        get: {
            path: '/:id',
            method: 'get',
            handler: userController.getUser
        },
        post: {
            path: '',
            method: 'post',
            handler: userController.postUser
        },
        put: {
            path: '/:id',
            method: 'put',
            handler: userController.putUser
        }
    }
};

export default user;
```

Binding example
```
/// app.ts
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { flatten } from 'controller-api-wrapper';

import routers from './routers';

const app = new Koa();
const router = new Router();


let arr = flatten(routers);
arr.forEach(v => {
  console.log(`Adding to router, method: ${v.method},\t url: ${v.url},\t name: ${v.name}`)
  if (v.method === "get") {
    router.get(v.name, v.url, (ctx, next) => {
      const arg = { ...ctx.query, ...ctx.params };
      console.log(arg);
      let r = v.handler(arg);
      console.log('r: ', r);
      ctx.body = r;
    });
  } else {
    router.get(v.name, v.url, (ctx, next) => {
      const arg = { ...ctx.request.body, ...ctx.params };
      console.log(arg);
      v.handler(arg);
      let r = v.handler(arg);
      console.log('r: ', r);
      ctx.body = r;
    });
  }
})

app.use(bodyParser())
app.use(router.routes());

module.exports = app;

if (!module.parent) app.listen(3000);
```

Generate server-api (check api-wrapper/generated)
```
$ npm run gen
```


# License
MIT License
