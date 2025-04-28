const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const tencentcloud = require("tencentcloud-sdk-nodejs-hunyuan");
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// 中间件配置
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname)));

// 初始化腾讯云混元客户端
const HunyuanClient = tencentcloud.hunyuan.v20230901.Client;
const hunyuanClient = new HunyuanClient({
    credential: {
        secretId: process.env.TENCENT_SECRET_ID,
        secretKey: process.env.TENCENT_SECRET_KEY,
    },
    region: "ap-guangzhou",
    profile: {
        httpProfile: {
            endpoint: "hunyuan.tencentcloudapi.com",
        },
    },
});

// 轮询任务状态的通用函数
async function pollTaskStatus(checkFn, maxAttempts = 30, interval = 2000) {
    let attempts = 0;
    while (attempts < maxAttempts) {
        const result = await checkFn();
        if (result.done) {
            return result.data;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
        attempts++;
    }
    throw new Error('任务超时');
}

// 通义万相图片生成（包含轮询）
async function generateWanxiangImage(prompt) {
    // 提交任务
    const submitResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
        method: 'POST',
        headers: {
            'X-DashScope-Async': 'enable',
            'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'wanx2.1-t2i-turbo',
            input: {
                prompt: prompt
            },
            parameters: {
                n: 4,
                size: "1024*1024"
            }
        })
    });

    if (!submitResponse.ok) {
        throw new Error('通义万相任务提交失败');
    }

    const submitData = await submitResponse.json();
    const taskId = submitData.output.task_id;

    // 轮询任务状态
    return await pollTaskStatus(async () => {
        const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error('获取通义万相任务状态失败');
        }

        const data = await response.json();
        const status = data.output.task_status;

        if (status === 'SUCCEEDED') {
            return { done: true, data: data.output.results };
        } else if (status === 'FAILED') {
            throw new Error('通义万相任务执行失败');
        }

        return { done: false };
    });
}

// 混元图片生成（包含轮询）
async function generateHunyuanImage(prompt, style = 'riman') {
    try {
        // 提交任务
        console.log('提交混元任务，prompt:', prompt, 'style:', style);
        const submitResult = await hunyuanClient.SubmitHunyuanImageJob({
            Prompt: prompt,
            Style: style,
            Num: 4
        });

        console.log('混元任务提交结果:', JSON.stringify(submitResult, null, 2));

        if (!submitResult || !submitResult.JobId) {
            throw new Error('混元API返回数据格式错误: ' + JSON.stringify(submitResult));
        }

        const jobId = submitResult.JobId;
        console.log('获取到混元任务ID:', jobId);

        // 轮询任务状态
        return await pollTaskStatus(async () => {
            const result = await hunyuanClient.QueryHunyuanImageJob({
                JobId: jobId
            });

            console.log('混元任务查询结果:', JSON.stringify(result, null, 2));

            if (!result) {
                throw new Error('混元任务查询返回数据格式错误');
            }

            const statusCode = result.JobStatusCode;
            const statusMsg = result.JobStatusMsg;
            console.log('混元任务状态:', statusCode, statusMsg);

            if (statusCode === '5' && result.ResultImage && result.ResultImage.length > 0) {
                return {
                    done: true,
                    data: result.ResultImage.map(url => ({ 
                        url,
                        revisedPrompt: result.RevisedPrompt && result.RevisedPrompt[0]
                    }))
                };
            } else if (result.JobErrorCode || (statusCode !== '2' && statusCode !== '5')) {
                throw new Error(result.JobErrorMsg || `混元任务执行失败: ${statusMsg}`);
            }

            return { done: false };
        });
    } catch (error) {
        console.error('混元图片生成错误:', error);
        throw error;
    }
}

// 统一的图片生成API端点
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, style } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: '缺少prompt参数' });
        }

        console.log('开始生成图片，prompt:', prompt, 'style:', style);

        // 并行调用两个API
        const [wanxiangResults, hunyuanResults] = await Promise.all([
            generateWanxiangImage(prompt).catch(error => ({
                error: `通义万相生成失败: ${error.message}`
            })),
            generateHunyuanImage(prompt, style).catch(error => ({
                error: `混元生成失败: ${error.message}`
            }))
        ]);

        // 确保返回正确的JSON格式
        return res.json({
            wanxiang: wanxiangResults.error ? { error: wanxiangResults.error } : { images: wanxiangResults },
            hunyuan: hunyuanResults.error ? { error: hunyuanResults.error } : { images: hunyuanResults }
        });
    } catch (error) {
        console.error('生成图片失败:', error);
        return res.status(500).json({ error: error.message || '服务器内部错误' });
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
}); 