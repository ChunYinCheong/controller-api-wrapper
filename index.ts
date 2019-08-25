import axios, { AxiosInstance, Method, AxiosResponse } from 'axios';


export type Handler<T, U, R> = (queryOrBody?: T, routeParam?: U, other?: any) => R;
type Controllers = { [controller: string]: { [api: string]: Handler<any, any, any> | ControllerApi<any, any, any> } }
type HandlerArgument<T extends Handler<any, any, any>> = T extends Handler<infer F, any, any> ? F : any;
type RouteParameters<T extends Handler<any, any, any>> = T extends Handler<any, infer F, any> ? F : any;
export type ControllerApi<T, U, R> = {
    url: string,
    method: Method,
    handler: Handler<T, U, R>,
    validator?: Function
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


/**
   * @deprecated This is NOT tested and only for demo purpose
   */
export function wrapHandlerByRequestResponse(handler: Handler<any, any, any>) {
    return (request, response) => {
        var arg = request.method === "GET" ? request.query : request.body;
        handler(arg, request.params, { request, response });
    };
}

/**
   * @deprecated This is NOT tested and only for demo purpose
   */
export function wrapHandlerByCtx(handler: Handler<any, any, any>) {
    return async (ctx) => {
        let request = ctx.request;
        let response = ctx.response;
        var arg = request.method === "GET" ? request.query : request.body;
        handler(arg, request.params, { request, response });
    };
}