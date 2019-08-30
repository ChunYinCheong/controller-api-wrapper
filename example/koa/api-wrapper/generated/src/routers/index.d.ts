declare const routers: {
    path: string;
    route: {
        api: {
            path: string;
            route: {
                user: {
                    path: string;
                    route: {
                        get: {
                            path: string;
                            method: string;
                            handler: (id: number) => import("../models/user").User;
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
                product: {
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
            };
        };
    };
};
export default routers;
