import React, { useState, useEffect } from 'react';
import { Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  EyeOutlined, 
  CheckOutlined, 
  CloseOutlined 
} from '@ant-design/icons';
import DataTable from '../components/DataTable';
import StatusIndicator from '../components/StatusIndicator';
import { fetchPendingApprovals, approveLeaveRequest, rejectLeaveRequest } from '../api/leaveRequest';

/**
 * 待审批请假申请页面
 */
const PendingApprovalsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  const navigate = useNavigate();

  // 获取待审批的请假申请列表
  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const { current, pageSize, ...filters } = params;
      const response = await fetchPendingApprovals({
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
      message.error('获取待审批列表失败: ' + error.message);
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

  // 审批通过
  const handleApprove = async (record) => {
    try {
      await approveLeaveRequest(record.id, { comment: '同意' });
      message.success('已审批通过');
      fetchData(pagination); // 刷新数据
    } catch (error) {
      message.error('审批失败: ' + error.message);
    }
  };

  // 审批拒绝
  const handleReject = async (record) => {
    try {
      await rejectLeaveRequest(record.id, { comment: '不同意' });
      message.success('已审批拒绝');
      fetchData(pagination); // 刷新数据
    } catch (error) {
      message.error('审批失败: ' + error.message);
    }
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
      title: '申请人',
      dataIndex: 'applicantName',
      key: 'applicantName',
      width: 120,
      searchable: true,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 150,
      filters: [
        { text: '研发部', value: '研发部' },
        { text: '市场部', value: '市场部' },
        { text: '人事部', value: '人事部' },
        { text: '财务部', value: '财务部' },
      ],
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
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      type: 'actions',
      actions: [
        {
          key: 'view',
          label: '查看',
          icon: <EyeOutlined />,
          onClick: (record) => handleViewDetail(record),
        },
        {
          key: 'approve',
          label: '通过',
          icon: <CheckOutlined />,
          type: 'primary',
          onClick: (record) => handleApprove(record),
          needConfirm: true,
          confirmTitle: '确认通过',
          confirmContent: '确定要通过此申请吗？',
        },
        {
          key: 'reject',
          label: '拒绝',
          icon: <CloseOutlined />,
          danger: true,
          onClick: (record) => handleReject(record),
          needConfirm: true,
          confirmTitle: '确认拒绝',
          confirmContent: '确定要拒绝此申请吗？',
        },
      ],
    },
  ];

  return (
    <Card title="待审批的请假申请">
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        onRowClick={handleViewDetail}
        rowKey="id"
      />
    </Card>
  );
};

export default PendingApprovalsPage;