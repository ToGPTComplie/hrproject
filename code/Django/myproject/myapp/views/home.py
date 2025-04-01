from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count

from ..models import (
    EmployeeProfile, Department, Task, Message, 
    Attendance, Salary, EmployeeDepartment
)


@login_required
def home(request):
    """系统首页"""
    # 获取系统概览数据
    employee_count = EmployeeProfile.objects.filter(is_employed=True).count()
    department_count = Department.objects.count()
    task_count = Task.objects.filter(actual_end__isnull=True).count()
    
    # 获取最近的消息
    recent_messages = Message.objects.all().order_by('-timestamp')[:5]
    
    # 获取未读消息数量
    unread_message_count = Message.objects.filter(
        employee_id=request.session.get('user_id', 0),
        is_read=False
    ).count()
    
    # 获取员工数据统计（按月统计员工数量变化）
    today = timezone.now().date()
    months = []
    employee_counts = []
    
    for i in range(6):
        # 计算6个月前到当前月的数据
        month_date = (today.replace(day=1) - timedelta(days=30*i))
        month_name = f"{month_date.month}月"
        months.append(month_name)
        
        # 获取当月在职员工数量
        count = EmployeeProfile.objects.filter(
            is_employed=True,
            current_hire_date__lte=month_date
        ).count()
        employee_counts.append(count)
    
    # 反转列表以按时间顺序显示
    months.reverse()
    employee_counts.reverse()
    
    # 获取考勤数据分析（最近30天的考勤统计）
    month_ago = today - timedelta(days=30)
    
    # 正常出勤：有上班打卡和下班打卡的记录
    normal_attendance = Attendance.objects.filter(
        date__gte=month_ago,
        date__lte=today,
        type='in'
    ).values('employee_id', 'date').distinct().count()
    
    # 迟到：上班打卡时间晚于9:00的记录
    late_attendance = Attendance.objects.filter(
        date__gte=month_ago,
        date__lte=today,
        type='in',
        time__hour__gte=9,
        time__minute__gt=0
    ).count()
    
    # 早退：下班打卡时间早于18:00的记录
    early_leave = Attendance.objects.filter(
        date__gte=month_ago,
        date__lte=today,
        type='out',
        time__hour__lt=18
    ).count()
    
    # 缺勤：工作日没有打卡记录的员工数
    # 简化计算，假设工作日为30天
    total_workdays = 30 * EmployeeProfile.objects.filter(is_employed=True).count()
    absent = total_workdays - normal_attendance
    
    # 获取当前登录用户信息
    user_name = request.session.get('user_name', '管理员')
    
    context = {
        'employee_count': employee_count,
        'department_count': department_count,
        'task_count': task_count,
        'recent_messages': recent_messages,
        'unread_message_count': unread_message_count,
        'user_name': user_name,
        
        # 图表数据
        'months': months,
        'employee_counts': employee_counts,
        'attendance_data': [
            {'value': normal_attendance, 'name': '正常'},
            {'value': late_attendance, 'name': '迟到'},
            {'value': early_leave, 'name': '早退'},
            {'value': absent, 'name': '缺勤'}
        ]
    }
    return render(request, 'myapp/home.html', context)

