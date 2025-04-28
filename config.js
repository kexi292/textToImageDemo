const config = {
    wanxiang: {
        baseUrl: 'http://localhost:3000/api/wanxiang/generate',
        taskUrl: 'http://localhost:3000/api/wanxiang/task/',
        model: 'wanx2.1-t2i-turbo'
    },
    hunyuan: {
        baseUrl: 'http://localhost:3000/api/hunyuan/generate',
        taskUrl: 'http://localhost:3000/api/hunyuan/task/',
        region: 'ap-guangzhou',
        endpoint: 'hunyuan.tencentcloudapi.com'
    },
    luma: {
        // Luma AI API配置待添加
    },
    mass: {
        // Mass API配置待添加
    }
}; 