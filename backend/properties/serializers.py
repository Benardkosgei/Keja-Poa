from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Property, PropertyImage, PropertyCategory, PropertyAmenity,
    AgentProfile, Inquiry, Favorite, Review,
)

User = get_user_model()


# ─── Supporting serializers ───────────────────────────────────────────────────

class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'phone')


class PropertyCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyCategory
        fields = ('id', 'name', 'slug', 'icon')


class PropertyAmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyAmenity
        fields = ('id', 'name', 'icon')


class PropertyImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        # 'property' is set by perform_create via serializer.save(property=...)
        # so it must NOT be a required write field
        fields = ('id', 'url', 'alt', 'is_primary', 'order')
        read_only_fields = ('id', 'url')

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


# ─── Agent profile ────────────────────────────────────────────────────────────

class AgentProfileSerializer(serializers.ModelSerializer):
    user = UserMinimalSerializer(read_only=True)
    total_listings = serializers.ReadOnlyField()
    total_sales = serializers.ReadOnlyField()

    class Meta:
        model = AgentProfile
        fields = (
            'id', 'user', 'agency_name', 'license_number', 'bio',
            'rating', 'verified', 'total_listings', 'total_sales',
        )


class AgentProfileUpdateSerializer(serializers.ModelSerializer):
    """Used by authenticated agents to update their own profile."""
    class Meta:
        model = AgentProfile
        fields = ('agency_name', 'license_number', 'bio')


# ─── Property serializers ─────────────────────────────────────────────────────

class PropertyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views — includes description excerpt."""
    images = PropertyImageSerializer(many=True, read_only=True)
    category = PropertyCategorySerializer(read_only=True)
    amenities = PropertyAmenitySerializer(many=True, read_only=True)
    agent = serializers.SerializerMethodField()
    price = serializers.DecimalField(max_digits=15, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = Property
        fields = (
            'id', 'title', 'description', 'price', 'listing_type', 'property_type',
            'category', 'bedrooms', 'bathrooms', 'area_sqft',
            'address', 'city', 'state', 'amenities', 'images',
            'agent', 'status', 'featured', 'view_count', 'created_at', 'updated_at',
        )

    def get_agent(self, obj):
        if obj.agent and hasattr(obj.agent, 'agent_profile'):
            return AgentProfileSerializer(obj.agent.agent_profile, context=self.context).data
        return None


class PropertyDetailSerializer(PropertyListSerializer):
    """Full serializer including lat/lng and zip."""
    class Meta(PropertyListSerializer.Meta):
        fields = PropertyListSerializer.Meta.fields + (
            'zip_code', 'latitude', 'longitude',
        )


class PropertyWriteSerializer(serializers.ModelSerializer):
    """Used for create/update operations by agents and admins."""
    amenity_ids = serializers.PrimaryKeyRelatedField(
        queryset=PropertyAmenity.objects.all(), many=True, write_only=True, required=False
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=PropertyCategory.objects.all(), write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Property
        fields = (
            'title', 'description', 'price', 'listing_type', 'property_type',
            'category_id', 'bedrooms', 'bathrooms', 'area_sqft',
            'address', 'city', 'state', 'zip_code', 'latitude', 'longitude',
            'amenity_ids', 'featured',
        )

    def create(self, validated_data):
        amenities = validated_data.pop('amenity_ids', [])
        category = validated_data.pop('category_id', None)
        validated_data['category'] = category
        validated_data['agent'] = self.context['request'].user
        property_obj = Property.objects.create(**validated_data)
        property_obj.amenities.set(amenities)
        return property_obj

    def update(self, instance, validated_data):
        amenities = validated_data.pop('amenity_ids', None)
        category = validated_data.pop('category_id', None)
        if category is not None:
            validated_data['category'] = category
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if amenities is not None:
            instance.amenities.set(amenities)
        return instance


# ─── Inquiry ──────────────────────────────────────────────────────────────────

class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = (
            'id', 'property', 'sender_name', 'sender_email',
            'sender_phone', 'message', 'status', 'created_at',
        )
        read_only_fields = ('id', 'status', 'created_at')


class InquiryStatusSerializer(serializers.ModelSerializer):
    """Used by agents/admins to update inquiry status."""
    class Meta:
        model = Inquiry
        fields = ('status',)

    def validate_status(self, value):
        allowed = [c[0] for c in Inquiry.STATUS_CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"Status must be one of {allowed}.")
        return value


# ─── Favorite ─────────────────────────────────────────────────────────────────

class FavoriteSerializer(serializers.ModelSerializer):
    # Include the full property snapshot on read for convenience
    property_detail = PropertyListSerializer(source='property', read_only=True)

    class Meta:
        model = Favorite
        fields = ('id', 'property', 'property_detail', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate(self, attrs):
        user = self.context['request'].user
        if Favorite.objects.filter(user=user, property=attrs['property']).exists():
            raise serializers.ValidationError('This property is already in your favorites.')
        return attrs


# ─── Reviews ──────────────────────────────────────────────────────────────────

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ('id', 'agent', 'reviewer', 'reviewer_name', 'rating', 'comment', 'created_at')
        read_only_fields = ('id', 'reviewer', 'created_at')

    def get_reviewer_name(self, obj):
        return obj.reviewer.get_full_name() or obj.reviewer.email

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user
        return super().create(validated_data)
