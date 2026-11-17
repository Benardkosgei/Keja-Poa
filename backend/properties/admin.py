from django.contrib import admin
from .models import Property, PropertyImage, PropertyCategory, PropertyAmenity, AgentProfile, Inquiry, Favorite


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'city', 'listing_type', 'property_type', 'price', 'status', 'featured', 'created_at')
    list_filter = ('status', 'listing_type', 'property_type', 'featured', 'city')
    search_fields = ('title', 'address', 'city')
    list_editable = ('status', 'featured')
    inlines = [PropertyImageInline]
    actions = ['approve_properties', 'reject_properties']

    def approve_properties(self, request, queryset):
        queryset.update(status='approved')
    approve_properties.short_description = 'Approve selected properties'

    def reject_properties(self, request, queryset):
        queryset.update(status='rejected')
    reject_properties.short_description = 'Reject selected properties'


@admin.register(PropertyCategory)
class PropertyCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(PropertyAmenity)
class PropertyAmenityAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon')


@admin.register(AgentProfile)
class AgentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'agency_name', 'verified', 'rating')
    list_editable = ('verified',)


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ('sender_name', 'sender_email', 'property', 'status', 'created_at')
    list_filter = ('status',)
    list_editable = ('status',)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'property', 'created_at')
