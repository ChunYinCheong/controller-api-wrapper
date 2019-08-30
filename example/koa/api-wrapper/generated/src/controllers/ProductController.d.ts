declare const productController: {
    getProduct: (arg: {
        id: number;
    }) => {
        id: number;
        name: string;
    };
    putProduct: (arg: {
        id: number;
        product: {
            name: string;
            id: number;
        };
    }) => void;
    postProduct: (product: {
        name: string;
    }) => {
        id: number;
        name: string;
    };
};
export default productController;
