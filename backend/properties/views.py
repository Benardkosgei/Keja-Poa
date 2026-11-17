from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Property, PropertyImage, PropertyCategory, PropertyAmenity, AgentProfile, Inquiry, Favorite, Review
from .serializers import (
    PropertyListSerializer, PropertyDetailSerializer, PropertyWriteSerializer,
    PropertyCategorySerializer, PropertyAmenitySerializer, AgentProfileSerializer,
    AgentProfileUpdateSerializer, InquirySerializer, InquiryStatusSerializer,
    FavoriteSerializer, PropertyImageSerializer, ReviewSerializer,
)
from core.permissions import IsAgentOrAdminUser, IsAdminUser


def _safe_int(value, default=None):
    """Convert a query param to int safely, returning default on failure."""
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


# ─── Properties ───────────────────────────────────────────────────────────────

class PropertyListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/properties/  — list (public, paginated)
    POST /api/v1/properties/  — create (agent/admin only)
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['listing_type', 'property_type', 'city', 'status', 'featured', 'agent']
    search_fields = ['title', 'address', 'city', 'description']
    ordering_fields = ['price', 'created_at', 'bedrooms', 'area_sqft']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAgentOrAdminUser()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PropertyWriteSerializer
        return PropertyListSerializer

    def get_queryset(self):
        qs = Property.objects.select_related(
            'category', 'agent', 'agent__agent_profile'
        ).prefetch_related('images', 'amenities')

        user = self.request.user
        if not user.is_authenticated or user.role == 'client':
            qs = qs.filter(status='approved')
        elif user.role == 'agent':
            qs = qs.filter(Q(status='approved') | Q(agent=user))

        # Safe numeric range filters
        params = self.request.query_params
        price_min    = _safe_int(params.get('price_min'))
        price_max    = _safe_int(params.get('price_max'))
        bedrooms_min = _safe_int(params.get('bedrooms_min'))
        bathrooms_min = _safe_int(params.get('bathrooms_min'))

        if price_min is not None:
            qs = qs.filter(price__gte=price_min)
        if price_max is not None:
            qs = qs.filter(price__lte=price_max)
        if bedrooms_min is not None:
            qs = qs.filter(bedrooms__gte=bedrooms_min)
        if bathrooms_min is not None:
            qs = qs.filter(bathrooms__gte=bathrooms_min)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        property_obj = serializer.save()
        return Response(
            PropertyDetailSerializer(property_obj, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/properties/<id>/  — retrieve (public, records view)
    PATCH  /api/v1/properties/<id>/  — update (owner agent or admin)
    DELETE /api/v1/properties/<id>/  — delete (owner agent or admin)
    """
    queryset = Property.objects.select_related(
        'category', 'agent', 'agent__agent_profile'
    ).prefetch_related('images', 'amenities')

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAgentOrAdminUser()]

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return PropertyWriteSerializer
        return PropertyDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view counter atomically
        Property.objects.filter(pk=instance.pk).update(view_count=instance.view_count + 1)
        instance.view_count += 1
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        instance = self.get_object()
        if request.user.role == 'agent' and instance.agent != request.user:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.role == 'agent' and instance.agent != request.user:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class FeaturedPropertiesView(generics.ListAPIView):
    """GET /api/v1/properties/featured/ — public, paginated"""
    serializer_class = PropertyListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # No [:12] slice — let DRF pagination handle it
        return Property.objects.filter(
            status='approved', featured=True
        ).select_related(
            'category', 'agent', 'agent__agent_profile'
        ).prefetch_related('images', 'amenities')


class PropertyImageUploadView(generics.CreateAPIView):
    """POST /api/v1/properties/<pk>/images/ — upload image (agent/admin)"""
    serializer_class = PropertyImageSerializer
    permission_classes = [IsAgentOrAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        property_obj = generics.get_object_or_404(Property, pk=self.kwargs['pk'])
        # Ownership check
        if self.request.user.role == 'agent' and property_obj.agent != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only upload images to your own properties.')
        # 'property' is passed here, not from request body — serializer has no required 'property' field
        serializer.save(property=property_obj)


class PropertyApproveView(APIView):
    """POST /api/v1/properties/<pk>/approve/ — admin only"""
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        prop = generics.get_object_or_404(Property, pk=pk)
        prop.status = 'approved'
        prop.save(update_fields=['status'])
        return Response(PropertyDetailSerializer(prop, context={'request': request}).data)


class PropertyRejectView(APIView):
    """POST /api/v1/properties/<pk>/reject/ — admin only"""
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        prop = generics.get_object_or_404(Property, pk=pk)
        prop.status = 'rejected'
        prop.save(update_fields=['status'])
        return Response(PropertyDetailSerializer(prop, context={'request': request}).data)


# ─── Categories & Amenities ───────────────────────────────────────────────────

class CategoryListView(generics.ListAPIView):
    """GET /api/v1/categories/ — public"""
    queryset = PropertyCategory.objects.all()
    serializer_class = PropertyCategorySerializer
    permission_classes = [permissions.AllowAny]


class AmenityListView(generics.ListAPIView):
    """GET /api/v1/amenities/ — public"""
    queryset = PropertyAmenity.objects.all()
    serializer_class = PropertyAmenitySerializer
    permission_classes = [permissions.AllowAny]


# ─── Agents ───────────────────────────────────────────────────────────────────

class AgentListView(generics.ListAPIView):
    """GET /api/v1/agents/ — public"""
    queryset = AgentProfile.objects.select_related('user').filter(user__role='agent')
    serializer_class = AgentProfileSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__first_name', 'user__last_name', 'agency_name']


class AgentDetailView(generics.RetrieveAPIView):
    """GET /api/v1/agents/<pk>/ — public"""
    queryset = AgentProfile.objects.select_related('user')
    serializer_class = AgentProfileSerializer
    permission_classes = [permissions.AllowAny]


class AgentProfileUpdateView(generics.UpdateAPIView):
    """PATCH /api/v1/agents/me/ — authenticated agent updates their own profile"""
    serializer_class = AgentProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return generics.get_object_or_404(AgentProfile, user=self.request.user)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


# ─── Inquiries ────────────────────────────────────────────────────────────────

class InquiryCreateView(generics.CreateAPIView):
    """POST /api/v1/inquiries/ — public"""
    serializer_class = InquirySerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        # Link to authenticated user if available
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)


class InquiryListView(generics.ListAPIView):
    """GET /api/v1/inquiries/received/ — agent sees inquiries for their properties"""
    serializer_class = InquirySerializer
    permission_classes = [IsAgentOrAdminUser]

    def get_queryset(self):
        user = self.request.user
        if user.role in ('admin', 'super_admin'):
            return Inquiry.objects.all().select_related('property')
        return Inquiry.objects.filter(property__agent=user).select_related('property')


class InquiryStatusUpdateView(generics.UpdateAPIView):
    """PATCH /api/v1/inquiries/<pk>/ — agent/admin updates status"""
    serializer_class = InquiryStatusSerializer
    permission_classes = [IsAgentOrAdminUser]
    http_method_names = ['patch']

    def get_queryset(self):
        user = self.request.user
        if user.role in ('admin', 'super_admin'):
            return Inquiry.objects.all()
        return Inquiry.objects.filter(property__agent=user)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)


# ─── Favorites ────────────────────────────────────────────────────────────────

class FavoriteListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/favorites/ — list user's favorites
    POST /api/v1/favorites/ — add a favorite
    """
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('property')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoriteDeleteView(generics.DestroyAPIView):
    """DELETE /api/v1/favorites/<pk>/ — remove a favorite"""
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)


# ─── Reviews ──────────────────────────────────────────────────────────────────

class ReviewListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/agents/<agent_pk>/reviews/ — list reviews for an agent
    POST /api/v1/agents/<agent_pk>/reviews/ — leave a review (authenticated)
    """
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        return Review.objects.filter(
            agent_id=self.kwargs['agent_pk']
        ).select_related('reviewer')

    def perform_create(self, serializer):
        agent = generics.get_object_or_404(AgentProfile, pk=self.kwargs['agent_pk'])
        serializer.save(agent=agent)
