import React, { useState, useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  FileTextOutlined,
  AuditOutlined,
  FormOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

/**
 * 应用布局组件
 * @param {React.ReactNode} children - 子组件
 */
const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 切换侧边栏折叠状态
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // 处理菜单点击 (包括侧边栏和用户下拉菜单)
  const handleMenuClick = ({ key }) => {
    // 可以根据 key 的前缀或特定值判断来源并执行不同操作
    if (key === 'logout') {
      // 处理退出登录逻辑
      console.log('Logout clicked');
      // navigate('/login'); // 例如跳转到登录页
    } else if (key === 'profile' || key === 'settings') {
      // 处理导航到个人信息或设置页面
      console.log(`Navigate to ${key}`);
      // navigate(`/${key}`);
    } else if (key.startsWith('/')) {
      // 处理侧边栏导航
      navigate(key);
    } else if (key.startsWith('notification') || key === 'all') {
        // 处理通知点击，可能导航或打开通知中心
        console.log(`Notification clicked: ${key}`)
        if (key === 'all') {
            // navigate('/notifications'); // 例如
        }
    }
  };

  // --- 用户菜单项 ---
  const userMenuItems = useMemo(() => [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      // onClick: () => handleMenuClick({ key: 'profile' }) // 也可以直接在 item 定义 onClick
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      // onClick: () => handleMenuClick({ key: 'settings' })
    },
    {
      type: 'divider', // 使用 type: 'divider' 替代 Menu.Divider
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true, // 标记为危险操作
      // onClick: () => handleMenuClick({ key: 'logout' })
    },
  ], []); // 空依赖数组，因为这些项是静态的

  // --- 通知菜单项 ---
  const notificationMenuItems = useMemo(() => [
    {
      key: 'notification1',
      label: '您有一条新的请假审批待处理',
    },
    {
      key: 'notification2',
      label: '您的请假申请已被批准',
    },
    {
      type: 'divider', // 使用 type: 'divider'
    },
    {
      key: 'all',
      label: '查看全部通知',
    },
  ], []); // 空依赖数组

  // --- 侧边栏菜单项 ---
  const siderMenuItems = useMemo(() => [
      {
        key: '/submit',
        icon: <FormOutlined />,
        label: '提交请假申请',
      },
      {
        key: '/my-requests',
        icon: <FileTextOutlined />,
        label: '我的请假记录',
      },
      {
        key: '/pending-approvals',
        icon: <AuditOutlined />,
        label: '待审批申请',
      },
      // 添加工作流管理菜单
      {
        key: 'workflow',
        icon: <SettingOutlined />,
        label: '工作流管理',
        children: [
          {
            key: '/workflow/definitions',
            label: '工作流定义',
          },
          {
            key: '/workflow/designer',
            label: '创建工作流',
          }
        ]
      },
  ], []); // 空依赖数组

  // 获取当前选中的菜单项 Key (基于路由)
  const getSelectedKeys = () => {
    const path = location.pathname;
    
    // 处理子菜单项的匹配
    for (const item of siderMenuItems) {
      // 检查是否有子菜单
      if (item.children) {
        // 在子菜单中查找匹配项
        const childMatch = item.children.find(child => 
          path.startsWith(child.key) && child.key !== '/'
        );
        if (childMatch) {
          return [childMatch.key];
        }
      }
      
      // 检查顶级菜单项
      if (path.startsWith(item.key) && item.key !== '/') {
        return [item.key];
      }
    }
    
    // 如果没有匹配，返回当前路径
    return [path];
  };
  
  // 获取当前打开的子菜单
  const getOpenKeys = () => {
    const path = location.pathname;
    
    // 查找应该展开的父菜单
    for (const item of siderMenuItems) {
      if (item.children) {
        const hasMatch = item.children.some(child => 
          path.startsWith(child.key) && child.key !== '/'
        );
        if (hasMatch) {
          return [item.key];
        }
      }
    }
    
    return [];
  };


  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* --- 侧边栏 --- */}
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <h2 style={{ color: '#1890ff', margin: 0, fontSize: collapsed ? 16 : 20, whiteSpace: 'nowrap' }}>
            {collapsed ? 'HR' : '人力资源系统'}
          </h2>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          onClick={handleMenuClick} // Menu 的 onClick 会传递 { key, keyPath, domEvent }
          items={siderMenuItems} // 使用 items 属性替代 Menu.Item 子元素
        />
      </Sider>

      {/* --- 主内容区 --- */}
      <Layout>
        {/* --- 顶部 Header --- */}
        <Header style={{
          padding: '0 16px 0 0', // 调整 padding
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          position: 'sticky', // 可选：使 Header 粘性定位
          top: 0,             // 可选：粘性定位的起始位置
          zIndex: 10          // 可选：确保 Header 在上层
        }}>
          {/* 折叠按钮 */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          {/* 右侧操作区域 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}> {/* 使用 gap 增加间距 */}
            {/* 通知 */}
            <Dropdown
              menu={{ items: notificationMenuItems, onClick: handleMenuClick }} // 使用 menu prop，并传递 items 和 onClick
              placement="bottomRight"
              trigger={['click']} // 推荐使用 click 触发下拉菜单
            >
              <Badge count={2} size="small"> {/* 使用 size="small" 让徽标更协调 */}
                <Button type="text" icon={<BellOutlined style={{ fontSize: '18px' }} />} />
              </Badge>
            </Dropdown>

            {/* 用户信息与下拉菜单 */}
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleMenuClick }} // 使用 menu prop，并传递 items 和 onClick
              placement="bottomRight"
              trigger={['click']} // 推荐使用 click 触发下拉菜单
            >
              <span style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span style={{ marginLeft: 8 }}>张三</span> {/* 移除了多余的 marginRight */}
              </span>
            </Dropdown>
          </div>
        </Header>

        {/* --- 内容区域 --- */}
        <Content style={{ margin: '24px 16px', padding: 24, background: '#f0f2f5', flexGrow: 1 }}> {/* 使用浅灰色背景 */}
          <div style={{ padding: 24, background: '#fff', minHeight: 'calc(100vh - 64px - 48px)' }}> {/* 内层容器白色背景 */}
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;