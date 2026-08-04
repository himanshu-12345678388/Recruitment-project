const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports={

    entry:path.join(__dirname,'..','src','index.js'),

    output:{
        path:path.join(__dirname,'..','dist'),
        filename:'bundle.js',
        publicPath:'/'
    },
    mode: 'development',

    devServer:{
        port:3000,
        historyApiFallback:true,
        hot:true
    },

    module:{
        rules:[
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: { loader: 'babel-loader'}
            },
            {
                test:/\.css$/,
                use:['style-loader','css-loader']
            }
        ]
    },

    plugins:[
        new HtmlWebpackPlugin({
            template: path.join(__dirname,'..','public','index.html')
        })
    ],

    resolve:{
        extensions:['.js','.jsx']
    }
};