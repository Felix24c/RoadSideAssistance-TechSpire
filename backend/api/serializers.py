from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile
from .models import ServiceProvider, ServiceRequest, Service

class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        # create UserProfile automatically
        UserProfile.objects.create(user=user, role='user')
        return user


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source="userprofile.role", read_only=True)
    phone = serializers.CharField(source="userprofile.phone", read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone']

# --- NEW CODE FOR SERVICE PROVIDER AND REQUESTS ---

class ServiceProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceProvider
        fields = "__all__"
        extra_kwargs = {'phone': {'read_only': True}}  # ensure phone is included and not writable

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name', 'description', 'price']

class ServiceRequestUserSerializer(serializers.ModelSerializer):
    provider = ServiceProviderSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    user = serializers.CharField(source='user.username', read_only=True)  # or source='user.id' if you want the id

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'service', 'user', 'provider', 'status', 'notes',
            'lat', 'lng', 'estimated_cost', 'created', 'updated',

             'arrived_by_provider', 'arrived_by_user', 'completed_by_provider', 'completed_by_user'
             
        ]


class ServiceRequestEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = ['notes', 'lat', 'lng', 'status']


class ServiceRequestSerializer(serializers.ModelSerializer):
    provider = ServiceProviderSerializer()
    service = ServiceSerializer()
    user = serializers.StringRelatedField()

    class Meta:
        model = ServiceRequest
        fields = '__all__'
