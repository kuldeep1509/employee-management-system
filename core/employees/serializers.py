# employees/serializers.py

from rest_framework import serializers
from .models import Employee, Task, TaskStatus
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the Django User model (only for 'assigned_by' display).
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class TaskStatusSerializer(serializers.ModelSerializer):
    """
    Serializer for TaskStatus model.
    """
    class Meta:
        model = TaskStatus # it means it based on TaskStatus model
        fields = '__all__' #include all fields in output


class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for Task model.
    Includes nested serializers and custom display fields.
    """
    status_name = serializers.CharField(source='status.name', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    assigned_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description',
            'assigned_to', 'assigned_to_name',
            'assigned_by', 'assigned_by_name',
            'status', 'status_name',
            'due_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip()
        return None

    def get_assigned_by_name(self, obj):
        return obj.assigned_by.username if obj.assigned_by else None


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Serializer for Employee model.
    Includes nested tasks and task_count.
    """
    tasks = TaskSerializer(many=True, read_only=True)
    task_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone_number',
            'hire_date', 'position', 'department',
            'tasks', 'task_count'
        ]
        read_only_fields = ['id']

    def get_task_count(self, obj):
        return obj.tasks.count()
    

