# module-loader

This is a very simple tool that provides dynamic script loading feature.

## API

The package defines a single global object called `ModuleLoader`. To define a new remote module use `ModuleLoader.define` method, e.g.

```javascript
ModuleLoader.define('mathjax', {
  source: "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML",
  verify: function () {
    return window.MathJax;
  },
  loaded: function (MathJax) {
    MathJax.Hub.Config({
      showProcessingMessages: false,
      tex2jax: { inlineMath: [['$','$'],['\\(','\\)']] }
    });
  },
});
```

To use a remote module in your application register a callback with `ModuleLoader.ready`, e.g.

```javascript
ModuleLoader.ready('mathjax', function (MathJax) {
  var nodes = $('.math');
  MathJax.Hub.Queue(["Typeset", MathJax.Hub, nodes]); 
});
```

### ModuleLoader.define (moduleName, handler)

Defines a handler object for a module identified by `moduleName`. The `handler` should contain at least the following properties:

* `source`, a string representing the remote script location,
* `verify`, a method that will be called just before and immediately after the source code is loaded;
  it should verify if the module has done what it was supposed to do (e.g. it has defined some global objects) and return an object that will reprepresent the module's exports; otherwise it should return `null`, `false` or `undefined`

Note that if `verify` returns an object before a script is loaded (this is possible if for example the global object you are waiting for is already defined by other scripts), the `ModuleLoader` will assume everything is fine and won't load any scripts.

Additionally, the `handler` object may define `loaded` method. This method will be called once, just after source file is loaded and verified, with a single argument equal to the return value of `verify`. 

### ModuleLoader.ready (moduleName, callback)

Registers a function to be called after the module identified by `moduleName` is loaded. It doesn't matter if the module has been already defined or not. Please note, that a module won't loaded unless at least one callback is registered with `ready` routine.

### ModuleLoader.load (moduleName)

Force loading the module identified by `moduleName`. This will only work if the module is already defined.

## TODO

* watch loading progress
* better documentation
* tests
