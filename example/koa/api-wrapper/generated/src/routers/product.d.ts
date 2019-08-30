declare const product: {
    path: string;
    route: {
        get: {
            path: string;
            method: string;
            handler: (arg: {
                id: number;
            }) => {
                id: number;
                name: string;
            };
        };
        post: {
            path: string;
            method: string;
            handler: (product: {
                name: string;
            }) => {
                id: number;
                name: string;
            };
        };
        put: {
            path: string;
            method: string;
            handler: (arg: {
                id: number;
                product: {
                    name: string;
                    id: number;
                };
            }) => void;
        };
    };
};
export default product;
