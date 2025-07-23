# employees/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Employee, Task, TaskStatus

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'position', 'department', 'hire_date')
    search_fields = ('first_name', 'last_name', 'email', 'position', 'department')
    list_filter = ('department', 'position', 'hire_date')
    ordering = ('last_name', 'first_name')

@admin.register(TaskStatus)
class TaskStatusAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'assigned_to', 'status', 'due_date', 'assigned_by', 'created_at')
    list_filter = ('status', 'assigned_to', 'assigned_by', 'due_date')
    search_fields = ('title', 'description', 'assigned_to__first_name', 'assigned_to__last_name')
    date_hierarchy = 'created_at'
    raw_id_fields = ('assigned_to', 'assigned_by', 'status')



