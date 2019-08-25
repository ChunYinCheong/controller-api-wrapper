# controller-api-wrapper
Generate api wrapper by existing controller

# example
You can see the /test folder for more details

Controller
```
//  ProductController.ts
let getProduct = (id: number) => { return { id, name: "product" } };
let putProduct = (arg: { id: number, product: { name: string, id: number } }) => { };
let postProduct = (product: { name: string }) => { return { id: 1, name } };
const productController = {
    getProduct,
    putProduct,
    postProduct
};
export default productController;

//  UserController.ts
import { User } from "../Models/User";

let getUser = (id: number): User => { return { id, name: "user" } };
let putUser = (arg: { id: number, user: User }) => { };
let postUser = (user: { name: string }): User => { return { id: 1, name } };
const userController = {
    getUser,
    putUser,
    postUser
};
export default userController;

// CarController.ts

let getCar = ({ }, r: { id: number }) => { return { id: r.id, name: "car" } };
let getCarValidator = ({ }, r: { id: number }) => { r.id === 1 ? null : "Error!" };
const getCarApi = {
    url: 'Car/:id',
    method: "get",
    handler: getCar,
    validator: getCarValidator
};
const carController = {
    getCar: getCarApi
}
export default carController;



// Api.ts
import { wrapControllers } from '../../index';
import userController from './UserController';
import productController from './ProductController';
import carController from './CarController';

export const controllers = {
    userController,
    productController,
    carController
}
const ApiWrapper = wrapControllers(controllers);
export default ApiWrapper;
```

Route / Parameter binding

You need to wrap the controller method and do the parameter binding in order to work properly
```
// Parameter binding example
export function nodeAdapter(hc: Handler<any, any, any> | ControllerApi<any, any, any>) {
    if (hc as Handler<any, any, any>) {
        let handler = hc as Handler<any, any, any>;
        return (request, response) => {
            var arg = request.method === "GET" ? request.query : request.body;
            handler(arg, request.params, { request, response });
        };
    } else {
        let api = hc as ControllerApi<any, any, any>;
        return (request, response) => {
            var arg = request.method === "GET" ? request.query : request.body;
            var routeParam = request.params;
            if (api.validator) {
                let error = api.validator(arg, routeParam); // throw exception or return error
                if (error) {
                    throw error;
                }
            }
            api.handler(arg, routeParam, { request, response });
        };
    }
}
export function koaAdapter(hc: ControllerApi<any, any, any> | Handler<any, any, any>) {
    if (hc as ControllerApi<any, any, any>) {
        let api = hc as ControllerApi<any, any, any>;
        return async (ctx, next) => {
            let request = ctx.request;
            var arg = request.method === "GET" ? request.query : request.body;
            var routeParam = request.params;
            if (api.validator) {
                let error = api.validator(arg, routeParam); // throw exception or return error
                if (error) {
                    throw error;
                }
            }
            api.handler(arg, routeParam, { ctx, next });
        };
    } else {
        let handler = hc as Handler<any, any, any>;
        return async (ctx, next) => {
            let request = ctx.request;
            var arg = request.method === "GET" ? request.query : request.body;
            var routeParam = request.params;
            handler(arg, routeParam, { ctx, next });
        };
    }
}

// Route example
export function registerKoaRouter(router, controller: ControllerApi<any, any, any> | Controllers) {
    if (controller as ControllerApi<any, any, any>) {
        let api = controller as ControllerApi<any, any, any>;
        let callback = koaAdapter(api);
        return router[api.method.toLowerCase()](api.url, callback);
    } else {
        let controllers = controller as Controllers;
        Object.keys(controllers).forEach((key) => {
            let controller = controllers[key];
            Object.keys(controller).forEach((k) => {
                let api: ControllerApi<any, any, any>;
                if (controller[k] as Handler<any, any, any>) {
                    api = handlerToControllerApi(k, controller[k] as Handler<any, any, any>);
                } else if (controller[k] as ControllerApi<any, any, any>) {
                    api = controller[k] as ControllerApi<any, any, any>;
                }
                let callback = koaAdapter(api);
                router[api.method.toLowerCase()](api.url, callback);
            });
        });
    }
}

// In index.js
imprt Koa from 'koa';
imprt Router from 'koa-router';
import { registerKoaRouter } from "controller-api-wrapper";
import { controllers } from "./Controllers/Api";

var app = new Koa();
var router = new Router();

registerKoaRouter(router, controllers);

app.use(router.routes())
    .use(router.allowedMethods());
```

Usage
```
import ApiWrapper from "./Controllers/Api";

async function test() {
    // product
    var productId = 1;
    var res = await ApiWrapper.productController.getProduct(productId);
    var product = res.data;
    console.log(product, product.id, product.name);
    product.name = 'new name';
    ApiWrapper.productController.putProduct({ id: productId, product });
    var postProductRes = await ApiWrapper.productController.postProduct({ name: 'new product' });
    console.log(postProductRes.data);

    // user
    var usertId = 1;
    var res2 = await ApiWrapper.userController.getUser(usertId);
    var user = res2.data;
    console.log(user, user.id, user.name);
    user.name = 'new name';
    ApiWrapper.userController.putUser({ id: usertId, user });
    var postUserRes = await ApiWrapper.userController.postUser({ name: 'new user' });
    console.log(postUserRes.data);

    // car
    var res = await ApiWrapper.carController.getCar({}, { id: 1 });
    var car = res.data;
    console.log(car);
}
```

Error checking
```
async function tsError() {
    var missingParameters = await ApiWrapper.productController.getProduct(); // Expected 1-2 arguments, but got 0.
    var productRes = await ApiWrapper.productController.getProduct(1);
    var product = productRes.data;
    console.log(product, product.id, product.name);
    console.log('forgot to access data field?', productRes.id); // Property 'id' does not exist on type 'AxiosResponse<{ id: number; name: string; }>'.
    product.not_exist_field = 'new name'; // Property 'not_exist_field' does not exist on type '{ id: number; name: string; }'.
    var voidResult = await ApiWrapper.productController.putProduct({ id: 1, product });
    var voidData = voidResult.data;
    console.log('trying to access void return?', voidData.id); // Property 'id' does not exist on type 'void'.
    ApiWrapper.productController.postProduct({ name: 123 }); // Type 'number' is not assignable to type 'string'.
}
```


# License
MIT License
