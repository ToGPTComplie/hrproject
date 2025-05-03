# workflows/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# 创建一个 DRF 路由器
router = DefaultRouter()
# 注册视图集
router.register(r'definitions', views.WorkflowDefinitionViewSet, basename='workflowdefinition')
router.register(r'instances', views.WorkflowInstanceViewSet, basename='workflowinstance')
router.register(r'tasks', views.WorkflowTaskViewSet, basename='workflowtask')

# 应用的 URL 配置
urlpatterns = [
    # 包含路由器生成的 URL
    path('', include(router.urls)),
    # 设计器配置的单独 URL
    path('designer/config/', views.WorkflowDesignerConfigView.as_view(), name='workflow-designer-config'),
]