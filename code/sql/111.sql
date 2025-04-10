-- 创建数据库
CREATE DATABASE IF NOT EXISTS llm_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE llm_db;

-- 题库表
CREATE TABLE IF NOT EXISTS question_banks (
                                              id INT AUTO_INCREMENT PRIMARY KEY,
                                              name VARCHAR(100) NOT NULL,
                                              description TEXT,
                                              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 题目表
CREATE TABLE IF NOT EXISTS questions (
                                         id INT AUTO_INCREMENT PRIMARY KEY,
                                         bank_id INT NOT NULL,
                                         type VARCHAR(20) NOT NULL COMMENT '填空、选择、解答等',
                                         content TEXT NOT NULL,
                                         answer TEXT,
                                         analysis TEXT,
                                         difficulty INT COMMENT '1-5表示难度',
                                         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                         FOREIGN KEY (bank_id) REFERENCES question_banks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 名词解释表
CREATE TABLE IF NOT EXISTS terminology (
                                           id INT AUTO_INCREMENT PRIMARY KEY,
                                           term VARCHAR(100) NOT NULL,
                                           definition TEXT NOT NULL,
                                           created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
                                         id INT AUTO_INCREMENT PRIMARY KEY,
                                         user_id INT NOT NULL COMMENT '预留用户系统',
                                         content_id INT NOT NULL,
                                         content_type VARCHAR(20) NOT NULL COMMENT 'question或terminology',
                                         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                         UNIQUE KEY unique_favorite (user_id, content_id, content_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建索引
CREATE INDEX idx_bank_id ON questions(bank_id);
CREATE INDEX idx_term ON terminology(term);
CREATE INDEX idx_content ON favorites(content_id, content_type);

-- 创建用户并授权
CREATE USER IF NOT EXISTS 'llm_user'@'localhost' IDENTIFIED BY 'llm_password';
GRANT ALL PRIVILEGES ON llm_db.* TO 'llm_user'@'localhost';
FLUSH PRIVILEGES;

-- 插入一些测试数据
INSERT INTO question_banks (name, description) VALUES
                                                   ('示例题库', '用于测试的题库'),
                                                   ('Python基础', 'Python编程基础题目');

INSERT INTO questions (bank_id, type, content, answer, difficulty) VALUES
                                                                       (1, '选择', '1+1=?', '2', 1),
                                                                       (1, '填空', '中国的首都是____。', '北京', 1),
                                                                       (2, '解答', '简述Python的特点', 'Python是一种解释型、面向对象、动态数据类型的高级程序设计语言。', 3);

INSERT INTO terminology (term, definition) VALUES
                                               ('Python', 'Python是一种广泛使用的解释型、高级和通用的编程语言'),
                                               ('Flask', 'Flask是一个使用Python编写的轻量级Web应用框架');



ALTER TABLE terminology ADD COLUMN examples TEXT;
UPDATE terminology SET examples = '' WHERE examples IS NULL;