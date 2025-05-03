import axios from 'axios';
import mockService from '../mock/mockService';

// 判断是否使用模拟数据
// 修复 process is not defined 错误
const USE_MOCK = true; // 默认不使用模拟数据，您可以根据需要修改这个值

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器 - 添加token等认证信息
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误
axiosInstance.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    let errorMsg = '未知错误';
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      
      if (status === 401) {
        // 未授权，可能需要重新登录
        errorMsg = '登录已过期，请重新登录';
        // 可以在这里处理登出逻辑
      } else if (status === 403) {
        errorMsg = '没有权限执行此操作';
      } else if (status === 404) {
        errorMsg = '请求的资源不存在';
      } else if (status === 500) {
        errorMsg = '服务器内部错误';
      } else {
        errorMsg = data.message || `请求失败(${status})`;
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMsg = '服务器无响应，请检查网络连接';
    } else {
      // 请求配置出错
      errorMsg = error.message;
    }
    
    return Promise.reject(new Error(errorMsg));
  }
);

// 根据环境选择使用真实API还是模拟服务
const api = USE_MOCK ? mockService : axiosInstance;

/**
 * 获取请假表单配置
 * @returns {Promise} 表单配置对象
 */
export const fetchFormConfig = async () => {
  if (USE_MOCK) {
    return api.fetchFormConfig();
  }
  return api.get('/config/forms/leave-request');
};

/**
 * 提交请假申请
 * @param {Object} data 请假申请数据
 * @returns {Promise} 提交结果
 */
export const submitLeaveRequest = async (data) => {
  if (USE_MOCK) {
    return api.submitLeaveRequest(data);
  }
  return api.post('/leave-requests', data);
};

/**
 * 获取我的请假申请列表
 * @param {Object} params 查询参数
 * @returns {Promise} 请假申请列表
 */
export const fetchMyLeaveRequests = async (params) => {
  if (USE_MOCK) {
    return api.fetchMyLeaveRequests(params);
  }
  return api.get('/leave-requests', { params });
};

/**
 * 获取待审批的请假申请列表
 * @param {Object} params 查询参数
 * @returns {Promise} 待审批请假申请列表
 */
export const fetchPendingApprovals = async (params) => {
  if (USE_MOCK) {
    return api.fetchPendingApprovals(params);
  }
  return api.get('/leave-requests/pending', { params });
};

/**
 * 获取请假申请详情
 * @param {String} id 请假申请ID
 * @returns {Promise} 请假申请详情
 */
export const fetchLeaveRequestDetail = async (id) => {
  if (USE_MOCK) {
    return api.fetchLeaveRequestDetail(id);
  }
  return api.get(`/leave-requests/${id}`);
};

/**
 * 审批通过请假申请
 * @param {String} id 请假申请ID
 * @param {Object} data 审批数据
 * @returns {Promise} 审批结果
 */
export const approveLeaveRequest = async (id, data) => {
  if (USE_MOCK) {
    return api.approveLeaveRequest(id, data);
  }
  return api.patch(`/leave-requests/${id}/approve`, data);
};

/**
 * 审批拒绝请假申请
 * @param {String} id 请假申请ID
 * @param {Object} data 审批数据
 * @returns {Promise} 审批结果
 */
export const rejectLeaveRequest = async (id, data) => {
  if (USE_MOCK) {
    return api.rejectLeaveRequest(id, data);
  }
  return api.patch(`/leave-requests/${id}/reject`, data);
};

/**
 * 撤回请假申请
 * @param {String} id 请假申请ID
 * @returns {Promise} 撤回结果
 */
export const withdrawLeaveRequest = async (id) => {
  if (USE_MOCK) {
    return api.withdrawLeaveRequest(id);
  }
  return api.delete(`/leave-requests/${id}`);
};

/**
 * 获取请假类型列表
 * @returns {Promise} 请假类型列表
 */
export const fetchLeaveTypes = async () => {
  if (USE_MOCK) {
    return api.fetchLeaveTypes ? api.fetchLeaveTypes() : [];
  }
  return api.get('/meta/leave-types');
};

/**
 * 获取审批流程配置
 * @returns {Promise} 审批流程配置
 */
export const fetchWorkflowConfig = async () => {
  if (USE_MOCK) {
    return api.fetchWorkflowConfig ? api.fetchWorkflowConfig() : {};
  }
  return api.get('/config/workflows/leave-approval');
};

export default api;