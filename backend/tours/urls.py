from django.urls import path
from .views import (
    TourByPropertyView,
    TourCreateView,
    TourDetailView,
    TourSceneUploadView,
    TourSceneDeleteView,
)

urlpatterns = [
    # Fix #5: 'property/<id>/' MUST come before '<pk>/' to avoid ambiguity
    path('tours/property/<int:property_id>/', TourByPropertyView.as_view(),  name='tour-by-property'),
    path('tours/',                            TourCreateView.as_view(),       name='tour-create'),
    path('tours/<int:pk>/',                   TourDetailView.as_view(),       name='tour-detail'),
    path('tours/<int:tour_id>/scenes/',       TourSceneUploadView.as_view(),  name='tour-scene-upload'),
    path('tours/<int:tour_id>/scenes/<int:pk>/', TourSceneDeleteView.as_view(), name='tour-scene-delete'),
]
