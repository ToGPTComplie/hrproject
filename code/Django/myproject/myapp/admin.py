from django.contrib import admin
from .models import (
    EmployeeProfile, EmploymentHistory, UserAccount, Attendance, 
    Salary, Message, Department, Position, EmployeeDepartment, 
    Approval, JobApplication, Task, TaskAssignment
)

# 注册所有模型到管理后台
@admin.register(EmployeeProfile)
class EmployeeProfileAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'name', 'id_number', 'age', 'current_hire_date', 'is_employed')
    search_fields = ('name', 'id_number')
    list_filter = ('is_employed', 'age')

@admin.register(EmploymentHistory)
class EmploymentHistoryAdmin(admin.ModelAdmin):
    list_display = ('record_id', 'employee', 'hire_date', 'leave_date', 'leave_reason')
    search_fields = ('employee__name',)
    list_filter = ('hire_date', 'leave_date')

@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):
    list_display = ('employee', 'account')
    search_fields = ('account', 'employee__name')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'type', 'time')
    list_filter = ('date', 'type')
    search_fields = ('employee__name',)

@admin.register(Salary)
class SalaryAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'amount')
    list_filter = ('date',)
    search_fields = ('employee__name',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('message_id', 'employee', 'timestamp', 'is_read', 'msg_type')
    list_filter = ('is_read', 'msg_type', 'timestamp')
    search_fields = ('employee__name',)

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('department_id', 'name')
    search_fields = ('name',)

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ('position_id', 'department', 'title')
    list_filter = ('department',)
    search_fields = ('title',)

@admin.register(EmployeeDepartment)
class EmployeeDepartmentAdmin(admin.ModelAdmin):
    list_display = ('employee', 'department', 'position')
    list_filter = ('department', 'position')
    search_fields = ('employee__name',)

@admin.register(Approval)
class ApprovalAdmin(admin.ModelAdmin):
    list_display = ('approval_id', 'employee', 'approval_type')
    list_filter = ('approval_type',)
    search_fields = ('employee__name',)

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'id_number', 'education', 'expected_department', 'expected_position')
    list_filter = ('date', 'education', 'expected_department', 'expected_position')
    search_fields = ('name', 'id_number')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('task_id', 'completion', 'assigner', 'assign_time', 'start_time', 'expected_end', 'actual_end')
    list_filter = ('assign_time', 'expected_end')
    search_fields = ('assigner',)

@admin.register(TaskAssignment)
class TaskAssignmentAdmin(admin.ModelAdmin):
    list_display = ('task', 'employee')
    search_fields = ('employee__name',)
