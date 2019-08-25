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

// Api.ts
import userController from './UserController';
import productController from './ProductController';
import { wrapControllers } from '../../index';

const controllers = {
    userController,
    productController
}
const ApiWrapper = wrapControllers(controllers);
export default ApiWrapper;
```

Route / Parameter binding

You need to wrap the controller method and do the parameter binding in order to work properly
```
/**
   * @deprecated This is NOT tested and only for demo purpose
   */
export function wrapHandlerByRequestResponse(handler: Handler<any, any, any>) {
    return (request, response) => {
        var arg = request.method === "GET" ? request.query : request.body;
        handler(arg, request.params, { request, response });
    };
}

/**
   * @deprecated This is NOT tested and only for demo purpose
   */
export function wrapHandlerByCtx(handler: Handler<any, any, any>) {
    return async (ctx) => {
        let request = ctx.request;
        let response = ctx.response;
        var arg = request.method === "GET" ? request.query : request.body;
        handler(arg, request.params, { request, response });
    };
}
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
