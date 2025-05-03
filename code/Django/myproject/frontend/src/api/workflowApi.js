import axios from 'axios';

// 创建axios实例，设置基础URL和默认请求头
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 工作流定义相关API
const workflowDefinitionApi = {
  // 获取所有工作流定义
  getDefinitions: () => {
    return api.get('/workflows/definitions');
  },

  // 获取单个工作流定义
  getDefinition: (definitionId) => {
    return api.get(`/workflows/definitions/${definitionId}`);
  },

  // 创建工作流定义
  createDefinition: (definitionData) => {
    return api.post('/workflows/definitions/', definitionData);
  },

  // 更新工作流定义
  updateDefinition: (definitionId, definitionData) => {
    return api.put(`/workflows/definitions/${definitionId}`, definitionData);
  },

  // 部分更新工作流定义（如激活/禁用）
  patchDefinition: (definitionId, patchData) => {
    return api.patch(`/workflows/definitions/${definitionId}`, patchData);
  },

  // 删除工作流定义
  deleteDefinition: (definitionId) => {
    return api.delete(`/workflows/definitions/${definitionId}`);
  },

  // 复制工作流定义
  duplicateDefinition: (definitionId) => {
    return api.post(`/workflows/definitions/${definitionId}/duplicate`);
  },

  // 获取设计器配置
  getDesignerConfig: () => {
    return api.get('/workflows/designer/config');
  }
};

// 工作流实例相关API
const workflowInstanceApi = {
  // 获取所有工作流实例
  getInstances: (params) => {
    return api.get('/workflows/instances', { params });
  },

  // 获取单个工作流实例
  getInstance: (instanceId) => {
    return api.get(`/workflows/instances/${instanceId}`);
  },

  // 启动新的工作流实例
  startWorkflow: (startData) => {
    return api.post('/workflows/instances/start', startData);
  },

  // 取消工作流实例
  cancelInstance: (instanceId, reason) => {
    return api.post(`/workflows/instances/${instanceId}/cancel`, { reason });
  },

  // 获取实例的历史记录
  getInstanceHistory: (instanceId) => {
    return api.get(`/workflows/instances/${instanceId}/history`);
  },

  // 获取实例的当前任务
  getInstanceTasks: (instanceId) => {
    return api.get(`/workflows/instances/${instanceId}/tasks`);
  },

  // 获取实例的流程图
  getInstanceDiagram: (instanceId) => {
    return api.get(`/workflows/instances/${instanceId}/diagram`);
  }
};

// 工作流任务相关API
const workflowTaskApi = {
  // 获取所有任务
  getTasks: (params) => {
    return api.get('/workflows/tasks', { params });
  },

  // 获取单个任务
  getTask: (taskId) => {
    return api.get(`/workflows/tasks/${taskId}`);
  },

  // 完成任务
  completeTask: (taskId, completeData) => {
    return api.post(`/workflows/tasks/${taskId}/complete`, completeData);
  },

  // 分配任务
  assignTask: (taskId, assignData) => {
    return api.post(`/workflows/tasks/${taskId}/assign`, assignData);
  },

  // 获取我的待办任务
  getMyTasks: (status = 'pending') => {
    return api.get('/workflows/tasks/my', { params: { status } });
  },

  // 获取我可以处理的任务
  getAvailableTasks: () => {
    return api.get('/workflows/tasks/available');
  },

  // 认领任务
  claimTask: (taskId) => {
    return api.post(`/workflows/tasks/${taskId}/claim`);
  },

  // 释放任务
  releaseTask: (taskId) => {
    return api.post(`/workflows/tasks/${taskId}/release`);
  }
};

// 工作流历史相关API
const workflowHistoryApi = {
  // 获取历史记录
  getHistory: (params) => {
    return api.get('/workflows/history', { params });
  },

  // 获取单个历史记录详情
  getHistoryDetail: (historyId) => {
    return api.get(`/workflows/history/${historyId}`);
  },

  // 获取用户的操作历史
  getUserHistory: (userId) => {
    return api.get(`/workflows/history/user/${userId}`);
  }
};

// 导出所有API
const workflowApi = {
  definitions: workflowDefinitionApi,
  instances: workflowInstanceApi,
  tasks: workflowTaskApi,
  history: workflowHistoryApi
};

export default workflowApi;