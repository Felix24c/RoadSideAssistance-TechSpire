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
	type = models.CharField(max_length=60)
	lat = models.FloatField()
	lng = models.FloatField()
	rating = models.FloatField(default=0)
	created = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.name


class ServiceRequest(models.Model):
	service_type = models.CharField(max_length=60)
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	provider = models.ForeignKey(ServiceProvider, on_delete=models.CASCADE)
	status = models.CharField(max_length=20, default="Pending")  # Pending / Accepted / Completed / Cancelled
	notes = models.TextField(blank=True)
	lat = models.FloatField()
	lng = models.FloatField()
	created = models.DateTimeField(auto_now_add=True)
	updated = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Req {self.id} {self.service_type} {self.status}"

# Views still use in-memory structures; swap to these later if desired.
