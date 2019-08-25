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