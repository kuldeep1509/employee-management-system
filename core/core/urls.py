from django.contrib import admin
from django.urls import path, include
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import HttpResponse

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
    return HttpResponse(status=204) #postgresql://employee_db_l1xe_user:NfUWWQY8fpQNG5dw3brvDMfC8SbsJNMn@dpg-d20dnqmuk2gs73c65tn0-a.oregon-postgres.render.com/employee_db_l1xe

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('employees.urls')),
    path('', api_root),
    path('favicon.ico', favicon_view),
]