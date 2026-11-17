from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .serializers import RegisterSerializer, UserSerializer, PasswordChangeSerializer

User = get_user_model()


def get_tokens_for_user(user):
    """Generate JWT access + refresh token pair for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# ─── Login ────────────────────────────────────────────────────────────────────

class LoginView(APIView):
    """
    POST /api/v1/auth/login/
    Accepts { email, password } → returns { user, tokens }.
    """
    permission_classes = (permissions.AllowAny,)
    throttle_scope = 'login'

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Use filter + first() to safely handle (now-impossible) duplicate emails
        # and avoid MultipleObjectsReturned
        user_obj = User.objects.filter(email__iexact=email).first()
        if user_obj is None:
            return Response(
                {'detail': 'No account found with this email address.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = authenticate(request, username=user_obj.username, password=password)
        if user is None:
            return Response(
                {'detail': 'Invalid password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {'detail': 'This account has been disabled.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        tokens = get_tokens_for_user(user)
        return Response(
            {'user': UserSerializer(user).data, 'tokens': tokens},
            status=status.HTTP_200_OK,
        )


# ─── Register ─────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    """
    POST /api/v1/auth/register/
    Creates a new user and returns the user object + JWT tokens.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response(
            {'user': UserSerializer(user).data, 'tokens': tokens},
            status=status.HTTP_201_CREATED,
        )


# ─── Logout ───────────────────────────────────────────────────────────────────

class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/
    Blacklists the provided refresh token, invalidating the session.
    Body: { "refresh": "<refresh_token>" }
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {'detail': 'Token is invalid or already expired.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)


# ─── Profile ──────────────────────────────────────────────────────────────────

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/v1/auth/profile/  — retrieve authenticated user
    PATCH /api/v1/auth/profile/  — update profile fields (not password)
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


# ─── Password change ──────────────────────────────────────────────────────────

class PasswordChangeView(APIView):
    """
    POST /api/v1/auth/password/change/
    Body: { old_password, new_password, new_password_confirm }
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'detail': 'Password changed successfully.'},
            status=status.HTTP_200_OK,
        )
