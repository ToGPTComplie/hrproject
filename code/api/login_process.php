<?php
// 设置响应头
header('Content-Type: application/json');

// 获取POST数据
$postData = json_decode(file_get_contents('php://input'), true);

// 如果没有接收到数据，返回错误
if (!$postData) {
    echo json_encode([
        'success' => false,
        'message' => '未接收到数据'
    ]);
    exit;
}

// 获取用户名和密码
$username = isset($postData['username']) ? $postData['username'] : '';
$password = isset($postData['password']) ? $postData['password'] : '';

// 验证用户名和密码是否为空
if (empty($username) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => '用户名和密码不能为空'
    ]);
    exit;
}

// 数据库连接配置
$dbConfig = [
    'host' => 'localhost',
    'username' => 'root',
    'password' => '',
    'database' => 'hr_system'
];

// 连接数据库
try {
    $conn = new mysqli(
        $dbConfig['host'],
        $dbConfig['username'],
        $dbConfig['password'],
        $dbConfig['database']
    );

    // 检查连接
    if ($conn->connect_error) {
        throw new Exception("数据库连接失败: " . $conn->connect_error);
    }

    // 设置字符集
    $conn->set_charset("utf8");

    // 准备SQL语句（使用预处理语句防止SQL注入）
    $stmt = $conn->prepare("SELECT id, username, password, role FROM users WHERE (username = ? OR phone = ?) LIMIT 1");
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // 验证密码（假设密码已经使用password_hash加密存储）
        if (password_verify($password, $user['password'])) {
            // 登录成功
            // 在实际应用中，这里应该设置会话
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            
            echo json_encode([
                'success' => true,
                'message' => '登录成功',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'role' => $user['role']
                ]
            ]);
        } else {
            // 密码错误
            echo json_encode([
                'success' => false,
                'message' => '用户名或密码错误'
            ]);
        }
    } else {
        // 用户不存在
        echo json_encode([
            'success' => false,
            'message' => '用户名或密码错误'
        ]);
    }

    // 关闭语句和连接
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    // 处理异常
    echo json_encode([
        'success' => false,
        'message' => '服务器错误: ' . $e->getMessage()
    ]);
}
?>