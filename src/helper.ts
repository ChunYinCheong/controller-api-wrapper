import axios, { Method } from 'axios';


export const sendFunc = (args: any, o: { url: string, method: string }): any => {
    let url = o.url;
    let data = args;
    o.url.split("/").filter(v => v.startsWith(":")).filter((v, i, a) => a.indexOf(v) === i).forEach(v => {
        let name = v.slice(1);
        let value = "";
        let temp = (args as any)[name];
        value = temp === undefined || temp == null ? "" : temp.toString();
        delete (data as any)[name];
        url = url.replace(v, value)
    });
    var config = {
        method: o.method as Method,
        url: url,
        params: o.method === 'get' ? data : undefined,
        data: o.method !== 'get' ? data : undefined
    };
    /* replace_token_return  */ return axios(config);
}
export const sendStr = (`import axios from 'axios';const send = ${sendFunc.toString()};`).replace("/* replace_token_return  */", "return axios(config); //");
