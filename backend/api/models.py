from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=16, default="user")  # user / provider / admin
    phone = models.CharField(max_length=32, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class ServiceProvider(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    type = models.CharField(max_length=60)
    lat = models.FloatField()
    lng = models.FloatField()
    rating = models.FloatField(default=0)
    created = models.DateTimeField(auto_now_add=True)
    phone = models.CharField(max_length=32, blank=False, null=False)

    def __str__(self):
        return self.name


class Service(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.FloatField()  # base cost
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Accepted", "Accepted"),
        ("Arrived", "Arrived"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    provider = models.ForeignKey(ServiceProvider, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")  # <- updated with choices
    notes = models.TextField(blank=True)
    lat = models.FloatField()
    lng = models.FloatField()
    estimated_cost = models.FloatField(default=0)
    arrived_by_provider = models.BooleanField(default=False)
    arrived_by_user = models.BooleanField(default=False)
    completed_by_provider = models.BooleanField(default=False)
    completed_by_user = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-set estimated_cost from the linked service
        if self.service:
            self.estimated_cost = self.service.price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Req {self.id} {self.service.name} {self.status}"


