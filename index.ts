import axios, { AxiosInstance, Method, AxiosResponse } from 'axios';


export type Handler<T, U, R> = (queryOrBody?: T, routeParam?: U, other?: any) => R;
type Controllers = { [controller: string]: { [api: string]: Handler<any, any, any> | ControllerApi<any, any, any> } }
type HandlerArgument<T extends Handler<any, any, any>> = T extends Handler<infer F, any, any> ? F : any;
type RouteParameters<T extends Handler<any, any, any>> = T extends Handler<any, infer F, any> ? F : any;
export type ControllerApi<T, U, R> = {
    url: string,
    method: Method,
    handler: Handler<T, U, R>,
    validator?: (queryOrBody?: T, routeParam?: U) => any
}

export function wrapControllers<T extends Controllers>(controllers: T, axiosInstance?: AxiosInstance) {
    type WrapHandler<T extends Handler<any, any, any>> = (arg: HandlerArgument<T>, routeParam?: RouteParameters<T>) => ReturnType<T>;
    type WrapApi<T extends ControllerApi<any, any, any>> = T['handler'];
    type WrapSwitch<T extends Handler<any, any, any> | ControllerApi<any, any, any>> =
        T extends Handler<any, any, any> ? WrapHandler<T> :
        T extends ControllerApi<any, any, any> ? WrapApi<T> :
        any;
    type WrapAxios<T extends WrapSwitch<Handler<any, any, any>>> = (...args: Parameters<T>) => Promise<AxiosResponse<ReturnType<T>>>;
    type Wrap<T extends Controllers> = {
        [P in keyof T]: {
            [P2 in keyof T[P]]: WrapAxios<WrapSwitch<T[P][P2]>>
        };
    };
    type Wrapper = Wrap<typeof controllers>;

    var wrapper: Wrapper = Object.keys(controllers).reduce<any>(function (result, key) {
        let controller = controllers[key];
        result[key] = Object.keys(controller).reduce((r, k) => {
            let api: ControllerApi<any, any, any>;
            if (controller[k] as Handler<any, any, any>) {
                api = handlerToControllerApi(k, controller[k] as Handler<any, any, any>);
            } else if (controller[k] as ControllerApi<any, any, any>) {
                api = controller[k] as ControllerApi<any, any, any>;
            }
            r[k] = AxiosWrap(api, axiosInstance);
            return r;
        }, {});
        return result;
    }, {});
    return wrapper;
}

function handlerToControllerApi<T, U, R>(controllerName: string, handler: Handler<T, U, R>): ControllerApi<T, U, R> {
    if (handler.name.startsWith("get")) {
        return {
            url: controllerName.replace('Controller', '') + '/' + handler.name.slice(3),
            method: "get",
            handler
        }
    } else if (handler.name.startsWith("delete")) {
        return {
            url: controllerName.replace('Controller', '') + '/' + handler.name.slice(6),
            method: "delete",
            handler: handler
        }
    } else if (handler.name.startsWith("post")) {
        return {
            url: controllerName.replace('Controller', '') + '/' + handler.name.slice(4),
            method: "post",
            handler: handler
        }
    } else if (handler.name.startsWith("put")) {
        return {
            url: controllerName.replace('Controller', '') + '/' + handler.name.slice(3),
            method: "put",
            handler: handler
        }
    } else if (handler.name.startsWith("patch")) {
        return {
            url: controllerName.replace('Controller', '') + '/' + handler.name.slice(5),
            method: "patch",
            handler: handler
        }
    } else if (handler.name.startsWith("post")) {
        return {
            url: controllerName.replace('Controller', '') + '/' + handler.name.slice(4),
            method: "post",
            handler: handler
        }
    }
    throw Error;
}

function AxiosWrap<T, U, R>(api: ControllerApi<T, U, R>, axiosInstance: AxiosInstance) {
    type ApiHandler = typeof api.handler;
    type HandlerParameters = HandlerArgument<ApiHandler>;

    return (args: HandlerParameters, routeParam: RouteParameters<ApiHandler>) => {
        if (api.validator) {
            try {
                let error = api.validator(args, routeParam); // throw exception or return error
                if (error) {
                    return Promise.reject(error);
                }
            } catch (error) {
                return Promise.reject(error);
            }
        }
        var url = api.url;
        Object.keys(routeParam).forEach(value => {
            url = url.replace(':' + value, routeParam[value]);
        });
        var config = {
            method: api.method,
            url: api.url,
            params: api.method === 'get' ? args : undefined,
            data: api.method !== 'get' ? args : undefined
        };
        if (axiosInstance) {
            return axiosInstance.request(config);
        }
        else {
            return axios(config);
        }
    };
}


export function nodeAdapter(hc: Handler<any, any, any> | ControllerApi<any, any, any>) {
    if (hc as Handler<any, any, any>) {
        let handler = hc as Handler<any, any, any>;
        return (request, response) => {
            var arg = request.method === "GET" ? request.query : request.body;
            handler(arg, request.params, { request, response });
        };
    } else {
        let api = hc as ControllerApi<any, any, any>;
        return (request, response) => {
            var arg = request.method === "GET" ? request.query : request.body;
            var routeParam = request.params;
            if (api.validator) {
                let error = api.validator(arg, routeParam); // throw exception or return error
                if (error) {
                    throw error;
                }
            }
            api.handler(arg, routeParam, { request, response });
        };
    }
}


export function koaAdapter(hc: ControllerApi<any, any, any> | Handler<any, any, any>) {
    if (hc as ControllerApi<any, any, any>) {
        let api = hc as ControllerApi<any, any, any>;
        return async (ctx, next) => {
            let request = ctx.request;
            var arg = request.method === "GET" ? request.query : request.body;
            var routeParam = request.params;
            if (api.validator) {
                let error = api.validator(arg, routeParam); // throw exception or return error
                if (error) {
                    throw error;
                }
            }
            api.handler(arg, routeParam, { ctx, next });
        };
    } else {
        let handler = hc as Handler<any, any, any>;
        return async (ctx, next) => {
            let request = ctx.request;
            var arg = request.method === "GET" ? request.query : request.body;
            var routeParam = request.params;
            handler(arg, routeParam, { ctx, next });
        };
    }
}



export function registerKoaRouter(router, controller: ControllerApi<any, any, any> | Controllers) {
    if (controller as ControllerApi<any, any, any>) {
        let api = controller as ControllerApi<any, any, any>;
        let callback = koaAdapter(api);
        return router[api.method.toLowerCase()](api.url, callback);
    } else {
        let controllers = controller as Controllers;
        Object.keys(controllers).forEach((key) => {
            let controller = controllers[key];
            Object.keys(controller).forEach((k) => {
                let api: ControllerApi<any, any, any>;
                if (controller[k] as Handler<any, any, any>) {
                    api = handlerToControllerApi(k, controller[k] as Handler<any, any, any>);
                } else if (controller[k] as ControllerApi<any, any, any>) {
                    api = controller[k] as ControllerApi<any, any, any>;
                }
                let callback = koaAdapter(api);
                router[api.method.toLowerCase()](api.url, callback);
            });
        });
    }
}

