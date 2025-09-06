from django.contrib import admin
from .models import UserProfile, ServiceProvider, ServiceRequest, Service

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "phone", "created")
    search_fields = ("user__username", "role", "phone")

@admin.register(ServiceProvider)
class ServiceProviderAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "phone", "rating", "lat", "lng", "created")
    search_fields = ("name", "type")

@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'service', 'user', 'provider', 'status', 'estimated_cost', 'created', 'updated')
    list_filter = ("status", "service")
    search_fields = ("service__name", "status", "user__username", "provider__name")

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'price', 'created')
    search_fields = ('name',)
