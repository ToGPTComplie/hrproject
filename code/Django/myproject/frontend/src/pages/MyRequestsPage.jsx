import React, { useState, useEffect } from 'react';
import { Card, Button, message, Tooltip, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  EyeOutlined, 
  DeleteOutlined, 
  PlusOutlined 
} from '@ant-design/icons';
import DataTable from '../components/DataTable';
import StatusIndicator from '../components/StatusIndicator';
import { fetchMyLeaveRequests, withdrawLeaveRequest } from '../api/leaveRequest';

/**
 * 我的请假申请页面
 */
const MyRequestsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  const navigate = useNavigate();

  // 获取我的请假申请列表
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const { current, pageSize, ...filters } = params;
      const response = await fetchMyLeaveRequests({
        page: current || 1,
        pageSize: pageSize || 10,
        ...filters
      });
      
      setData(response.data || []);
      setPagination({
        ...pagination,
        current: response.current_page || 1,
        pageSize: response.page_size || 10,
        total: response.total || 0
      });
    } catch (error) {
      message.error('获取请假申请列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 处理表格变化（排序、筛选、分页）
  const handleTableChange = (pagination, filters, sorter) => {
    fetchData({
      current: pagination.current,
      pageSize: pagination.pageSize,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    });
  };

  // 查看详情
  const handleViewDetail = (record) => {
    navigate(`/detail/${record.id}`);
  };

  // 撤回申请
  const handleWithdraw = async (record) => {
    try {
      await withdrawLeaveRequest(record.id);
      message.success('申请已撤回');
      fetchData(pagination); // 刷新数据
    } catch (error) {
      message.error('撤回申请失败: ' + error.message);
    }
  };

  // 新建申请
  const handleCreateNew = () => {
    navigate('/submit');
  };

  // 表格列定义
  const columns = [
    {
      title: '申请编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '请假类型',
      dataIndex: 'leaveType',
      key: 'leaveType',
      width: 120,
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      type: 'date',
      sorter: true,
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      type: 'date',
    },
    {
      title: '请假天数',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      sorter: true,
    },
    {
      title: '申请原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      type: 'datetime',
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => <StatusIndicator status={status} />,
      filters: [
        { text: '待审批', value: 'pending' },
        { text: '审批中', value: 'processing' },
        { text: '已通过', value: 'approved' },
        { text: '已拒绝', value: 'rejected' },
        { text: '已取消', value: 'cancelled' },
      ],
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      type: 'actions',
      actions: [
        {
          key: 'view',
          label: '查看',
          icon: <EyeOutlined />,
          onClick: (record) => handleViewDetail(record),
        },
        {
          key: 'withdraw',
          label: '撤回',
          icon: <DeleteOutlined />,
          danger: true,
          // 只有待审批和审批中的申请可以撤回
          condition: (record) => ['pending', 'processing'].includes(record.status),
          needConfirm: true,
          confirmTitle: '确认撤回',
          confirmContent: '确定要撤回此申请吗？撤回后需要重新提交。',
          onClick: (record) => handleWithdraw(record),
        },
      ],
    },
  ];

  // 表格顶部操作按钮
  const tableActions = [
    {
      key: 'create',
      label: '新建申请',
      type: 'primary',
      icon: <PlusOutlined />,
      onClick: handleCreateNew,
    },
  ];

  return (
    <Card title="我的请假申请">
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        onRowClick={handleViewDetail}
        actions={tableActions}
        rowKey="id"
      />
    </Card>
  );
};

export default MyRequestsPage;