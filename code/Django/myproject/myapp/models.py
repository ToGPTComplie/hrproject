from datetime import timezone
from django.db import models
from django.contrib.auth.hashers import make_password
from django.db.models import UniqueConstraint
from django.core.exceptions import ValidationError
from django.db import transaction
import json

def HundredPercentValidator(value):
    """自定义验证器，确保任务完成率不超过100%"""
    if value > 100:
        raise ValidationError(
            ('%(value)s 超过100%'),
            params={'value': value},
        )
    return value


class EmployeeProfile(models.Model):
    """员工档案表（核心表）
    对应SQL设计中的档案表，存储员工基本信息及雇佣状态"""
    employee_id = models.AutoField(primary_key=True, verbose_name="员工ID")
    name = models.CharField(max_length=100, verbose_name="姓名")
    id_number = models.CharField(
        max_length=18, 
        unique=True,  # 对应SQL设计中的唯一约束
        verbose_name="身份证号"
    )
    age = models.PositiveIntegerField(verbose_name="年龄")
    current_hire_date = models.DateField(verbose_name="当前入职时间")
    is_employed = models.BooleanField(default=True, verbose_name="是否在职")

    def save(self, *args, **kwargs):
        """重写save方法处理雇佣状态变更逻辑
        实现SQL设计中提到的自动更新入职时间功能"""
        with transaction.atomic():  # 保证事务原子性
            # 新员工入职时设置初始入职时间
            if not self.pk:  # 仅在新创建时处理
                if self.is_employed and self.current_hire_date is None:
                    self.current_hire_date = timezone.now().date()
            
            # 处理重新入职逻辑
            if self.pk:
                orig = EmployeeProfile.objects.select_for_update().get(pk=self.pk)
                if not orig.is_employed and self.is_employed:
                    # 更新入职时间为当前时间
                    self.current_hire_date = timezone.now().date()
            
        super().save(*args, **kwargs)

    class Meta:
        indexes = [
            # 为常用查询字段添加索引（注意：重复索引需要检查）
            models.Index(fields=['employee_id']),  #员工ID索引
            models.Index(fields=['is_employed']),  # 在职状态索引
            models.Index(fields=['name']),# 姓名索引
            models.Index(fields=['age']),
        ]

class EmploymentHistory(models.Model):
    """雇佣历史表
    记录员工入职离职历史，与档案表关联"""
    record_id = models.AutoField(primary_key=True, verbose_name="记录ID")
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,  # 级联删除
        verbose_name="关联员工"
    )
    hire_date = models.DateField(verbose_name="入职时间")
    leave_date = models.DateField(null=True, blank=True, verbose_name="离职时间")
    leave_reason = models.CharField(
        max_length=200, 
        blank=True,
        verbose_name="离职原因"
    )

class UserAccount(models.Model):
    """用户账号表
    与员工档案表一对一关联，存储登录凭证"""
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,  # 级联删除
        verbose_name="关联员工"
    )
    account = models.CharField(
        max_length=50,
        unique=True,  # 账号唯一约束
        verbose_name="登录账号"
    )
    password = models.CharField(max_length=128, verbose_name="加密密码")
    
    class Meta:
        indexes=[
            models.Index(fields=['employee']),
            models.Index(fields=['account']),
        ]
    def save (self, *args, **kwargs):
        """重写save方法，确保密码加密存储"""
        self.password = make_password(self.password)
        super().save(*args, **kwargs)

class Attendance(models.Model):
    """考勤打卡表
    记录每日上下班打卡时间，防止重复打卡"""
    ATTENDANCE_TYPE = [('in', '上班'), ('out', '下班')]
    
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        verbose_name="关联员工"
    )
    date = models.DateField(verbose_name="打卡日期")
    type = models.CharField(
        max_length=3, 
        choices=ATTENDANCE_TYPE,
        verbose_name="打卡类型"
    )
    time = models.DateTimeField(verbose_name="具体时间")

    class Meta:
        constraints = [
            # 唯一约束：同一员工同一天不能重复同类型打卡
            UniqueConstraint(
                fields=['employee', 'date', 'type'],
                name='unique_attendance'
            )
        ]

