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