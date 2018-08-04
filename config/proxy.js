
module.exports = {
    proxy: {
          '/api': {    //将www.exaple.com印射为/api
              target: 'http://120.79.0.17',  // 接口域名
              changeOrigin: true,  //是否跨域
              pathRewrite: {
                  '^/api': '/api'   //需要rewrite的,
              }
          }
    }
}