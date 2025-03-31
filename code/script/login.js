document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    
    loginBtn.addEventListener('click', function() {
        // 清除之前的错误信息
        errorMessage.style.display = 'none';
        
        // 获取输入值
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // 简单的前端验证
        if (!username || !password) {
            errorMessage.textContent = '用户名和密码不能为空';
            errorMessage.style.display = 'block';
            return;
        }
        
        // 禁用登录按钮，防止重复提交
        loginBtn.disabled = true;
        loginBtn.textContent = '登录中...';
        
        // 发送登录请求
        fetch('../api/login_process.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 登录成功，跳转到首页
                window.location.href = 'home.html';
            } else {
                // 显示错误信息
                errorMessage.textContent = data.message;
                errorMessage.style.display = 'block';
                
                // 重置登录按钮
                loginBtn.disabled = false;
                loginBtn.textContent = '登 录';
            }
        })
        .catch(error => {
            console.error('登录请求出错:', error);
            errorMessage.textContent = '网络错误，请稍后重试';
            errorMessage.style.display = 'block';
            
            // 重置登录按钮
            loginBtn.disabled = false;
            loginBtn.textContent = '登 录';
        });
    });
    
    // 添加回车键提交表单功能
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
});