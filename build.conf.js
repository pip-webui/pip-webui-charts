module.exports = {
    module: {
        name: 'pipCharts',
        styles: 'charts',
        export: 'pip.charts',
        standalone: 'pip.charts'
    },
    build: {
        js: false,
        ts: false,
        tsd: true,
        bundle: true,
        html: true,
        less: true,
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
