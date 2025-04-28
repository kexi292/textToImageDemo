class App {
    constructor() {
        this.apiService = new ApiService();
        this.prompt = document.getElementById('prompt');
        this.generateBtn = document.getElementById('generateBtn');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.generateBtn.addEventListener('click', () => this.handleGenerate());
    }

    async handleGenerate() {
        const prompt = this.prompt.value.trim();
        if (!prompt) {
            alert('请输入提示词');
            return;
        }

        this.updateStatus('wanxiang', '生成中...');
        this.updateStatus('hunyuan', '生成中...');

        // 添加加载动画
        ['wanxiang', 'hunyuan'].forEach(apiId => {
            const containers = document.querySelectorAll(`#${apiId} .image-container`);
            containers.forEach(container => {
                container.classList.add('loading');
                container.innerHTML = '';
            });
        });

        try {
            const results = await this.apiService.generateImages(prompt);
            
            // 显示通义万相结果
            if (results.wanxiang.error) {
                this.updateStatus('wanxiang', `生成失败: ${results.wanxiang.error}`);
            } else {
                this.displayResults('wanxiang', results.wanxiang.images);
            }

            // 显示混元结果
            if (results.hunyuan.error) {
                this.updateStatus('hunyuan', `生成失败: ${results.hunyuan.error}`);
            } else {
                this.displayHunyuanResults(results.hunyuan.images);
            }

        } catch (error) {
            console.error('生成失败:', error);
            this.updateStatus('wanxiang', '生成失败: ' + error.message);
            this.updateStatus('hunyuan', '生成失败: ' + error.message);

            // 清除加载动画
            ['wanxiang', 'hunyuan'].forEach(apiId => {
                const containers = document.querySelectorAll(`#${apiId} .image-container`);
                containers.forEach(container => {
                    container.classList.remove('loading');
                });
            });
        }
    }

    updateStatus(apiId, message) {
        const statusElement = document.querySelector(`#${apiId} .status`);
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    displayResults(apiId, results) {
        const containers = document.querySelectorAll(`#${apiId} .image-container`);
        const status = document.querySelector(`#${apiId} .status`);
        
        if (results && results.length > 0) {
            status.textContent = '生成成功';
            
            // 清除所有容器的加载状态和内容
            containers.forEach(container => {
                container.classList.remove('loading');
                container.innerHTML = '';
            });

            // 显示新生成的图片
            results.forEach((result, index) => {
                if (containers[index] && result.url) {
                    const img = document.createElement('img');
                    img.src = result.url;
                    img.alt = `生成的图片 ${index + 1}`;
                    containers[index].appendChild(img);
                }
            });
        } else {
            status.textContent = '生成失败';
            containers.forEach(container => {
                container.classList.remove('loading');
                container.innerHTML = '';
            });
        }
    }

    displayHunyuanResults(results) {
        const containers = document.querySelectorAll('#hunyuan .image-container');
        const status = document.querySelector('#hunyuan .status');
        const promptDetail = document.querySelector('#hunyuan .prompt-detail');
        
        if (results && results.length > 0) {
            status.textContent = '生成成功';
            
            // 清除所有容器的加载状态和内容
            containers.forEach(container => {
                container.classList.remove('loading');
                container.innerHTML = '';
            });

            // 显示所有生成的图片
            results.forEach((result, index) => {
                if (containers[index] && result.url) {
                    const img = document.createElement('img');
                    img.src = result.url;
                    img.alt = `混元生成的图片 ${index + 1}`;
                    containers[index].appendChild(img);
                }
            });

            // 显示优化后的提示词
            if (results[0].revisedPrompt) {
                promptDetail.textContent = `优化后的提示词：\n${results[0].revisedPrompt}`;
            } else {
                promptDetail.textContent = '';
            }
        } else {
            status.textContent = '生成失败';
            containers.forEach(container => {
                container.classList.remove('loading');
                container.innerHTML = '';
            });
            promptDetail.textContent = '';
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 