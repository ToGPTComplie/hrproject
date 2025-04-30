import React from 'react';
import { Layout, Menu } from 'antd';
import { FormOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';

const { Sider } = Layout;

const AppSider = () => {
  const menuItems = [
    {
      key: 'form',
      icon: <FormOutlined />,
      label: '表单组件',
      children: [
        { key: 'input', label: '输入框' },
        { key: 'select', label: '下拉选择' },
        { key: 'datepicker', label: '日期选择' },
        { key: 'upload', label: '文件上传' }
      ]
    },
    {
      key: 'workflow',
      icon: <SettingOutlined />,
      label: '流程组件',
      children: [
        { key: 'approval', label: '审批节点' },
        { key: 'notification', label: '通知节点' },
        { key: 'condition', label: '条件节点' },
        { key: 'assignment', label: '任务分配' }
      ]
    },
    {
      key: 'hr',
      icon: <UserOutlined />,
      label: 'HR组件',
      children: [
        { key: 'employee', label: '员工信息' },
        { key: 'department', label: '部门信息' },
        { key: 'attendance', label: '考勤记录' },
        { key: 'salary', label: '薪资管理' }
      ]
    }
  ];

  return (
    <Sider width={200} theme="light">
      <Menu
        mode="inline"
        defaultOpenKeys={['form', 'workflow', 'hr']}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
};

export default AppSider;