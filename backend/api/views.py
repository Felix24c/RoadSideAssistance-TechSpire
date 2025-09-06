from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import UserProfile, ServiceProvider, ServiceRequest, Service
from .serializers import UserSerializer
from .serializers import UserSignupSerializer


from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import ServiceRequestUserSerializer, ServiceRequestEditSerializer

from rest_framework_simplejwt.tokens import RefreshToken


# -------------------------------
# Users
# -------------------------------

@api_view(['GET', 'POST'])
def users_view(request):
    if request.method == 'GET':
        users = User.objects.all()
        data = [{"id": u.id, "username": u.username, "email": u.email} for u in users]
        return Response(data)
    elif request.method == 'POST':
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        user = User.objects.create_user(username=username, password=password, email=email)
        UserProfile.objects.create(user=user)
        return Response({"id": user.id, "username": user.username}, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'DELETE'])
def user_view(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.method == 'GET':
        return Response({"id": user.id, "username": user.username, "email": user.email})
    elif request.method == 'PUT':
        user.username = request.data.get('username', user.username)
        user.email = request.data.get('email', user.email)
        if 'password' in request.data:
            user.set_password(request.data['password'])
        user.save()
        return Response({"id": user.id, "username": user.username})
    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# -------------------------------
# Providers
# -------------------------------

@api_view(['GET', 'POST'])
def providers_view(request):
    if request.method == 'GET':
        providers = ServiceProvider.objects.all()
        data = [
            {
                "id": p.id,
                "name": p.name,
                "type": p.type,
                "lat": p.lat,
                "lng": p.lng,
                "rating": p.rating
            } for p in providers
        ]
        return Response(data)
    elif request.method == 'POST':
        name = request.data.get('name')
        type_ = request.data.get('type')
        lat = request.data.get('lat', 0)
        lng = request.data.get('lng', 0)
        provider = ServiceProvider.objects.create(name=name, type=type_, lat=lat, lng=lng)
        return Response({"id": provider.id, "name": provider.name}, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'DELETE'])
def provider_view(request, provider_id):
    provider = get_object_or_404(ServiceProvider, id=provider_id)
    if request.method == 'GET':
        return Response({"id": provider.id, "name": provider.name, "type": provider.type})
    elif request.method == 'PUT':
        provider.name = request.data.get('name', provider.name)
        provider.type = request.data.get('type', provider.type)
        provider.save()
        return Response({"id": provider.id, "name": provider.name})
    elif request.method == 'DELETE':
        provider.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# -------------------------------
# Service Requests
# -------------------------------

@api_view(['GET', 'POST'])
def requests_view(request):
    if request.method == 'GET':
        requests = ServiceRequest.objects.all()
        data = [
            {
                "id": r.id,
                "service": {
                    "id": r.service.id,
                    "name": r.service.name,
                    "description": r.service.description,
                    "price": r.service.price
                },
                "user": r.user.username if r.user else None,
                "provider": r.provider.name if r.provider else None,
                "status": r.status,
                "lat": r.lat,
                "lng": r.lng,
                "estimated_cost": r.estimated_cost
            } for r in requests
        ]
        return Response(data)

    elif request.method == 'POST':
        service_id = request.data.get('service')   # expects service ID
        user_id = request.data.get('user')         # expects user ID
        provider_id = request.data.get('provider') # expects provider ID
        lat = request.data.get('lat', 0)
        lng = request.data.get('lng', 0)

        service = get_object_or_404(Service, id=service_id)
        user = get_object_or_404(User, id=user_id)
        provider = get_object_or_404(ServiceProvider, id=provider_id)

        req = ServiceRequest.objects.create(
            service=service,
            user=user,
            provider=provider,
            lat=lat,
            lng=lng
        )

        return Response({
            "id": req.id,
            "service": {
                "id": service.id,
                "name": service.name,
                "price": service.price
            },
            "user": user.username,
            "provider": provider.name,
            "status": req.status,
            "estimated_cost": req.estimated_cost
        }, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'DELETE'])
