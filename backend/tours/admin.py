from django.contrib import admin
from .models import Tour, TourScene, TourHotspot, TourTag


class TourHotspotInline(admin.TabularInline):
    model = TourHotspot
    fk_name = 'scene'
    extra = 1


class TourTagInline(admin.TabularInline):
    model = TourTag
    extra = 1


class TourSceneInline(admin.StackedInline):
    model = TourScene
    extra = 0


@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display = ('title', 'property', 'status', 'created_at')
    list_filter = ('status',)
    list_editable = ('status',)
    inlines = [TourSceneInline]


@admin.register(TourScene)
class TourSceneAdmin(admin.ModelAdmin):
    list_display = ('name', 'tour', 'scene_id', 'order')
    inlines = [TourHotspotInline, TourTagInline]
