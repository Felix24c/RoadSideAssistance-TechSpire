from django.contrib import admin
from django.urls import path
from api import views

urlpatterns = [
    path('', views.home),
    path('admin/', admin.site.urls),

    # Secure Swagger (with secret)
    path('api/swagger/', views.schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

    # Users
    path('api/users', views.users_view),                # GET(list)/POST(create)
    path('api/users/<int:user_id>', views.user_view),   # GET/PUT/DELETE single user

    # User Signup and Login
    path('api/users/signup', views.signup_user),  # POST Signup
    path('api/users/login', views.login_user),    # POST Login

    # Providers
    path('api/providers', views.providers_view),              
    path('api/providers/<int:provider_id>', views.provider_view),

    # Service Requests
    path('api/requests', views.requests_view),
    path('api/requests/<int:request_id>', views.request_view),

    # Health
    path('api/health', views.health),

    # Services
    path('api/services', views.services_view),

    # --- USER REQUESTS URLS ---
    path('api/myrequests', views.my_requests_view),
    path('api/myrequests/<int:request_id>', views.my_request_patch_view),

    # Request Confirmation
    path('api/requests/<int:id>/confirm-arrived', views.confirm_arrived, name='confirm-arrived'),
    path('api/requests/<int:id>/confirm-completed', views.confirm_completed, name='confirm-completed'),
]
