declare const _default: {
    api: {
        user: {
            get: (args: number) => import("axios").AxiosPromise<import("../src/models/user").User>;
            post: (args: {
                name: string;
            }) => import("axios").AxiosPromise<import("../src/models/user").User>;
            put: (args: {
                id: number;
                user: import("../src/models/user").User;
            }) => import("axios").AxiosPromise<void>;
        };
        product: {
            get: (args: {
                id: number;
            }) => import("axios").AxiosPromise<{
                id: number;
                name: string;
            }>;
            post: (args: {
                name: string;
            }) => import("axios").AxiosPromise<{
                id: number;
                name: string;
            }>;
            put: (args: {
                id: number;
                product: {
                    name: string;
                    id: number;
                };
            }) => import("axios").AxiosPromise<void>;
        };
    };
};
export default _default;
