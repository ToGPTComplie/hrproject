# Generated by Django 5.1.7 on 2025-04-08 06:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0005_alter_approval_options_alter_department_options_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='task',
            options={'verbose_name': '任务信息', 'verbose_name_plural': '任务信息'},
        ),
    ]
