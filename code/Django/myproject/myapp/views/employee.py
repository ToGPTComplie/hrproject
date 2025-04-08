from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.core.paginator import Paginator
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.core.serializers.json import DjangoJSONEncoder
import json

from ..models import (
    EmployeeProfile, EmploymentHistory, Department, 
    EmployeeDepartment, Task, Attendance, Salary, TaskAssignment, Position
)

from ..decorators import custom_login_required

@custom_login_required
def employee_home(request):
    """员工首页"""
    return render(request,'myapp/employee.html')
@custom_login_required
def employee_detail(request, employee_id):
    """员工详情"""
    employee = get_object_or_404(EmployeeProfile, pk=employee_id)
    
    # 获取员工的部门和职位信息
    dept_positions = EmployeeDepartment.objects.filter(employee=employee)
    
    # 获取雇佣历史
    employment_history = EmploymentHistory.objects.filter(employee=employee).order_by('-hire_date')
    
    # 获取最近的考勤记录
    recent_attendance = Attendance.objects.filter(employee=employee).order_by('-date', '-time')[:10]
    
    # 获取最近的薪资记录
    recent_salary = Salary.objects.filter(employee=employee).order_by('-date')[:12]
    
    # 获取分配的任务
    assigned_tasks = Task.objects.filter(
        taskassignment__employee=employee,
        actual_end__isnull=True
    ).order_by('expected_end')
    
    # 判断请求类型，返回不同的响应
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.GET.get('format') == 'json':
        # 准备JSON数据
        employee_data = {
            'employee_id': employee.employee_id,
            'name': employee.name,
            'id_number': employee.id_number,
            'age': employee.age,
            'current_hire_date': employee.current_hire_date.strftime('%Y-%m-%d'),
            'is_employed': employee.is_employed,
        }
        
        # 部门职位信息
        dept_data = []
        for dp in dept_positions:
            dept_data.append({
                'department_id': dp.department.department_id,
                'department_name': dp.department.name,
                'position_id': dp.position.position_id,
                'position_title': dp.position.title,
            })
        
        # 雇佣历史
        history_data = []
        for history in employment_history:
            history_data.append({
                'record_id': history.record_id,
                'hire_date': history.hire_date.strftime('%Y-%m-%d'),
                'leave_date': history.leave_date.strftime('%Y-%m-%d') if history.leave_date else None,
                'leave_reason': history.leave_reason,
            })
        
        # 考勤记录
        attendance_data = []
        for att in recent_attendance:
            attendance_data.append({
                'date': att.date.strftime('%Y-%m-%d'),
                'type': att.type,
                'time': att.time.strftime('%H:%M:%S'),
            })
        
        # 薪资记录
        salary_data = []
        for sal in recent_salary:
            salary_data.append({
                'date': sal.date.strftime('%Y-%m'),
                'amount': float(sal.amount),
            })
        
        # 任务信息
        task_data = []
        for task in assigned_tasks:
            task_data.append({
                'task_id': task.task_id,
                'content': task.content,
                'completion': task.completion,
                'assign_time': task.assign_time.strftime('%Y-%m-%d %H:%M'),
                'expected_end': task.expected_end.strftime('%Y-%m-%d %H:%M'),
            })
        
        return JsonResponse({
            'employee': employee_data,
            'departments': dept_data,
            'employment_history': history_data,
            'attendance': attendance_data,
            'salary': salary_data,
            'tasks': task_data,
        })
    else:
        # 返回HTML页面
        context = {
            'employee': employee,
            'dept_positions': dept_positions,
            'employment_history': employment_history,
            'recent_attendance': recent_attendance,
            'recent_salary': recent_salary,
            'assigned_tasks': assigned_tasks,
        }
        return render(request, 'myapp/employee_detail.html', context)

