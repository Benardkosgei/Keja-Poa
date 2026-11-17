from django.urls import path
from .views import (
    # Properties
    PropertyListCreateView, PropertyDetailView, FeaturedPropertiesView,
    PropertyImageUploadView, PropertyApproveView, PropertyRejectView,
    # Lookups
    CategoryListView, AmenityListView,
    # Agents
    AgentListView, AgentDetailView, AgentProfileUpdateView,
    # Inquiries
    InquiryCreateView, InquiryListView, InquiryStatusUpdateView,
    # Favorites
    FavoriteListCreateView, FavoriteDeleteView,
    # Reviews
    ReviewListCreateView,
)

urlpatterns = [
    # ── Properties ──────────────────────────────────────────────────────────
    # NOTE: 'featured/' must be declared before '<int:pk>/' to avoid Django
    # matching "featured" as a pk integer (it can't, but best practice)
    path('properties/',                     PropertyListCreateView.as_view(),  name='property-list'),
    path('properties/featured/',            FeaturedPropertiesView.as_view(),  name='property-featured'),
    path('properties/<int:pk>/',            PropertyDetailView.as_view(),      name='property-detail'),
    path('properties/<int:pk>/images/',     PropertyImageUploadView.as_view(), name='property-images'),
    path('properties/<int:pk>/approve/',    PropertyApproveView.as_view(),     name='property-approve'),
    path('properties/<int:pk>/reject/',     PropertyRejectView.as_view(),      name='property-reject'),

    # ── Lookups ──────────────────────────────────────────────────────────────
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('amenities/',  AmenityListView.as_view(),  name='amenity-list'),

    # ── Agents ───────────────────────────────────────────────────────────────
    path('agents/',         AgentListView.as_view(),          name='agent-list'),
    path('agents/me/',      AgentProfileUpdateView.as_view(), name='agent-me'),
    path('agents/<int:pk>/', AgentDetailView.as_view(),       name='agent-detail'),

    # Agent reviews
    path('agents/<int:agent_pk>/reviews/', ReviewListCreateView.as_view(), name='agent-reviews'),

    # ── Inquiries ─────────────────────────────────────────────────────────────
    path('inquiries/',             InquiryCreateView.as_view(),       name='inquiry-create'),
    path('inquiries/received/',    InquiryListView.as_view(),         name='inquiry-list'),
    path('inquiries/<int:pk>/',    InquiryStatusUpdateView.as_view(), name='inquiry-update'),

    # ── Favorites ─────────────────────────────────────────────────────────────
    path('favorites/',          FavoriteListCreateView.as_view(), name='favorite-list'),
    path('favorites/<int:pk>/', FavoriteDeleteView.as_view(),     name='favorite-delete'),
]
