from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, UserProfileView, LoginView, LogoutView, PasswordChangeView

urlpatterns = [
    path('login/',            LoginView.as_view(),          name='auth_login'),
    path('register/',         RegisterView.as_view(),        name='auth_register'),
    path('logout/',           LogoutView.as_view(),          name='auth_logout'),
    path('refresh/',          TokenRefreshView.as_view(),    name='token_refresh'),
    path('profile/',          UserProfileView.as_view(),     name='user_profile'),
    path('password/change/',  PasswordChangeView.as_view(),  name='password_change'),
]
