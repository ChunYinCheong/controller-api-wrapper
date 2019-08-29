import axios, { Method, AxiosPromise } from 'axios';

type Shared = {
    path?: string
}
type RouteMap = { [s: string]: Route };
type WithRoute = Shared & {
    route: RouteMap
}
type Callback<T, U, R> = (args: T, ctx: U) => R;
type WithHandler<T, U, R> = Shared & {
    method: string,
    handler: Callback<T, U, R>
}
export type Route = WithHandler<any, any, any> | WithRoute;

type Api<T extends Route> = T extends WithRoute ? { [P in keyof T['route']]: Api<T['route'][P]> } : T extends WithHandler<infer T2, any, infer R2> ? (args: T2) => AxiosPromise<R2> : never;

function wrapRouteWithHandler<T, U, R>(route: WithHandler<T, U, R>, path: string = '') {
    let p = path + (route.path || '');
    let m = route.method.toLowerCase();
    return (args: T): AxiosPromise<R> => {
        let url = p;
        let data = args;
        p.split("/").filter(v => v.startsWith(":")).filter((v, i, a) => a.indexOf(v) === i).forEach(v => {
            let name = v.slice(1);
            let value = "";
            if (typeof args === "bigint" ||
                typeof args === "number" ||
                typeof args === "string") {
                value = args.toString();
            } else if (typeof args === "object") {
                let temp = (args as any)[name];
                value = temp === undefined || temp == null ? "" : temp.toString();
                delete (data as any)[name];
            } else {
                throw "Unhandle data type";
            }
            url = url.replace(v, value)
        });
        var config = {
            method: m as Method,
            url: p,
            params: m === 'get' ? data : undefined,
            data: m !== 'get' ? data : undefined
        };
        return axios(config);
    }
}
function wrapRouteWithRoute<T extends WithRoute>(route: T, path: string = '') {
    let p = path + (route.path || '');
    return wrapRouteWithRouteRoute(route.route, p);
}
function wrapRouteWithRouteRoute<T extends RouteMap>(routeMap: T, path: string = '') {
    let p = path;
    let result = {} as { [P in keyof T]: Api<T[P]> };
    for (const key in routeMap) {
        result[key] = wrapRoute(routeMap[key], p);
    }
    return result;
}
function isWithRoute(route: Route): route is WithRoute {
    return (route as WithRoute).route !== undefined;
}

//function wrapRoute<T extends WithHandler<any, any, any>>(route: T, path?: string): Api<T>;
//function wrapRoute<T extends WithRoute>(route: T, path?: string): Api<T>;
//function wrapRoute<T extends Route>(route: T, path?: string): Api<T>;
//function wrapRoute(route: any, path: string = ''): any {
export function wrapRoute<T extends Route>(route: T, path: string = ''): Api<T> {
    let p = path + (route.path || '');
    if (isWithRoute(route)) {
        let wr = route as WithRoute;
        return wrapRouteWithRoute(wr, p) as Api<T>;
    } else {
        let wh = route as WithHandler<any, any, any>;
        return wrapRouteWithHandler(wh, p) as Api<T>;
    }
}


type Flatten = { name: string, url: string, method: string, handler: Function };
export function flatten(route: Route, path: string = '', name: string = '_'): Flatten[] {
    let p = path + (route.path || '');
    if (isWithRoute(route)) {
        let wr = route as WithRoute;
        let temp: Flatten[] = [];
        for (const key in wr.route) {
            temp = [...temp, ...flatten(wr.route[key], p, name + key + '_')];
        }
        return temp;
    } else {
        let wh = route as WithHandler<any, any, any>;
        return [{
            name,
            url: p,
            method: wh.method,
            handler: wh.handler
        }];
    }
}



const writeFile = require('write');
// import writeFile from 'write';

export function generateJs(route: Route, path: string = 'wrapper.generated.js') {
    let source = generate(route);
    let f = (args: any, o: { url: string, method: string }): any => {
        let url = o.url;
        let data = args;
        o.url.split("/").filter(v => v.startsWith(":")).filter((v, i, a) => a.indexOf(v) === i).forEach(v => {
            let name = v.slice(1);
            let value = "";
            if (typeof args === "bigint" ||
                typeof args === "number" ||
                typeof args === "string") {
                value = args.toString();
            } else if (typeof args === "object") {
                let temp = (args as any)[name];
                value = temp === undefined || temp == null ? "" : temp.toString();
                delete (data as any)[name];
            } else {
                throw "Unhandle data type";
            }
            url = url.replace(v, value)
        });
        var config = {
            method: o.method as Method,
            url: o.url,
            params: o.method === 'get' ? data : undefined,
            data: o.method !== 'get' ? data : undefined
        };
        /* replace_token_return  */
    }
    let sendFunc = (`const send = ${f.toString()};`).replace("/* replace_token_return  */", "return axios(config);");

    source = `
    import axios from 'axios';
    ${sendFunc}
    const wrapper = ${source};
    export default wrapper;`;
    console.log(source);
    // fs.writeFileSync('./generated/validate.js', source, 'utf-8');
    writeFile(path, source, function (err: any) {
        if (err) console.log(err);
    });
    return source;
}

function generate(route: Route, path: string = '') {
    // let p = path + (route.path || '');
    if (isWithRoute(route)) {
        let wr = route as WithRoute;
        return generateWithRoute(wr, path);
    } else {
        let wh = route as WithHandler<any, any, any>;
        let h = generateWithHandler(wh, path);
        return h;
    }
}
function generateWithHandler<T, U, R>(route: WithHandler<T, U, R>, path: string = '') {
    let o = {
        url: path + (route.path || ''),
        method: route.method.toLowerCase()
    };
    let f = (args: T): any => {
        /* replace_token */
    }
    return f.toString().replace("/* replace_token */", `send(args, ${JSON.stringify(o)});`)
}
function generateWithRoute<T extends WithRoute>(route: T, path: string = '') {
    let p = path + (route.path || '');
    return generateWithRouteRoute(route.route, p);
}
function generateWithRouteRoute<T extends RouteMap>(routeMap: T, path: string = '') {
    let p = path;
    let result = [];

    for (const key in routeMap) {
        result.push(`${key} : ${generate(routeMap[key], p)}`);
    }
    let r: string = '{' + result.join(',') + '}';
    return r;
}
