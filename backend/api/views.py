

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from rest_framework import serializers
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

users = []
providers = []
service_requests = []
_next_user_id = 1
_next_provider_id = 1
_next_request_id = 1

# --- Serializers ---
class UserSerializer(serializers.Serializer):
	id = serializers.IntegerField(read_only=True)
	name = serializers.CharField()
	email = serializers.EmailField()
	password = serializers.CharField(write_only=True)
	role = serializers.CharField()
	createdAt = serializers.CharField(read_only=True)



class LoginSerializer(serializers.Serializer):
	email = serializers.EmailField()
	password = serializers.CharField()


@swagger_auto_schema(method='get', responses={200: UserSerializer(many=True)})
@swagger_auto_schema(method='post', request_body=UserSerializer, responses={201: openapi.Response('Registration successful', openapi.Schema(type=openapi.TYPE_OBJECT))})

@api_view(["GET", "POST"])
def users_view(request):
	global _next_user_id
	if request.method == "GET":
		return Response([{k: u[k] for k in ("id", "name", "email", "role", "createdAt")} for u in users])
	data = request.data
	for f in ["name", "email", "password", "role"]:
		if f not in data:
			return Response({"error": f"Missing field {f}"}, status=400)
	if any(u["email"] == data["email"] for u in users):
		return Response({"error": "Email already registered"}, status=400)
	user = {
		"id": _next_user_id,
		"name": data["name"],
		"email": data["email"],
		"password": data["password"],
		"role": data["role"],
		"createdAt": timezone.now().isoformat()
	}
	users.append(user)
	_next_user_id += 1
	return Response({"message": "Registration successful", "userId": user["id"]}, status=201)


@swagger_auto_schema(method='get', responses={200: UserSerializer})
@swagger_auto_schema(method='put', request_body=UserSerializer, responses={200: openapi.Response('User updated', openapi.Schema(type=openapi.TYPE_OBJECT))})

@swagger_auto_schema(method='delete', responses={204: openapi.Response('No Content')})

@api_view(["GET", "PUT", "DELETE"])
def user_view(request, user_id: int):
	user = next((u for u in users if u["id"] == user_id), None)
	if not user:
		return Response({"error": "User not found"}, status=404)
	if request.method == "GET":
		return Response({k: user[k] for k in ("id", "name", "email", "role", "createdAt")})
	if request.method == "PUT":
		data = request.data
		if "name" in data:
			user["name"] = data["name"]
		if "password" in data:
			user["password"] = data["password"]
		return Response({"message": "User updated"})
	users[:] = [u for u in users if u["id"] != user_id]
	return Response(status=204)


@swagger_auto_schema(method='post', request_body=LoginSerializer, responses={200: openapi.Response('Login response', openapi.Schema(type=openapi.TYPE_OBJECT))})

@api_view(["POST"])
def login_user(request):
	data = request.data
	for f in ["email", "password"]:
		if f not in data:
			return Response({"error": f"Missing field {f}"}, status=400)
	user = next((u for u in users if u["email"] == data["email"] and u["password"] == data["password"]), None)
	if not user:
		return Response({"error": "Invalid email or password"}, status=401)
	return Response({"token": "dummy-token", "role": user["role"]})

# Combined provider CRUD



@api_view(["GET", "POST"])
def providers_view(request):
	return Response("Provider endpoint called.")




@api_view(["GET", "PUT", "DELETE"])
def provider_view(request, provider_id: int):
	if request.method == "GET":
		return Response("Provider detail endpoint called.")
	if request.method == "PUT":
		return Response("Provider updated.")
	return Response("Provider deleted.")

# Combined service request CRUD



@api_view(["GET", "POST"])
def requests_view(request):
	return Response("Service request endpoint called.")




@api_view(["GET", "PUT", "DELETE"])
def request_view(request, request_id: int):
	if request.method == "GET":
		return Response("Service request detail endpoint called.")
	if request.method == "PUT":
		return Response("Service request updated.")
	return Response("Service request deleted.")

@api_view(["GET"])
def health(request):
	return Response({"status": "OK"})



