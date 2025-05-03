import { message } from 'antd';
import moment from 'moment';

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟数据
const mockData = {
  // 请假表单配置
  leaveFormConfig: {
    layout: 'horizontal',
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
    fields: [
      {
        type: 'select',
        name: 'leaveType',
        label: '请假类型',
        placeholder: '请选择请假类型',
        options: [
          { value: '年假', label: '年假' },
          { value: '事假', label: '事假' },
          { value: '病假', label: '病假' },
          { value: '婚假', label: '婚假' },
          { value: '产假', label: '产假' },
          { value: '丧假', label: '丧假' },
        ],
        rules: [{ required: true, message: '请选择请假类型' }],
      },
      {
        type: 'dateRange',
        name: 'dateRange',
        label: '请假时间',
        placeholder: ['开始日期', '结束日期'],
        rules: [{ required: true, message: '请选择请假时间' }],
      },
      {
        type: 'number',
        name: 'duration',
        label: '请假天数',
        placeholder: '请输入请假天数',
        min: 0.5,
        step: 0.5,
        rules: [{ required: true, message: '请输入请假天数' }],
      },
      {
        type: 'textarea',
        name: 'reason',
        label: '请假原因',
        placeholder: '请输入请假原因',
        rows: 4,
        rules: [{ required: true, message: '请输入请假原因' }],
      },
      {
        type: 'input',
        name: 'contactInfo',
        label: '紧急联系方式',
        placeholder: '请输入紧急联系方式',
      },
    ],
  },
  
  // 请假记录
  leaveRequests: [
    {
      id: '1001',
      applicantName: '张三',
      department: '研发部',
      position: '前端开发工程师',
      leaveType: '年假',
      startDate: '2023-05-01',
      endDate: '2023-05-03',
      duration: 3,
      reason: '休息一下',
      contactInfo: '13800138000',
      createdAt: '2023-04-25 10:30:00',
      status: 'approved',
      currentApprover: null,
      isApplicant: true,
      approvalHistory: [
        {
          action: 'submit',
          user: { name: '张三', avatar: null },
          timestamp: '2023-04-25 10:30:00',
          comment: '请审批',
        },
        {
          action: 'approve',
          user: { name: '李四', avatar: null },
          timestamp: '2023-04-26 14:20:00',
          comment: '同意',
          status: '部门经理审批'
        },
        {
          action: 'approve',
          user: { name: '王五', avatar: null },
          timestamp: '2023-04-27 09:15:00',
          comment: '批准',
          status: '人事审批'
        },
      ],
    },
    {
      id: '1002',
      applicantName: '张三',
      department: '研发部',
      position: '前端开发工程师',
      leaveType: '病假',
      startDate: '2023-06-10',
      endDate: '2023-06-12',
      duration: 3,
      reason: '感冒发烧',
      contactInfo: '13800138000',
      createdAt: '2023-06-08 09:15:00',
      status: 'rejected',
      currentApprover: null,
      isApplicant: true,
      approvalHistory: [
        {
          action: 'submit',
          user: { name: '张三', avatar: null },
          timestamp: '2023-06-08 09:15:00',
          comment: '请审批',
        },
        {
          action: 'reject',
          user: { name: '李四', avatar: null },
          timestamp: '2023-06-08 14:30:00',
          comment: '近期项目紧张，请调整请假时间',
          status: '部门经理审批'
        },
      ],
    },
    {
      id: '1003',
      applicantName: '张三',
      department: '研发部',
      position: '前端开发工程师',
      leaveType: '事假',
      startDate: '2023-07-20',
      endDate: '2023-07-20',
      duration: 1,
      reason: '办理个人事务',
      contactInfo: '13800138000',
      createdAt: '2023-07-18 11:20:00',
      status: 'pending',
      currentApprover: '李四',
      isApplicant: true,
      approvalHistory: [
        {
          action: 'submit',
          user: { name: '张三', avatar: null },
          timestamp: '2023-07-18 11:20:00',
          comment: '请审批',
        },
      ],
    },
  ],
  
  // 待审批请假记录
  pendingApprovals: [
    {
      id: '2001',
      applicantName: '李明',
      department: '市场部',
      position: '市场专员',
      leaveType: '年假',
      startDate: '2023-08-15',
      endDate: '2023-08-18',
      duration: 4,
      reason: '休息一下',
      contactInfo: '13900139000',
      createdAt: '2023-08-10 14:30:00',
      status: 'pending',
      currentApprover: '张三',
      isApplicant: false,
      approvalHistory: [
        {
          action: 'submit',
          user: { name: '李明', avatar: null },
          timestamp: '2023-08-10 14:30:00',
          comment: '请审批',
        },
      ],
    },
    {
      id: '2002',
      applicantName: '王芳',
      department: '财务部',
      position: '会计',
      leaveType: '事假',
      startDate: '2023-08-20',
      endDate: '2023-08-20',
      duration: 1,
      reason: '办理个人事务',
      contactInfo: '13700137000',
      createdAt: '2023-08-18 09:45:00',
      status: 'pending',
      currentApprover: '张三',
      isApplicant: false,
      approvalHistory: [
        {
          action: 'submit',
          user: { name: '王芳', avatar: null },
          timestamp: '2023-08-18 09:45:00',
          comment: '请审批',
        },
      ],
    },
  ],
};

