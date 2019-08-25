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
