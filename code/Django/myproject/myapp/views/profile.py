from django.shortcuts import render

def profile(request):
    
    return render(request, 'myapp/profile.html')
    