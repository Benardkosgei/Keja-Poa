from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import PermissionDenied
from .models import Tour, TourScene
from .serializers import TourSerializer, TourSceneSerializer
from core.permissions import IsAgentOrAdminUser
from properties.models import Property


def _user_owns_tour(user, tour):
    """Return True if the user owns the tour's property, or is admin."""
    if user.role in ('admin', 'super_admin'):
        return True
    return tour.property.agent == user


class TourByPropertyView(generics.RetrieveAPIView):
    """GET /api/v1/tours/property/<property_id>/ — public, only published tours"""
    serializer_class = TourSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        return generics.get_object_or_404(
            Tour.objects.prefetch_related(
                'scenes',
                'scenes__hotspots',
                'scenes__hotspots__target_scene',
                'scenes__tags',
            ),
            property_id=self.kwargs['property_id'],
            status='published',
        )


class TourCreateView(generics.CreateAPIView):
    """POST /api/v1/tours/ — agent/admin creates a tour for their property"""
    serializer_class = TourSerializer
    permission_classes = [IsAgentOrAdminUser]

    def perform_create(self, serializer):
        # Verify the agent owns the property they're attaching the tour to
        property_id = self.request.data.get('property')
        if property_id:
            prop = generics.get_object_or_404(Property, pk=property_id)
            if self.request.user.role == 'agent' and prop.agent != self.request.user:
                raise PermissionDenied('You can only create tours for your own properties.')
        serializer.save()


class TourDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/v1/tours/<pk>/"""
    serializer_class = TourSerializer
    permission_classes = [IsAgentOrAdminUser]

    def get_queryset(self):
        return Tour.objects.prefetch_related('scenes', 'scenes__hotspots', 'scenes__tags')

    def _check_ownership(self, tour):
        if not _user_owns_tour(self.request.user, tour):
            raise PermissionDenied('You can only modify your own tours.')

    def update(self, request, *args, **kwargs):
        self._check_ownership(self.get_object())
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._check_ownership(self.get_object())
        return super().destroy(request, *args, **kwargs)


class TourSceneUploadView(generics.CreateAPIView):
    """POST /api/v1/tours/<tour_id>/scenes/ — upload a panorama scene"""
    serializer_class = TourSceneSerializer
    permission_classes = [IsAgentOrAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        tour = generics.get_object_or_404(Tour, pk=self.kwargs['tour_id'])
        if not _user_owns_tour(self.request.user, tour):
            raise PermissionDenied('You can only add scenes to your own tours.')
        serializer.save(tour=tour)


class TourSceneDeleteView(generics.DestroyAPIView):
    """DELETE /api/v1/tours/<tour_id>/scenes/<scene_pk>/"""
    permission_classes = [IsAgentOrAdminUser]

    def get_queryset(self):
        return TourScene.objects.filter(tour_id=self.kwargs['tour_id'])

    def destroy(self, request, *args, **kwargs):
        scene = self.get_object()
        if not _user_owns_tour(request.user, scene.tour):
            raise PermissionDenied('You can only delete scenes from your own tours.')
        return super().destroy(request, *args, **kwargs)
