declare const user: {
    path: string;
    route: {
        get: {
            path: string;
            method: string;
            handler: (arg: {
                id: number;
            }) => import("../models/user").User;
        };
        post: {
            path: string;
            method: string;
            handler: (user: {
                name: string;
            }) => import("../models/user").User;
        };
        put: {
            path: string;
            method: string;
            handler: (arg: {
                id: number;
                user: import("../models/user").User;
            }) => void;
        };
    };
};
export default user;