// 模拟API服务
const mockService = {
  // 获取请假表单配置
  fetchFormConfig: async () => {
    await delay(800);
    return mockData.leaveFormConfig;
  },
  
  // 提交请假申请
  submitLeaveRequest: async (data) => {
    await delay(1000);
    
    // 创建新的请假记录
    const newRequest = {
      id: `${1000 + mockData.leaveRequests.length + 1}`,
      applicantName: '张三',
      department: '研发部',
      position: '前端开发工程师',
      leaveType: data.leaveType,
      startDate: data.dateRange[0],
      endDate: data.dateRange[1],
      duration: data.duration,
      reason: data.reason,
      contactInfo: data.contactInfo,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      status: 'pending',
      currentApprover: '李四',
      isApplicant: true,
      approvalHistory: [
        {
          action: 'submit',
          user: { name: '张三', avatar: null },
          timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
          comment: '请审批',
        },
      ],
    };
    
    // 添加到模拟数据中
    mockData.leaveRequests.push(newRequest);
    
    return { success: true, message: '提交成功', data: newRequest };
  },
  
  // 获取我的请假申请列表
  fetchMyLeaveRequests: async (params) => {
    await delay(800);
    
    const { page = 1, pageSize = 10 } = params;
    const total = mockData.leaveRequests.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = mockData.leaveRequests.slice(start, end);
    
    return {
      data,
      total,
      current_page: page,
      page_size: pageSize,
    };
  },
  
  // 获取待审批的请假申请列表
  fetchPendingApprovals: async (params) => {
    await delay(800);
    
    const { page = 1, pageSize = 10 } = params;
    const total = mockData.pendingApprovals.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = mockData.pendingApprovals.slice(start, end);
    
    return {
      data,
      total,
      current_page: page,
      page_size: pageSize,
    };
  },
  
  // 获取请假申请详情
  fetchLeaveRequestDetail: async (id) => {
    await delay(800);
    
    // 查找我的请假申请
    let request = mockData.leaveRequests.find(item => item.id === id);
    
    // 如果没找到，查找待审批的请假申请
    if (!request) {
      request = mockData.pendingApprovals.find(item => item.id === id);
    }
    
    if (!request) {
      throw new Error('请假申请不存在');
    }
    
    return request;
  },
  
  // 审批通过请假申请
  approveLeaveRequest: async (id, data) => {
    await delay(1000);
    
    // 查找待审批的请假申请
    const index = mockData.pendingApprovals.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error('请假申请不存在或无权审批');
    }
    
    // 更新审批状态
    mockData.pendingApprovals[index].status = 'approved';
    mockData.pendingApprovals[index].currentApprover = null;
    
    // 添加审批记录
    mockData.pendingApprovals[index].approvalHistory.push({
      action: 'approve',
      user: { name: '张三', avatar: null },
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      comment: data.comment || '同意',
      status: '审批通过'
    });
    
    return { success: true, message: '审批成功' };
  },
  
  // 审批拒绝请假申请
  rejectLeaveRequest: async (id, data) => {
    await delay(1000);
    
    // 查找待审批的请假申请
    const index = mockData.pendingApprovals.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error('请假申请不存在或无权审批');
    }
    
    // 更新审批状态
    mockData.pendingApprovals[index].status = 'rejected';
    mockData.pendingApprovals[index].currentApprover = null;
    
    // 添加审批记录
    mockData.pendingApprovals[index].approvalHistory.push({
      action: 'reject',
      user: { name: '张三', avatar: null },
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      comment: data.comment || '不同意',
      status: '审批拒绝'
    });
    
    return { success: true, message: '审批成功' };
  },
  
  // 撤回请假申请
  withdrawLeaveRequest: async (id) => {
    await delay(1000);
    
    // 查找我的请假申请
    const index = mockData.leaveRequests.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error('请假申请不存在或无权撤回');
    }
    
    // 检查状态是否允许撤回
    if (!['pending', 'processing'].includes(mockData.leaveRequests[index].status)) {
      throw new Error('当前状态不允许撤回申请');
    }
    
    // 更新状态
    mockData.leaveRequests[index].status = 'cancelled';
    mockData.leaveRequests[index].currentApprover = null;
    
    // 添加撤回记录
    mockData.leaveRequests[index].approvalHistory.push({
      action: 'withdraw',
      user: { name: '张三', avatar: null },
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      comment: '申请已撤回',
    });
    
    return { success: true, message: '撤回成功' };
  },
};

export default mockService;