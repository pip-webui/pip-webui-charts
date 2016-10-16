module.exports = {
    module: {
        name: 'pipCharts',
        styles: 'charts'
    },
    build: {
        js: true,
        ts: false,
        html: true,
        css: true,
        lib: true,
        images: true,
        dist: false
    },
    file: {
        lib: [
            '../pip-webui-lib/dist/**/*',
            '../pip-webui-css/dist/**/*',
            '../pip-webui-services/dist/**/*',
             '../pip-webui-controls/dist/**/*',
             '../pip-webui-nav/dist/**/*',
             '../pip-webui-layouts/dist/**/*',
             '../pip-webui-themes/dist/**/*'
        ]
    },
    samples: {
        port: 8120
    },
    api: {
        port: 8121
    }
};
