class ApiService {
    constructor() {
        // 服务器端处理所有API密钥和复杂逻辑
        this.baseUrl = 'http://localhost:3000';
    }

    async generateImages(prompt) {
        try {
            const style = document.getElementById('hunyuanStyle').value;
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt, style })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '生成图片失败');
            }

            return await response.json();
        } catch (error) {
            console.error('生成图片失败:', error);
            throw error;
        }
    }

    async generateWanxiangImage(prompt) {
        try {
            // 第一步：提交任务
            const submitResponse = await fetch(config.wanxiang.baseUrl, {
                method: 'POST',
                mode: 'cors',
                credentials: 'omit',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify({
                    prompt: prompt,
                    n: 4,  // 生成4张图片
                    size: "1024*1024"  // 设置图片大小
                })
            });

            if (!submitResponse.ok) {
                const errorData = await submitResponse.json();
                throw new Error(errorData.message || '提交任务失败');
            }

            const submitData = await submitResponse.json();
            const taskId = submitData.output.task_id;

            // 第二步：轮询任务状态
            return await this.pollTaskStatus(taskId);
        } catch (error) {
            console.error('通义万相API调用失败:', error);
            throw error;
        }
    }

    async pollTaskStatus(taskId) {
        const maxAttempts = 30;
        const interval = 2000; // 2秒
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`${config.wanxiang.taskUrl}${taskId}`, {
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': window.location.origin
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '获取任务状态失败');
                }

                const data = await response.json();
                const status = data.output.task_status;

                if (status === 'SUCCEEDED') {
                    return data.output.results;  // 返回所有结果
                } else if (status === 'FAILED') {
                    throw new Error('任务执行失败');
                }

                attempts++;
                await new Promise(resolve => setTimeout(resolve, interval));
            } catch (error) {
                console.error('轮询任务状态失败:', error);
                throw error;
            }
        }

        throw new Error('任务超时');
    }

    async generateHunyuanImage(prompt) {
        try {
            // 提交任务
            const submitResponse = await fetch(config.hunyuan.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    style: "riman",  // 使用日漫风格
                    num: 4  // 生成4张图片
                })
            });

            if (!submitResponse.ok) {
                const errorData = await submitResponse.json();
                throw new Error(errorData.message || '混元API调用失败');
            }

            const submitData = await submitResponse.json();
            
            // 检查返回的数据格式
            if (!submitData.Response || !submitData.Response.JobId) {
                throw new Error('混元API返回数据格式错误');
            }

            const jobId = submitData.Response.JobId;

            // 轮询任务状态
            return await this.pollHunyuanTaskStatus(jobId);
        } catch (error) {
            console.error('混元API调用失败:', error);
            throw error;
        }
    }

    async pollHunyuanTaskStatus(jobId) {
        const maxAttempts = 30;
        const interval = 2000; // 2秒
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const response = await fetch(`${config.hunyuan.taskUrl}${jobId}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || '获取混元任务状态失败');
                }

                const data = await response.json();

                // 检查返回的数据格式
                if (!data.Response) {
                    throw new Error('混元API返回数据格式错误');
                }

                const status = data.Response.Status;

                if (status === 'Succeeded') {
                    // 返回图片URL数组
                    return data.Response.Images.map(imageUrl => ({
                        url: imageUrl
                    }));
                } else if (status === 'Failed') {
                    throw new Error(data.Response.ErrorMsg || '混元任务执行失败');
                }

                attempts++;
                await new Promise(resolve => setTimeout(resolve, interval));
            } catch (error) {
                console.error('轮询混元任务状态失败:', error);
                throw error;
            }
        }

        throw new Error('混元任务超时');
    }

    async generateLumaImage(prompt) {
        // 待实现
    }

    async generateMassImage(prompt) {
        // 待实现
    }
} 