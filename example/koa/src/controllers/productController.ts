//  ProductController.ts
let getProduct = (arg: { id: number }) => { return { id: arg.id, name: ("product " + arg.id) } };
let putProduct = (arg: { id: number, product: { name: string, id: number } }) => { console.log(arg) };
let postProduct = (product: { name: string }) => { return { id: 1, name: product.name } };
const productController = {
    getProduct,
    putProduct,
    postProduct
};
export default productController;
