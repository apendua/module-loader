Package.describe({
    summary: "A minimal toolset for loading modules/scripts dynamically",
});

Package.on_use(function (api) {
    api.use('underscore', 'client');
    api.use('jquery', 'client');
    api.add_files('loader.js', 'client');
    // support Meteor 0.6.5
    if (typeof api.export != 'undefined') {
      api.export('ModuleLoader', 'client');
    }    
});
