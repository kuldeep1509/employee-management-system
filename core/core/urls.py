from django.contrib import admin
from django.urls import path, include
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import HttpResponse

#https://employee-management-system-u3d9-ou5oynoi1.vercel.app/

@api_view(['GET'])
def api_root(request):
    return Response({
        'message': 'Welcome to the Employee Management System API!',
        'api_endpoints': {
            'employees': request.build_absolute_uri('api/employees/'),
            'admin': request.build_absolute_uri('admin/'),
        }
    })

def favicon_view(request):
    return HttpResponse(status=204) # 204 No Content

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('employees.urls')),
    path('', api_root),          # Handles requests to the root URL "/"
    path('favicon.ico', favicon_view), # Handles requests for /favicon.ico
]