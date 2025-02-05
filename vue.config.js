const {defineConfig} = require('@vue/cli-service')
const webpack = require('webpack');

module.exports = defineConfig({
    transpileDependencies: true, lintOnSave: false, devServer: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:12000', changeOrigin: true, pathRewrite: {'^/api': ''}
            }
        }
    }, configureWebpack: {
        plugins: [new webpack.ProvidePlugin({
            $: "jquery", jQuery: "jquery",
        })]
    },
})
