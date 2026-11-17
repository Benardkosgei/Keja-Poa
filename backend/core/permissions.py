from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """Allows access only to admin / super_admin users."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ('admin', 'super_admin')
        )


class IsAgentUser(permissions.BasePermission):
    """Allows access only to agent users."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'agent'
        )


class IsAgentOrAdminUser(permissions.BasePermission):
    """Allows access to agents and admins."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ('agent', 'admin', 'super_admin')
        )


class IsLandlordUser(permissions.BasePermission):
    """Allows access only to landlord users."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'landlord'
        )


class IsLandlordOrAdminUser(permissions.BasePermission):
    """Allows access to landlords and admins."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ('landlord', 'admin', 'super_admin')
        )


class IsTenantUser(permissions.BasePermission):
    """Allows access only to tenant users."""
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'tenant'
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission: the requesting user must own the object
    (via obj.user or obj.agent) OR be an admin.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in ('admin', 'super_admin'):
            return True
        # Support both FK field names used across models
        owner = getattr(obj, 'user', None) or getattr(obj, 'agent', None)
        return owner == request.user
