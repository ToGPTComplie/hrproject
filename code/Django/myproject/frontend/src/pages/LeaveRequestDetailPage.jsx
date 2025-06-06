import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  message, 
  Spin, 
  Alert, 
  Space, 
  Modal, 
  Input, 
  Divider,
  Row,
  Col
} from 'antd';
import { 
  ArrowLeftOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import DetailPanel from '../components/DetailPanel';
import StatusIndicator from '../components/StatusIndicator';
import ActionToolbar from '../components/ActionToolbar';
import WorkflowHistory from '../components/WorkflowHistory';
import { 
  fetchLeaveRequestDetail, 
  approveLeaveRequest, 
  rejectLeaveRequest, 
  withdrawLeaveRequest 
} from '../api/leaveRequest';

const { TextArea } = Input;

/**
 * 请假申请详情页面
 */
const LeaveRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [comment, setComment] = useState('');

  // 获取请假申请详情
  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchLeaveRequestDetail(id);
      setDetail(response);
    } catch (err) {
      console.error('获取请假申请详情失败:', err);
      setError('获取请假申请详情失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  // 返回列表页
  const handleBack = () => {
    navigate(-1);
  };

  // 打开评论模态框
  const openCommentModal = (type) => {
    setActionType(type);
    setComment('');
    setCommentModalVisible(true);
  };

  // 关闭评论模态框
  const closeCommentModal = () => {
    setCommentModalVisible(false);
    setActionType(null);
    setComment('');
  };

  // 处理操作
  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (actionType === 'approve') {
        await approveLeaveRequest(id, { comment });
        message.success('已审批通过');
      } else if (actionType === 'reject') {
        await rejectLeaveRequest(id, { comment });
        message.success('已审批拒绝');
      } else if (actionType === 'withdraw') {
        await withdrawLeaveRequest(id);
        message.success('已撤回申请');
      }
      closeCommentModal();
      fetchDetail(); // 刷新数据
    } catch (error) {
      message.error('操作失败: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // 处理工具栏操作
  const handleToolbarAction = (actionKey) => {
    if (actionKey === 'approve' || actionKey === 'reject') {
      openCommentModal(actionKey);
    } else if (actionKey === 'withdraw') {
      Modal.confirm({
        title: '确认撤回',
        content: '确定要撤回此申请吗？撤回后需要重新提交。',
        onOk: () => {
          setActionType('withdraw');
          handleAction();
        }
      });
    } else if (actionKey === 'back') {
      handleBack();
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载申请详情中...</div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <Alert
        message="错误"
        description={error}
        type="error"
        showIcon
        action={
          <Button type="primary" onClick={handleBack}>
            返回
          </Button>
        }
      />
    );
  }

  // 数据不存在
  if (!detail) {
    return (
      <Alert
        message="提示"
        description="申请详情不存在"
        type="warning"
        showIcon
        action={
          <Button type="primary" onClick={handleBack}>
            返回
          </Button>
        }
      />
    );
  }

  // 获取可用操作
  const getAvailableActions = () => {
    const actions = [
      {
        key: 'back',
        label: '返回',
        icon: <ArrowLeftOutlined />,
      }
    ];

    // 根据状态和用户角色添加不同的操作
    if (detail.status === 'pending' || detail.status === 'processing') {
      // 如果当前用户是审批人
      if (detail.currentApprover) {
        actions.push(
          {
            key: 'approve',
            label: '通过',
            icon: <CheckOutlined />,
            type: 'primary',
          },
          {
            key: 'reject',
            label: '拒绝',
            icon: <CloseOutlined />,
            danger: true,
          }
        );
      }
      
      // 如果当前用户是申请人
      if (detail.isApplicant) {
        actions.push({
          key: 'withdraw',
          label: '撤回',
          icon: <DeleteOutlined />,
          danger: true,
        });
      }
    }

    return actions;
  };

  // 字段标签映射
  const fieldLabels = {
    id: '申请编号',
    applicantName: '申请人',
    department: '部门',
    position: '职位',
    leaveType: '请假类型',
    startDate: '开始日期',
    endDate: '结束日期',
    duration: '请假天数',
    reason: '请假原因',
    attachment: '附件',
    createdAt: '申请时间',
    status: '状态',
    currentApprover: '当前审批人',
  };

  // 字段类型映射
  const fieldTypes = {
    startDate: 'date',
    endDate: 'date',
    createdAt: 'datetime',
    status: 'tag',
    attachment: 'link',
  };

  // 字段选项
  const fieldOptions = {
    status: {
      colorMap: {
        pending: 'orange',
        processing: 'blue',
        approved: 'green',
        rejected: 'red',
        cancelled: 'default',
      }
    },
    attachment: {
      text: '查看附件'
    }
  };

  return (
    <>
      <Card 
        title={
          <Space>
            请假申请详情
            <StatusIndicator status={detail.status} showTooltip />
          </Space>
        }
        extra={
          <ActionToolbar
            allowedActions={getAvailableActions()}
            onActionClick={handleToolbarAction}
            record={detail}
            position="right"
          />
        }
      >
        <Row gutter={[0, 24]}>
          <Col span={24}>
            <DetailPanel
              data={detail}
              fieldLabels={fieldLabels}
              fieldTypes={fieldTypes}
              fieldOptions={fieldOptions}
              column={2}
            />
          </Col>
          
          <Col span={24}>
            <WorkflowHistory
              historyData={detail.approvalHistory || []}
              title="审批记录"
              showCard
            />
          </Col>
        </Row>
      </Card>

      {/* 评论模态框 */}
      <Modal
        title={actionType === 'approve' ? '审批通过' : '审批拒绝'}
        open={commentModalVisible}
        onOk={handleAction}
        onCancel={closeCommentModal}
        confirmLoading={actionLoading}
      >
        <div style={{ marginBottom: 16 }}>
          请输入{actionType === 'approve' ? '审批意见' : '拒绝理由'}：
        </div>
        <TextArea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={actionType === 'approve' ? '请输入审批意见' : '请输入拒绝理由'}
        />
      </Modal>
    </>
  );
};

export default LeaveRequestDetailPage;