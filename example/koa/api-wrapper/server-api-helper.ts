
import axios from 'axios';

export function send(args: any, o: any) {
    var url: string = o.url;
    var data = args;
    url.split("/").filter(function (v) {
        return v.startsWith(":");
    }).filter(function (v, i, a) {
        return a.indexOf(v) === i;
    }).forEach(function (v) {
        var name = v.slice(1);
        var value = "";
        var temp = args[name];
        value = temp === undefined || temp == null ? "" : temp.toString();
        delete data[name];
        url = url.replace(v, value);
    });
    var config = {
        method: o.method,
        url: url,
        params: o.method === 'get' ? data : undefined,
        data: o.method !== 'get' ? data : undefined
    };
    return axios(config);
};

