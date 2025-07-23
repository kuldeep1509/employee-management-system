# employees/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, TaskViewSet, TaskStatusViewSet, UserViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'task-statuses', TaskStatusViewSet)
router.register(r'users', UserViewSet) # For listing users who can assign tasks

urlpatterns = [
    path('', include(router.urls)),
]