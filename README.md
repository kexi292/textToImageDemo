# AI图像生成服务

这是一个基于多个AI模型的图像生成服务，目前支持通义万相和腾讯混元两个模型的并行调用。

## 功能特点

- 支持多个AI模型并行生成图片
- 统一的API接口
- 实时状态反馈
- 简洁的用户界面
- 服务端处理所有复杂逻辑

## 技术架构

- 前端：原生JavaScript
- 后端：Node.js + Express
- API集成：
  - 通义万相 API
  - 腾讯混元 API

## 项目结构

```
├── server.js          # 后端服务器代码
├── apiService.js      # 前端API服务
├── app.js            # 前端应用逻辑
├── index.html        # 主页面
└── .env             # 环境配置文件
```

## 环境要求

- Node.js >= 12.0.0
- npm >= 6.0.0

## 安装步骤

1. 克隆项目
```bash
git clone https://github.com/kexi292/textToImageDemo
cd textToImageDemo
```

2. 安装依赖
```bash
npm install
npm install tencentcloud-sdk-nodejs-hunyuan --save
```

3. 配置环境变量
创建 `.env` 文件并添加以下配置：
```
DASHSCOPE_API_KEY=你的通义万相API密钥
TENCENT_SECRET_ID=你的腾讯云SecretId
TENCENT_SECRET_KEY=你的腾讯云SecretKey
```

## 启动服务

```bash
npm start
```

服务器将在 http://localhost:3000 启动

## API说明

### 生成图片 API

**请求**
- 端点：`/api/generate`
- 方法：POST
- 内容类型：application/json
- 请求体：
```json
{
    "prompt": "图片描述文本"
}
```

**响应**
```json
{
    "wanxiang": {
        "images": [
            { "url": "图片URL" }
        ]
    },
    "hunyuan": {
        "images": [
            { "url": "图片URL" }
        ]
    }
}
```

## 使用说明

1. 打开浏览器访问 http://localhost:3000
2. 在输入框中输入图片描述
3. 点击生成按钮
4. 等待图片生成结果
5. 查看两个模型生成的图片结果

## 错误处理

- 前端会显示清晰的错误信息
- 服务器端有统一的错误处理机制
- API调用失败会返回具体的错误信息

## 注意事项

- 确保API密钥配置正确
- 图片生成可能需要一定时间
- 建议使用现代浏览器访问

## 待实现功能

- Luma AI 集成
- Mass API 集成
- 更多图片生成选项
- 历史记录功能

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解更多详情。 