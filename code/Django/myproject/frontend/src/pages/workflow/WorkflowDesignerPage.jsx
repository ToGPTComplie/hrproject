import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Button, 
  Space, 
  Input, 
  Form, 
  message, 
  Spin, 
  Card, 
  Divider,
  Modal
} from 'antd';
import { 
  SaveOutlined, 
  ArrowLeftOutlined, 
  PlayCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNodesState, useEdgesState } from 'reactflow';
import NodePalette from '../../components/workflow/NodePalette';
import WorkflowCanvas from '../../components/workflow/WorkflowCanvas';
import PropertiesPanel from '../../components/workflow/PropertiesPanel';
import workflowApi from '../../api/workflowApi';

const { Header, Sider, Content } = Layout;
const { confirm } = Modal;

const WorkflowDesignerPage = () => {
  const { definitionId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // 状态
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [workflowMeta, setWorkflowMeta] = useState({
    name: '',
    description: '',
    version: 1,
    is_active: true
  });
  const [nodeTypes, setNodeTypes] = useState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [elementConfigSchema, setElementConfigSchema] = useState(null);
  
  // 获取设计器配置
  const fetchDesignerConfig = useCallback(async () => {
    try {
      const response = await workflowApi.definitions.getDesignerConfig();
      setNodeTypes(response.data.nodeTypes);
    } catch (error) {
      message.error('获取设计器配置失败');
      console.error('获取设计器配置失败:', error);
    }
  }, []);
  
  // 获取工作流定义
  const fetchWorkflowDefinition = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await workflowApi.definitions.getDefinition(id);
      const { name, description, version, is_active, definition_json } = response.data;
      
      setWorkflowMeta({
        name,
        description,
        version,
        is_active
      });
      
      form.setFieldsValue({
        name,
        description
      });
      
      // 解析定义JSON并设置节点和边
      if (definition_json) {
        setNodes(definition_json.nodes || []);
        setEdges(definition_json.edges || []);
      }
    } catch (error) {
      message.error('获取工作流定义失败');
      console.error('获取工作流定义失败:', error);
    } finally {
      setLoading(false);
    }
  }, [form, setNodes, setEdges]);
  
  // 初始化
  useEffect(() => {
    fetchDesignerConfig();
    
    if (definitionId) {
      fetchWorkflowDefinition(definitionId);
    }
  }, [definitionId, fetchDesignerConfig, fetchWorkflowDefinition]);
  
  // 处理节点添加
  const handleAddNode = useCallback((nodeType, position) => {
    // 查找节点类型的默认配置
    const typeConfig = nodeTypes.find(type => type.type === nodeType);
    if (!typeConfig) return;
    
    const newNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: typeConfig.label,
        ...typeConfig.defaultConfig
      }
    };
    
    setNodes(nds => [...nds, newNode]);
  }, [nodeTypes, setNodes]);
  
  // 处理连接创建
  const handleConnect = useCallback((params) => {
    setEdges(eds => [...eds, {
      id: `edge_${Date.now()}`,
      source: params.source,
      target: params.target,
      type: 'default',
      data: { label: '' }
    }]);
  }, [setEdges]);
  
  // 处理选择变更
  const handleSelectionChange = useCallback(({ nodes, edges }) => {
    if (nodes.length === 1) {
      setSelectedElement({ ...nodes[0], elementType: 'node' });
      
      // 获取节点类型的配置schema
      const nodeType = nodes[0].type;
      const typeConfig = nodeTypes.find(type => type.type === nodeType);
      setElementConfigSchema(typeConfig?.configSchema || null);
    } else if (edges.length === 1) {
      setSelectedElement({ ...edges[0], elementType: 'edge' });
      setElementConfigSchema({ 
        type: 'object',
        properties: {
          label: { type: 'string', title: '标签' },
          condition: { type: 'string', title: '条件表达式' }
        }
      });
    } else {
      setSelectedElement(null);
      setElementConfigSchema(null);
    }
  }, [nodeTypes]);
  
  // 处理元素更新
  const handleElementUpdate = useCallback((updatedData) => {
    if (!selectedElement) return;
    
    if (selectedElement.elementType === 'node') {
      setNodes(nds => 
        nds.map(node => 
          node.id === selectedElement.id 
            ? { ...node, data: { ...node.data, ...updatedData } }
            : node
        )
      );
    } else if (selectedElement.elementType === 'edge') {
      setEdges(eds => 
        eds.map(edge => 
          edge.id === selectedElement.id 
            ? { ...edge, data: { ...edge.data, ...updatedData } }
            : edge
        )
      );
    }
  }, [selectedElement, setNodes, setEdges]);
  
  // 保存工作流定义
  const handleSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      setSaving(true);
      
      const definitionData = {
        name: values.name,
        description: values.description,
        definition_json: {
          nodes,
          edges
        },
        is_active: workflowMeta.is_active
      };
      
      let response;
      if (definitionId) {
        // 更新现有定义
        response = await workflowApi.definitions.updateDefinition(definitionId, definitionData);
      } else {
        // 创建新定义
        response = await workflowApi.definitions.createDefinition(definitionData);
      }
      
      message.success('工作流定义保存成功');
      
      // 如果是新建，保存后跳转到编辑页面
      if (!definitionId && response.data.id) {
        navigate(`/workflow/designer/${response.data.id}`);
      }
    } catch (error) {
      if (error.errorFields) {
        message.error('请完善表单信息');
      } else {
        message.error('保存工作流定义失败');
        console.error('保存工作流定义失败:', error);
      }
    } finally {
      setSaving(false);
    }
  };
  
  // 返回列表
  const handleBack = () => {
    confirm({
      title: '确定要离开吗？',
      icon: <ExclamationCircleOutlined />,
      content: '未保存的更改将会丢失',
      onOk() {
        navigate('/workflow/definitions');
      }
    });
  };
  
  return (
    <Layout style={{ height: 'calc(100vh - 64px)' }}>
      <Header style={{ background: '#fff', padding: '0 16px', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回
            </Button>
            <Divider type="vertical" />
            <Form
              form={form}
              layout="inline"
              initialValues={{ name: workflowMeta.name, description: workflowMeta.description }}
            >
              <Form.Item
                name="name"
                rules={[{ required: true, message: '请输入工作流名称' }]}
              >
                <Input placeholder="工作流名称" style={{ width: 200 }} />
              </Form.Item>
              <Form.Item name="description">
                <Input placeholder="工作流描述" style={{ width: 300 }} />
              </Form.Item>
            </Form>
          </Space>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
            >
              保存
            </Button>
          </Space>
        </div>
      </Header>
      <Layout>
        <Sider width={250} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
          <NodePalette nodeTypes={nodeTypes} />
        </Sider>
        <Content style={{ position: 'relative' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Spin size="large" tip="加载中..." />
            </div>
          ) : (
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              onSelectionChange={handleSelectionChange}
              onAddNode={handleAddNode}
              nodeTypes={nodeTypes}
            />
          )}
        </Content>
        <Sider width={300} theme="light" style={{ borderLeft: '1px solid #f0f0f0' }}>
          <PropertiesPanel
            selectedElement={selectedElement}
            elementConfigSchema={elementConfigSchema}
            onElementUpdate={handleElementUpdate}
          />
        </Sider>
      </Layout>
    </Layout>
  );
};

export default WorkflowDesignerPage;