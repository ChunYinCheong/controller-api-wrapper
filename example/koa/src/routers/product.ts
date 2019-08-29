import productController from "../controllers/ProductController";

const product = {
    path: '/product',
    route: {
        get: {
            path: '/:id',
            method: 'get',
            handler: productController.getProduct
        },
        post: {
            path: '',
            method: 'post',
            handler: productController.postProduct
        },
        put: {
            path: '/:id',
            method: 'put',
            handler: productController.putProduct
        }
    }
};

export default product;