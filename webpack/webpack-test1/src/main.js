import count  from "./js/count";
// import sum from './js/sum';
//要想webpack打包资源必须引入资源
import './css/index.css';
import './less/index.less';
import './sass/index.sass';
import './stylus/index.styl'

import './css/iconfont.css';


console.log(count(2,1));
// console.log(sum(1,2,3,4,5));

document.getElementById('yinru').onclick = function(){
    // code-split命名写法
    import(/*webpackChunkName:"Sum"*/'./js/sum')
    .then((res)=>{
        console.log(res.default(1,2,3));
    }).catch((e)=>{
        console.log(e);
    })
}
// if (module.hot){
//     //判断是否支持热模块替换功能
//     module.hot.accept('./js/count');
//     module.hot.accept('./js/sum.js');
// }