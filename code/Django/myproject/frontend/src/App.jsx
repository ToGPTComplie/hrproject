import React from 'react';
import { Layout } from 'antd';
import { Routes, Route } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import AppSider from './components/AppSider';
import TaskDesigner from './pages/TaskDesigner';
import TaskList from './pages/TaskList';
import TaskDistribution from './pages/TaskDistribution';
import './App.css';

const { Content } = Layout;

const App = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        <AppSider />
        <Layout style={{ padding: '24px' }}>
          <Content>
            <Routes>
              <Route path="/" element={<TaskList />} />
              <Route path="/designer" element={<TaskDesigner />} />
              <Route path="/distribution" element={<TaskDistribution />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;