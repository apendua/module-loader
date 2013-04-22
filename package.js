
Package.describe({
    summary: "A minimal toolset for loading modules/scripts dynamically",
});

Package.on_use(function (api) {
    api.use('underscore', 'jquery', ['client', ]);
    api.add_files('loader.js', ['client', ]);
});