@custom_login_required
@require_http_methods(["GET", "POST"])
def employee_add(request):
    """添加员工"""
    if request.method == 'POST':
        # 判断是否是JSON请求
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
                name = data.get('name')
                id_number = data.get('id_number', '')
                age = data.get('age')
                hire_date = data.get('hire_date')
                department_ids = data.get('department_ids', [])
                position_ids = data.get('position_ids', [])
            except json.JSONDecodeError:
                return JsonResponse({'error': '无效的JSON数据'}, status=400)
        else:
            # 处理表单提交
            name = request.POST.get('name')
            id_number = request.POST.get('id_number', '')
            age = request.POST.get('age')
            hire_date = request.POST.get('hire_date')
            department_ids = request.POST.getlist('department_ids', [])
            position_ids = request.POST.getlist('position_ids', [])
        
        # 创建员工档案
        try:
            employee = EmployeeProfile.objects.create(
                name=name,
                id_number=id_number,
                age=age,
                current_hire_date=hire_date,
                is_employed=True
            )
            
            # 创建雇佣历史记录
            EmploymentHistory.objects.create(
                employee=employee,
                hire_date=hire_date
            )
            
            # 处理部门和职位分配
            if department_ids and position_ids and len(department_ids) == len(position_ids):
                for i in range(len(department_ids)):
                    try:
                        department = Department.objects.get(department_id=department_ids[i])
                        position = Position.objects.get(position_id=position_ids[i])
                        
                        EmployeeDepartment.objects.create(
                            employee=employee,
                            department=department,
                            position=position
                        )
                    except (Department.DoesNotExist, Position.DoesNotExist):
                        pass
            
            if request.content_type == 'application/json' or request.GET.get('format') == 'json':
                return JsonResponse({
                    'success': True,
                    'message': f'员工 {name} 添加成功！',
                    'employee_id': employee.employee_id
                }, status=201)
            else:
                messages.success(request, f'员工 {name} 添加成功！')
                return redirect('employee_detail', employee_id=employee.employee_id)
        except Exception as e:
            if request.content_type == 'application/json' or request.GET.get('format') == 'json':
                return JsonResponse({
                    'success': False,
                    'error': f'添加员工失败：{str(e)}'
                }, status=400)
            else:
                messages.error(request, f'添加员工失败：{str(e)}')
    
    # 获取部门和职位信息用于表单选择
    departments = Department.objects.all()
    positions = Position.objects.all()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.GET.get('format') == 'json':
        # 返回JSON格式的部门和职位数据
        department_list = [{'id': dept.department_id, 'name': dept.name} for dept in departments]
        position_list = [{'id': pos.position_id, 'title': pos.title, 'department_id': pos.department.department_id} for pos in positions]
        
        return JsonResponse({
            'departments': department_list,
            'positions': position_list,
        })
    else:
        # 返回HTML页面
        context = {
            'departments': departments,
            'positions': positions,
        }
        return render(request, 'myapp/employee_add.html', context)

