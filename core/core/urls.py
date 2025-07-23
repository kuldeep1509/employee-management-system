"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path , include
from rest_framework.response import Response # Import Response
from rest_framework.decorators import api_view # Import api_view
from django.http import HttpResponse # Import HttpResponse for favicon

# View for the API root path (e.g., your Render app's base URL)
@api_view(['GET'])
def api_root(request):
    """
    Returns a simple message for the API root and lists main endpoints.
    """
    return Response({
        'message': 'Welcome to the Employee Management System API!',
        'api_endpoints': {
            'employees': request.build_absolute_uri('api/employees/'),
            'admin': request.build_absolute_uri('admin/'),
            # Add other main endpoints here if you have them
        }
    })

# View to handle favicon.ico requests (returns 204 No Content)
def favicon_view(request):
    return HttpResponse(status=204) # 204 No Content means success, but no content to send

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('employees.urls')),
    path('', api_root),          # Handles requests to the root URL "/"
    path('favicon.ico', favicon_view), # Handles requests for /favicon.ico
]