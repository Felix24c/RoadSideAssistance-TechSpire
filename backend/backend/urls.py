from django.contrib import admin
from django.urls import path
from api import views

from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="API Documentation",
        default_version='v1',
        description="Swagger UI for testing API endpoints",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

    # Users
    path('api/users', views.users_view),                # GET(list)/POST(create)
    path('api/users/<int:user_id>', views.user_view),   # GET/PUT/DELETE single user

    # User Signup and Login
    path('api/users/signup', views.signup_user),  # POST Signup
    path('api/users/login', views.login_user),    # POST Login


    # Providers
    path('api/providers', views.providers_view),              # GET(list)/POST(create)
    path('api/providers/<int:provider_id>', views.provider_view), # GET/PUT/DELETE single provider

    # Service Requests
    path('api/requests', views.requests_view),            # GET(list)/POST(create)
    path('api/requests/<int:request_id>', views.request_view),  # GET/PUT/DELETE

    # Health
    path('api/health', views.health),

    # Services
    path('api/services', views.services_view),  # GET(list)/POST(create)

    # --- USER REQUESTS URLS ---
    path('api/myrequests', views.my_requests_view),  # GET current user's requests
    path('api/myrequests/<int:request_id>', views.my_request_patch_view),  # PATCH edit/cancel by user

    # Request Confirmation
    path('api/requests/<int:id>/confirm-arrived', views.confirm_arrived, name='confirm-arrived'),
    path('api/requests/<int:id>/confirm-completed', views.confirm_completed, name='confirm-completed'),

]