class Salary(models.Model):
    """薪酬表
    按日期记录员工薪酬，支持自动计算和手动修改"""
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        verbose_name="关联员工"
    )
    date = models.DateField(verbose_name="薪资月份")
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        verbose_name="薪酬金额(元)"
    )

    class Meta:
        # 复合主键约束：同一员工同月只能有一条记录
        unique_together = ('employee', 'date')

class Message(models.Model):
    """消息通知表
    支持JSON格式消息内容存储"""
    message_id = models.AutoField(primary_key=True, verbose_name="消息ID")
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        verbose_name="接收员工"
    )
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="发送时间")
    content = models.JSONField(verbose_name="消息内容（JSON格式）")
    is_read = models.BooleanField(default=False, verbose_name="已读状态")
    msg_type = models.CharField(max_length=20, verbose_name="消息类型")

class Department(models.Model):
    """部门信息表"""
    department_id = models.AutoField(primary_key=True, verbose_name="部门ID")
    name = models.CharField(max_length=100, verbose_name="部门名称")

class Position(models.Model):
    """职位信息表"""
    position_id = models.AutoField(primary_key=True, verbose_name="职位ID")
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        verbose_name="所属部门"
    )
    title = models.CharField(max_length=100, verbose_name="职位名称")

class EmployeeDepartment(models.Model):
    """员工-部门关联表
    实现多对多关系，支持兼职"""
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        verbose_name="关联员工"
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        verbose_name="所属部门"
    )
    position = models.ForeignKey(
        Position,
        on_delete=models.CASCADE,
        verbose_name="担任职位"
    )

    class Meta:
        # 唯一约束：避免重复的部门职位分配
        unique_together = ('employee', 'department', 'position')

class Approval(models.Model):
    """审批记录表"""
    approval_id = models.AutoField(primary_key=True, verbose_name="审批ID")
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        verbose_name="申请人"
    )
    content = models.JSONField(verbose_name="审批内容（JSON格式）")
    approval_type = models.CharField(max_length=20, verbose_name="审批类型")

class JobApplication(models.Model):
    """招聘申请表
    实现每天每人每个部门岗位只能申请一次"""
    name = models.CharField(max_length=100, verbose_name="申请人姓名")
    date = models.DateField(verbose_name="申请日期")
    id_number = models.CharField(max_length=18, verbose_name="身份证号")
    education = models.CharField(max_length=100, verbose_name="学历")
    expected_department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        verbose_name="期望部门"
    )
    expected_position = models.ForeignKey(
        Position,
        on_delete=models.CASCADE,
        verbose_name="期望职位"
    )

    class Meta:
        # 复合主键：控制每人每天每个岗位只能申请一次
        unique_together = ('date', 'id_number', 'expected_department', 'expected_position')

class Task(models.Model):
    """任务主表
    包含任务进度和生命周期管理"""
    task_id = models.AutoField(primary_key=True, verbose_name="任务ID")
    completion = models.PositiveIntegerField(
        validators=[HundredPercentValidator],  # 自定义验证
        verbose_name="完成进度（0-100）"
    )
    content = models.JSONField(verbose_name="任务内容（JSON格式）")
    assigner = models.CharField(
        max_length=50, 
        default='CEO',
        verbose_name="分配人"
    )
    assign_time = models.DateTimeField(
        auto_now_add=True,
        verbose_name="分配时间"
    )
    start_time = models.DateTimeField(verbose_name="实际开始时间")
    expected_end = models.DateTimeField(verbose_name="预期完成时间")
    actual_end = models.DateTimeField(
        null=True, 
        blank=True,
        verbose_name="实际完成时间"
    )

class TaskAssignment(models.Model):
    """任务分配表
    记录任务与执行人的多对多关系"""
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,  # 级联删除
        verbose_name="关联任务"
    )
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        verbose_name="负责员工"
    )

    class Meta:
        # 唯一约束：避免重复分配同一任务给同一员工
        unique_together = ('task', 'employee')