from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'status', 'due_date', 'user', 'created_at')
    list_filter = ('status', 'priority', 'user')
    search_fields = ('title', 'description')