# employees/views.py

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from .models import Employee, Task, TaskStatus
from .serializers import EmployeeSerializer, TaskSerializer, TaskStatusSerializer, UserSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['department', 'position']
    search_fields = ['first_name', 'last_name', 'email', 'position', 'department']
    ordering_fields = ['first_name', 'last_name', 'hire_date', 'position']
    ordering = ['first_name']
 
    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        employee = get_object_or_404(Employee, pk=pk)
        tasks = employee.tasks.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['assigned_to', 'status', 'assigned_by']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'created_at', 'status__name']
    ordering = ['due_date']


class TaskStatusViewSet(viewsets.ModelViewSet):
    queryset = TaskStatus.objects.all()
    serializer_class = TaskStatusSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']
    ordering = ['name']


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = [' ', 'first_name', 'last_name']
    ordering_fields = ['username', 'first_name']
    ordering = ['username']