def request_view(request, request_id):
    req = get_object_or_404(ServiceRequest, id=request_id)
    
    if request.method == 'GET':
        return Response({
            "id": req.id,
            "service": {
                "id": req.service.id,
                "name": req.service.name,
                "description": req.service.description,
                "price": req.service.price
            },
            "status": req.status,
            "user": req.user.username if req.user else None,
            "provider": req.provider.name if req.provider else None,
            "estimated_cost": req.estimated_cost
        })
    
    elif request.method == 'PUT':
        req.status = request.data.get('status', req.status)
        req.save()
        return Response({"id": req.id, "status": req.status})
    
    elif request.method == 'DELETE':
        req.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# -------------------------------
# Services
# -------------------------------

@api_view(['GET', 'POST'])
def services_view(request):
    if request.method == 'GET':
        services = Service.objects.all()
        data = [{"id": s.id, "name": s.name, "description": s.description, "price": s.price} for s in services]
        return Response(data)
    elif request.method == 'POST':
        name = request.data.get('name')
        description = request.data.get('description', '')
        price = request.data.get('price', 0)
        service = Service.objects.create(name=name, description=description, price=price)
        return Response({"id": service.id, "name": service.name}, status=status.HTTP_201_CREATED)

# -------------------------------
# Health
# -------------------------------
@api_view(['GET'])
def health(request):
    return Response({"status": "OK"})


# -------------------------------
# Signup and Login
# -------------------------------
@api_view(['POST'])
def signup_user(request):
    data = request.data

    # Check if email already exists
    if User.objects.filter(email=data.get('email')).exists():
        return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=data.get('username')).exists():
        return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)

    # Create user
    user = User.objects.create(
        username=data.get('username'),
        email=data.get('email'),
        password=make_password(data.get('password'))  # hash the password
    )

    # Create related profile
    UserProfile.objects.create(
        user=user,
        phone=data.get('phone'),
        role=data.get('role', 'user')  # default role = user
    )

    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@csrf_exempt
def login_user(request):
    try:
        data = request.data
        email = data.get("email")
        password = data.get("password")

        # Find user by email
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate with username + password
        user = authenticate(username=user_obj.username, password=password)
        if user is not None:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),   # <-- Access token for frontend
                "refresh": str(refresh),
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.userprofile.role
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": f"Login failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- USER'S OWN REQUESTS: LIST, EDIT, CANCEL ---


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def my_requests_view(request):
    """
    Return logged-in user's own service requests.
    """
    user = request.user
    requests = ServiceRequest.objects.filter(user=user).order_by('-created')
    serializer = ServiceRequestUserSerializer(requests, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def my_request_patch_view(request, request_id):
    """
    Allow only the owner to PATCH notes, lat, lng, status (can set status to 'Cancelled').
    Only allowed if request is Pending or Cancelled.
    """
    user = request.user
    try:
        obj = ServiceRequest.objects.get(id=request_id, user=user)
    except ServiceRequest.DoesNotExist:
        return Response({'error': 'Not found.'}, status=404)

    if obj.status not in ["Pending", "Cancelled"]:
        return Response({'error': 'Can only edit or cancel pending/cancelled requests.'}, status=403)

    serializer = ServiceRequestEditSerializer(obj, data=request.data, partial=True)
    if serializer.is_valid():
        updated_status = serializer.validated_data.get('status')
        # Only allow set to 'Cancelled' for status update via PATCH
        if updated_status and updated_status not in ["Pending", "Cancelled"]:
            return Response({"error": "Can only set status to Pending or Cancelled."}, status=400)
        serializer.save()
        return Response({"success": "Request updated.", "data": ServiceRequestUserSerializer(obj).data})
    else:
        return Response(serializer.errors, status=400)
