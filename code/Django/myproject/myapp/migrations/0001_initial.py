# Generated by Django 5.1.7 on 2025-03-31 14:12

import django.db.models.deletion
import myapp.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Department',
            fields=[
                ('department_id', models.AutoField(primary_key=True, serialize=False, verbose_name='部门ID')),
                ('name', models.CharField(max_length=100, verbose_name='部门名称')),
            ],
        ),
        migrations.CreateModel(
            name='Task',
            fields=[
                ('task_id', models.AutoField(primary_key=True, serialize=False, verbose_name='任务ID')),
                ('completion', models.PositiveIntegerField(validators=[myapp.models.HundredPercentValidator], verbose_name='完成进度（0-100）')),
                ('content', models.JSONField(verbose_name='任务内容（JSON格式）')),
                ('assigner', models.CharField(default='CEO', max_length=50, verbose_name='分配人')),
                ('assign_time', models.DateTimeField(auto_now_add=True, verbose_name='分配时间')),
                ('start_time', models.DateTimeField(verbose_name='实际开始时间')),
                ('expected_end', models.DateTimeField(verbose_name='预期完成时间')),
                ('actual_end', models.DateTimeField(blank=True, null=True, verbose_name='实际完成时间')),
            ],
        ),
        migrations.CreateModel(
            name='EmployeeProfile',
            fields=[
                ('employee_id', models.AutoField(primary_key=True, serialize=False, verbose_name='员工ID')),
                ('name', models.CharField(max_length=100, verbose_name='姓名')),
                ('id_number', models.CharField(max_length=18, unique=True, verbose_name='身份证号')),
                ('age', models.PositiveIntegerField(verbose_name='年龄')),
                ('current_hire_date', models.DateField(verbose_name='当前入职时间')),
                ('is_employed', models.BooleanField(default=True, verbose_name='是否在职')),
            ],
            options={
                'indexes': [models.Index(fields=['employee_id'], name='myapp_emplo_employe_0cf265_idx'), models.Index(fields=['is_employed'], name='myapp_emplo_is_empl_c5c0c2_idx'), models.Index(fields=['name'], name='myapp_emplo_name_83ba00_idx'), models.Index(fields=['age'], name='myapp_emplo_age_9d6320_idx')],
            },
        ),
        migrations.CreateModel(
            name='Approval',
            fields=[
                ('approval_id', models.AutoField(primary_key=True, serialize=False, verbose_name='审批ID')),
                ('content', models.JSONField(verbose_name='审批内容（JSON格式）')),
                ('approval_type', models.CharField(max_length=20, verbose_name='审批类型')),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.employeeprofile', verbose_name='申请人')),
            ],
        ),
        migrations.CreateModel(
            name='EmploymentHistory',
            fields=[
                ('record_id', models.AutoField(primary_key=True, serialize=False, verbose_name='记录ID')),
                ('hire_date', models.DateField(verbose_name='入职时间')),
                ('leave_date', models.DateField(blank=True, null=True, verbose_name='离职时间')),
                ('leave_reason', models.CharField(blank=True, max_length=200, verbose_name='离职原因')),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.employeeprofile', verbose_name='关联员工')),
            ],
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('message_id', models.AutoField(primary_key=True, serialize=False, verbose_name='消息ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True, verbose_name='发送时间')),
                ('content', models.JSONField(verbose_name='消息内容（JSON格式）')),
                ('is_read', models.BooleanField(default=False, verbose_name='已读状态')),
                ('msg_type', models.CharField(max_length=20, verbose_name='消息类型')),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.employeeprofile', verbose_name='接收员工')),
            ],
        ),
        migrations.CreateModel(
            name='Position',
            fields=[
                ('position_id', models.AutoField(primary_key=True, serialize=False, verbose_name='职位ID')),
                ('title', models.CharField(max_length=100, verbose_name='职位名称')),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.department', verbose_name='所属部门')),
            ],
        ),
        migrations.CreateModel(
            name='Attendance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(verbose_name='打卡日期')),
                ('type', models.CharField(choices=[('in', '上班'), ('out', '下班')], max_length=3, verbose_name='打卡类型')),
                ('time', models.DateTimeField(verbose_name='具体时间')),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.employeeprofile', verbose_name='关联员工')),
            ],
            options={
                'constraints': [models.UniqueConstraint(fields=('employee', 'date', 'type'), name='unique_attendance')],
            },
        ),
        migrations.CreateModel(
            name='JobApplication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='申请人姓名')),
                ('date', models.DateField(verbose_name='申请日期')),
                ('id_number', models.CharField(max_length=18, verbose_name='身份证号')),
                ('education', models.CharField(max_length=100, verbose_name='学历')),
                ('expected_department', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.department', verbose_name='期望部门')),
                ('expected_position', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.position', verbose_name='期望职位')),
            ],
            options={
                'unique_together': {('date', 'id_number', 'expected_department', 'expected_position')},
            },
        ),
        migrations.CreateModel(
            name='EmployeeDepartment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.department', verbose_name='所属部门')),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.employeeprofile', verbose_name='关联员工')),
                ('position', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.position', verbose_name='担任职位')),
            ],
            options={
                'unique_together': {('employee', 'department', 'position')},
            },
        ),
        migrations.CreateModel(
            name='Salary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(verbose_name='薪资月份')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='薪酬金额')),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.employeeprofile', verbose_name='关联员工')),
            ],
            options={
                'unique_together': {('employee', 'date')},
            },
        ),
        migrations.CreateModel(
            name='TaskAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.employeeprofile', verbose_name='负责员工')),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.task', verbose_name='关联任务')),
            ],
            options={
                'unique_together': {('task', 'employee')},
            },
        ),
        migrations.CreateModel(
            name='UserAccount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('account', models.CharField(max_length=50, unique=True, verbose_name='登录账号')),
                ('password', models.CharField(max_length=128, verbose_name='加密密码')),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.employeeprofile', verbose_name='关联员工')),
            ],
            options={
                'indexes': [models.Index(fields=['employee'], name='myapp_usera_employe_06ae77_idx'), models.Index(fields=['account'], name='myapp_usera_account_158a67_idx')],
            },
        ),
    ]
