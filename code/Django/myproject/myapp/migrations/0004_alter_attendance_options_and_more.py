# Generated by Django 5.1.7 on 2025-04-08 06:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0003_alter_employeeprofile_options_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='attendance',
            options={'verbose_name': '考勤打卡', 'verbose_name_plural': '考勤打卡'},
        ),
        migrations.AlterModelOptions(
            name='employeedepartment',
            options={'verbose_name': '员工-部门关联', 'verbose_name_plural': '员工-部门关联'},
        ),
        migrations.AlterModelOptions(
            name='employmenthistory',
            options={'verbose_name': '雇佣历史', 'verbose_name_plural': '雇佣历史'},
        ),
        migrations.AlterModelOptions(
            name='jobapplication',
            options={'verbose_name': '招聘申请', 'verbose_name_plural': '招聘申请'},
        ),
        migrations.AlterModelOptions(
            name='messageemployee',
            options={'verbose_name': '消息-员工关联', 'verbose_name_plural': '消息-员工关联'},
        ),
        migrations.AlterModelOptions(
            name='salary',
            options={'verbose_name': '薪酬', 'verbose_name_plural': '薪酬'},
        ),
        migrations.AlterModelOptions(
            name='useraccount',
            options={'verbose_name': '用户账号', 'verbose_name_plural': '用户账号'},
        ),
    ]
