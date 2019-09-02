import axios, { Method, AxiosPromise } from 'axios';
import { sendStr, sendFunc } from './helper';

type Shared = {
    path?: string
}
type RouteMap = { [s: string]: Route };
type WithRoute = Shared & {
    route: RouteMap
}
type Callback<T extends { [key: string]: any }, U, R> = (args: T, ctx: U) => R;
type WithHandler<T, U, R> = Shared & {
    method: string,
    handler: Callback<T, U, R>
}
export type Route = WithHandler<any, any, any> | WithRoute;

type Api<T extends Route> = T extends WithRoute ? { [P in keyof T['route']]: Api<T['route'][P]> } : T extends WithHandler<infer T2, any, infer R2> ? (args: T2) => AxiosPromise<R2> : never;

function wrapRouteWithHandler<T, U, R>(route: WithHandler<T, U, R>, path: string = '', send: (args: any, o: any) => any) {
    let p = path + (route.path || '');
    let o = {
        url: path + (route.path || ''),
        ...route,
        method: route.method.toLowerCase()
    };
    let m = route.method.toLowerCase();
    return (args: T): AxiosPromise<R> => {
        return send(args, o);
    }
}
function wrapRouteWithRoute<T extends WithRoute>(route: T, path: string = '', send: (args: any, o: any) => any) {
    let p = path + (route.path || '');
    return wrapRouteWithRouteRoute(route.route, p, send);
}
function wrapRouteWithRouteRoute<T extends RouteMap>(routeMap: T, path: string = '', send: (args: any, o: any) => any) {
    let p = path;
    let result = {} as { [P in keyof T]: Api<T[P]> };
    for (const key in routeMap) {
        result[key] = wrapRoute(routeMap[key], p, send);
    }
    return result;
}
function isWithRoute(route: Route): route is WithRoute {
    return (route as WithRoute).route !== undefined;
}

export function wrapRoute<T extends Route>(route: T, path: string = '', send: any = sendFunc): Api<T> {
    let p = path + (route.path || '');
    if (isWithRoute(route)) {
        let wr = route as WithRoute;
        return wrapRouteWithRoute(wr, p, send) as Api<T>;
    } else {
        let wh = route as WithHandler<any, any, any>;
        return wrapRouteWithHandler(wh, p, send) as Api<T>;
    }
}

export function wrap<T extends Route>(route: T, send: (args: any, o: any) => any): Api<T> {
    let p = '';
    return wrapRoute(route, p, send);
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

export function generateJs(route: Route, path: string = 'wrapper.generated.js', header: string = sendStr) {
    let source = generate(route);

    source = `${header}
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
        ...route,
        method: route.method.toLowerCase()
    };
    return `(args) => send(args, ${JSON.stringify(o)})`;
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
