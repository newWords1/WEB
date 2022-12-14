const path = require("path") //node.js核心模块,用来处理路径问题
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//该插件用于将css提取到单独的文件中,为每个包含 CSS 的 JS 文件创建一个 CSS 文件，并且支持 CSS 和 SourceMaps 的按需加载
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 这个插件使用 cssnano 优化和压缩 CSS，支持缓存和并发模式下运行
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
//  JS代码压缩工具（webpack自带了,无需下载）
const TerserWebpackPlugin = require('terser-webpack-plugin');
//图片压缩
// const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");


//  查看cpu核数
const os = require('os');
const threads = os.cpus().length;
// console.log(threads,"???");

//自定义样式配置方法
function getStyleLoader(pre) {
    return [
        MiniCssExtractPlugin.loader,//提取css为单独文件,自动生成 link 标签
        'css-loader',//将css资源编译成commonJs的模块到js中
        {
            //css兼容性配置
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: [
                        [
                            'postcss-preset-env',
                            {
                                // 其他选项
                            },
                        ],
                    ],
                },
            },
        },
        pre
    ].filter(Boolean);
}


module.exports = {
    //入口
    entry: './src/main.js',
    //输出
    output: {
        //文件的输出路径
        //__dirname nodejs的变量,代表当前文件的文件夹目录
        path: path.resolve(__dirname, '../dist'),//绝对路径
        //文件名
        filename: 'static/js/[name].js',
        chunkFilename:'static/js/[name].chunk.js',
        //  图片、字体等通过type:asset处理资源命名方式
        assetModuleFilename:'static/media/[hash:10][ext][query]',
        //自动清空上一次打包内容
        //原理:在打包前,将path整个目录内容清空,再进行打包
        clean: true
    },
    //加载器
    module: {
        //  注意loader顺序是先执行后面的，因此stylus-loader这种将stylus语法转换为css应该放在最后,
        //  其次是css-loader将css转为commonjs，最后才是用style-loader将css用style标签放入html中生效
        rules: [
            //loader的配置
            {
                oneOf: [
                    {
                        test: /\.css$/, //  只检测.css文件
                        use: getStyleLoader()
                    },
                    {
                        test: /\.less$/,
                        //  loader:'xxx'只能使用1个loader
                        use: getStyleLoader('less-loader')
                    },
                    {
                        test: /\.sass$/,
                        use: getStyleLoader('sass-loader')
                    },
                    {
                        test: /\.styl$/,
                        use: getStyleLoader('stylus-loader')
                    },
                    {
                        //需要删除之前的dist文件才能看到效果
                        test: /\.(svg|jpe?g|webp|png|gif)$/,
                        type: 'asset',
                        parser: {
                            dataUrlCondition: {
                                //小于10KB的图片会转成base64
                                //优点:减少请求数量 缺点:体积会更大
                                maxSize: 10 * 1024 // 10kb
                            },
                        },
                        // generator: {
                        //     //输出图片名称([hash][ext][query]表示图片命名情况,hash:10表示取hash值前十位)
                        //     filename: 'static/images/[hash:10][ext][query]'
                        // }

                    },
                    {
                        test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
                        type: 'asset/resource',
                        // generator: {
                        //     //输出文件
                        //     filename: 'static/media/[hash:10][ext][query]'
                        // }

                    },
                    {
                        test: /\.js$/,
                        // exclude: /(node_modules)/,  //排除node_modules中的js文件(这些文件不处理)
                        include: path.resolve(__dirname, '../src'),//只处理src下文件,其他文件不处理
                        use: [
                            {
                                loader: 'thread-loader',
                                options: {
                                    works: threads - 1, //进程数量
                                }
                            },
                            {
                                loader: 'babel-loader',
                                options: {
                                    cacheDirectory: true,//开启babel缓存
                                    cacheCompression: false//关闭缓存文件压缩,节省打包时间
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    //插件
    plugins: [
        //plugin的配置
        new ESLintPlugin({
            context: path.resolve(__dirname, '../src'),
            exclude: 'node_modules',//默认值
            cache: true,//开启缓存
            cacheLocation: path.resolve(__dirname, '../node_modules/.cache/eslintcache'),
            threads //开启多进程和设置进程数量
        }),
        new HtmlWebpackPlugin({
            //  模板,以public/index.html文件创建新的html文件
            //  新的html文件特点:1.结构和原来一致2.自动引入打包的资源
            template: path.resolve(__dirname, '../public/index.html')
        }),
        new MiniCssExtractPlugin({
            filename: ('static/css/[name].css'),
            chunkFilename:'static/css/[name].chunk.css'
        }),
        //压缩方式写法一
        // new CssMinimizerPlugin(),
        // new TerserWebpackPlugin({
        //     parallel:threads,//开启多进程和设置进程数量
        // })
    ],
    //压缩方式写法二(webpack5习惯)
    optimization: {
        //  放置压缩操作
        minimizer: [
            //  压缩css
            new CssMinimizerPlugin(),
            //  压缩js
            new TerserWebpackPlugin({
                parallel: threads,//开启多进程和设置进程数量
            }),
            //  压缩图片
            // new ImageMinimizerPlugin({
            //     minimizer: {
            //         implementation: ImageMinimizerPlugin.imageminGenerate,
            //         options: {
            //             // Lossless optimization with custom option
            //             // Feel free to experiment with options for better result for you
            //             plugins: [
            //                 ["gifsicle", { interlaced: true }],
            //                 ["jpegtran", { progressive: true }],
            //                 ["optipng", { optimizationLevel: 5 }],
            //                 // Svgo configuration here https://github.com/svg/svgo#configuration
            //                 [
            //                     "svgo",
            //                     {
            //                         plugins: [
            //                             "preset-default",
            //                             "prefixIds",
            //                             {
            //                                 name:"sortAttrs",
            //                                 params:{
            //                                     xlmnsOrder:"alphabetical"
            //                                 }
            //                             }
            //                         ],
            //                     },
            //                 ],
            //             ],
            //         },
            //     },
            // }),
        ],
        //  代码分割配置
        splitChunks:{
            chunks:'all',
            //其他都用默认值
        }
    },
    //开发服务器:不会输出资源,在内存中编译打包
    // devServer: {
    //     host:'localhost',//启动服务器域名
    //     open:true,//自动打开浏览器
    //     static: {
    //       directory: path.join(__dirname, '../public'),
    //     },
    //     // compress: true,  //gzip压缩
    //     port: 3005,//启动服务器端口号
    // },
    performance: {
        maxAssetSize: 1000000,
    },
    //模式
    mode: 'production',
    devtool: 'source-map'
}