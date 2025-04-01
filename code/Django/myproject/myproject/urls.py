"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# 导入 myapp 的视图
from myapp import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 首页
    path('', views.user_login, name='user_login'),
    
    # 用户认证相关
    path('index/', views.user_login, name='index'),
    path('logout/', views.user_logout, name='logout'),
    
    # 员工管理相关
    path('employees/', views.employee_list, name='employee_list'),
    path('employees/<int:employee_id>/', views.employee_detail, name='employee_detail'),
    path('employees/add/', views.employee_add, name='employee_add'),
    path('employees/<int:employee_id>/edit/', views.employee_edit, name='employee_edit'),
    
    # 考勤管理相关
    path('attendance/', views.attendance_record, name='attendance_record'),
    path('attendance/stats/', views.attendance_stats, name='attendance_stats'),
    
    # 薪资管理相关
    path('salary/', views.salary_list, name='salary_list'),
    path('salary/<int:employee_id>/', views.salary_detail, name='salary_detail'),
    path('salary/add/', views.salary_add, name='salary_add'),
    
    # 部门管理相关
    path('departments/', views.department_list, name='department_list'),
    path('departments/<int:department_id>/', views.department_detail, name='department_detail'),
    
    # 任务管理相关
    path('tasks/', views.task_list, name='task_list'),
    path('tasks/<int:task_id>/', views.task_detail, name='task_detail'),
    path('tasks/add/', views.task_add, name='task_add'),
    path('tasks/<int:task_id>/update/', views.task_update, name='task_update'),
    
    # 消息通知相关
    path('messages/', views.message_list, name='message_list'),
    path('messages/<int:message_id>/', views.message_detail, name='message_detail'),
    
    # 招聘管理相关
    path('jobs/apply/', views.job_application_form, name='job_application_form'),
    path('jobs/apply/success/', views.job_application_success, name='job_application_success'),
    path('jobs/applications/', views.job_application_list, name='job_application_list'),
    
    # API 接口
    path('api/positions/', views.get_positions, name='get_positions'),
]

# 添加静态文件和媒体文件的 URL 配置（仅在开发环境中有效）
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
