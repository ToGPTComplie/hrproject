from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator

from ..models import Message, EmployeeProfile


@login_required
def message_list(request):
    """消息列表"""
    employee_id = request.session.get('user_id')
    
    if not employee_id:
        messages.error(request, '请先登录系统。')
        return redirect('login')
    
    employee = get_object_or_404(EmployeeProfile, pk=employee_id)
    
    # 获取员工的所有消息
    user_messages = Message.objects.filter(employee=employee).order_by('-timestamp')
    
    # 分页
    paginator = Paginator(user_messages, 10)  # 每页10条
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
    }
    return render(request, 'myapp/message_list.html', context)

@login_required
def message_detail(request, message_id):
    """消息详情"""
    message = get_object_or_404(Message, pk=message_id)
    
    # 标记消息为已读
    if not message.is_read:
        message.is_read = True
        message.save()
    
    context = {
        'message': message,
    }
    return render(request, 'myapp/message_detail.html', context)