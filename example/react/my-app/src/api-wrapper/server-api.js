
    import axios from 'axios';
    const send = function f(args, o) {
    var url = o.url;
    var data = args;
    o.url.split("/").filter(function (v) {
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
    const wrapper = {api : {user : {get : function f(args) {
    return send(args, {"url":"/api/user/:id","method":"get"});
  },post : function f(args) {
    return send(args, {"url":"/api/user","method":"post"});
  },put : function f(args) {
    return send(args, {"url":"/api/user/:id","method":"put"});
  }},product : {get : function f(args) {
    return send(args, {"url":"/api/product/:id","method":"get"});
  },post : function f(args) {
    return send(args, {"url":"/api/product","method":"post"});
  },put : function f(args) {
    return send(args, {"url":"/api/product/:id","method":"put"});
  }}}};
    export default wrapper;