@custom_login_required
@require_http_methods(["GET", "POST", "PUT"])
def employee_edit(request, employee_id):
    """编辑员工信息"""
    employee = get_object_or_404(EmployeeProfile, pk=employee_id)
    
    if request.method in ['POST', 'PUT']:
        # 判断是否是JSON请求
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
                name = data.get('name', employee.name)
                id_number = data.get('id_number', employee.id_number)
                age = data.get('age', employee.age)
                is_employed = data.get('is_employed', employee.is_employed)
                leave_date = data.get('leave_date')
                leave_reason = data.get('leave_reason', '')
                department_ids = data.get('department_ids', [])
                position_ids = data.get('position_ids', [])
            except json.JSONDecodeError:
                return JsonResponse({'error': '无效的JSON数据'}, status=400)
        else:
            # 处理表单提交
            name = request.POST.get('name', employee.name)
            id_number = request.POST.get('id_number', employee.id_number)
            age = request.POST.get('age', employee.age)
            is_employed = request.POST.get('is_employed') == 'true'
            leave_date = request.POST.get('leave_date')
            leave_reason = request.POST.get('leave_reason', '')
            department_ids = request.POST.getlist('department_ids', [])
            position_ids = request.POST.getlist('position_ids', [])
        
        # 更新员工基本信息
        employee.name = name
        employee.id_number = id_number
        employee.age = age
        
        # 处理雇佣状态变更
        if employee.is_employed != is_employed:
            employee.is_employed = is_employed
            
            # 如果是离职，创建离职记录
            if not is_employed and leave_date:
                # 查找最近的雇佣记录并更新
                try:
                    latest_history = EmploymentHistory.objects.filter(
                        employee=employee,
                        leave_date__isnull=True
                    ).latest('hire_date')
                    
                    if latest_history:
                        latest_history.leave_date = leave_date
                        latest_history.leave_reason = leave_reason
                        latest_history.save()
                except EmploymentHistory.DoesNotExist:
                    pass
        
        try:
            employee.save()
            
            # 处理部门和职位更新
            if department_ids and position_ids and len(department_ids) == len(position_ids):
                # 先删除现有关联
                EmployeeDepartment.objects.filter(employee=employee).delete()
                
                # 创建新关联
                for i in range(len(department_ids)):
                    try:
                        department = Department.objects.get(department_id=department_ids[i])
                        position = Position.objects.get(position_id=position_ids[i])
                        
                        EmployeeDepartment.objects.create(
                            employee=employee,
                            department=department,
                            position=position
                        )
                    except (Department.DoesNotExist, Position.DoesNotExist):
                        pass
            
            if request.content_type == 'application/json' or request.GET.get('format') == 'json':
                return JsonResponse({
                    'success': True,
                    'message': f'员工 {employee.name} 信息更新成功！'
                })
            else:
                messages.success(request, f'员工 {employee.name} 信息更新成功！')
                return redirect('employee_detail', employee_id=employee.employee_id)
        except Exception as e:
            if request.content_type == 'application/json' or request.GET.get('format') == 'json':
                return JsonResponse({
                    'success': False,
                    'error': f'更新员工信息失败：{str(e)}'
                }, status=400)
            else:
                messages.error(request, f'更新员工信息失败：{str(e)}')
    
    # 获取部门和职位信息用于表单选择
    departments = Department.objects.all()
    positions = Position.objects.all()
    dept_positions = EmployeeDepartment.objects.filter(employee=employee)
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest' or request.GET.get('format') == 'json':
        # 准备JSON数据
        employee_data = {
            'employee_id': employee.employee_id,
            'name': employee.name,
            'id_number': employee.id_number,
            'age': employee.age,
            'current_hire_date': employee.current_hire_date.strftime('%Y-%m-%d'),
            'is_employed': employee.is_employed,
        }
        
        # 部门职位信息
        dept_data = []
        for dp in dept_positions:
            dept_data.append({
                'department_id': dp.department.department_id,
                'department_name': dp.department.name,
                'position_id': dp.position.position_id,
                'position_title': dp.position.title,
            })
        
        # 部门和职位列表
        department_list = [{'id': dept.department_id, 'name': dept.name} for dept in departments]
        position_list = [{'id': pos.position_id, 'title': pos.title, 'department_id': pos.department.department_id} for pos in positions]
        
        return JsonResponse({
            'employee': employee_data,
            'current_departments': dept_data,
            'departments': department_list,
            'positions': position_list,
        })
    else:
        # 返回HTML页面
        context = {
            'employee': employee,
            'departments': departments,
            'positions': positions,
            'dept_positions': dept_positions,
        }
        return render(request, 'myapp/employee_edit.html', context)

# 新增删除员工API
@custom_login_required
@require_http_methods(["DELETE"])
def employee_delete(request, employee_id):
    """删除员工"""
    employee = get_object_or_404(EmployeeProfile, pk=employee_id)
    
    try:
        employee_name = employee.name
        employee.delete()
        
        return JsonResponse({
            'success': True,
            'message': f'员工 {employee_name} 已成功删除'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'删除员工失败：{str(e)}'
        }, status=400)