# employees/models.py

from django.db import models
from django.contrib.auth.models import User # For 'assigned_by'
from django.contrib.auth.models import AbstractUser





class Employee(models.Model):
    """
    Represents an employee in the system.
    """
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    hire_date = models.DateField()
    position = models.CharField(max_length=100)
    department = models.CharField(max_length=100)

    
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class TaskStatus(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Task Statuses" 

    def __str__(self):  
        return self.name

class Task(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    status = models.ForeignKey(TaskStatus, on_delete=models.SET_NULL, null=True, blank=True)
    assigned_to = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True,related_name='tasks')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
    








