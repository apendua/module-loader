/**
 * @author apendua / apendua@gmail.com
 */

// module request

var ModuleRequest = function (name) { this.name = name; this.listeners = [] };

ModuleRequest.prototype.verify = function () {
  if (this.handler && _.isFunction(this.handler.verify))
    return this.handler.verify();
};

ModuleRequest.prototype.loaded = function (module) {
  if (this.handler && _.isFunction(this.handler.loaded))
    return this.handler.loaded(module);
};

// module loader

ModuleLoader = { _requests: {} };

ModuleLoader.define = function (name, handler) {
  if (_.has(ModuleLoader._requests, name))
    throw new Error('module ' + name + ' is already defined');
  var request = ModuleLoader._getRequest(name);
  request.handler = handler || {};
  // check if someone is waiting for this module
  if (request.listeners.length > 0)
    ModuleLoader.load(name);
};

ModuleLoader.ready = function (name, action) {
  if (!_.isFunction(action))
    throw new Error('ModuleLoader.ready: the second argument must be a function');
  var request = ModuleLoader._getRequest(name);
  if (!request.module) {
    var listener = {stopped: false, action: action};
    // register listener
    request.listeners.push(listener);
    // tell that we want to load the module
    ModuleLoader.load(name);
    // handle to discard the listener
    return {stop: function (){listener.stopped=true;}};
  }
  action.call(undefined, request.module);
  return {stop: function (){}};
};

ModuleLoader.load = function (name) {
  var request = ModuleLoader._getRequest(name);
  // maybe the module is defined locally?
  if (!request.module)
    request.module = request.verify();
  if (request.module || request.lock || !request.handler)
    // either the module has already been loaded,
    // or it's beeing loaded right now
    // or it has not been defined yet
    return;
  // prevent mutiple ajax calls
  request.lock = true;
  //TODO: handle progress event
  $.ajax({
    url      : request.handler.source,
    type     : 'GET',
    dataType : 'script',
  }).done(function (message) {
    //TODO: can we use this message somehow (?) 
    // verify if the module has been loaded properlly
    request.module = request.verify();
    if (request.module) {
      request.loaded(request.module);
      while (request.listeners.length > 0) {
        listener = request.listeners.shift();
        if (!listener.stopped)
          listener.action.call(undefined, request.module);
      }
    } else {
      console.log('ERROR: module ', request.name, ' failed to load...');
    }
  }).fail(function (jqXHR, textStatus) {
    console.log('ERROR: unable to load source code from ', request.handler.source);
  });
};

// private routines

ModuleLoader._getRequest = function (name) {
  var requests = ModuleLoader._requests;
  if (_.has(requests, name))
    return requests[name];
  return requests[name] = new ModuleRequest(name);
};
