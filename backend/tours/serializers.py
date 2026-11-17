from rest_framework import serializers
from .models import Tour, TourScene, TourHotspot, TourTag


class TourHotspotSerializer(serializers.ModelSerializer):
    # Fix #7: field was 'target_scene_id' — rename to 'target_scene' to match frontend
    target_scene = serializers.CharField(
        source='target_scene.scene_id', read_only=True, allow_null=True
    )
    position = serializers.SerializerMethodField()

    class Meta:
        model = TourHotspot
        fields = ('id', 'target_scene', 'label', 'icon', 'position')

    def get_position(self, obj):
        return {'x': obj.pos_x, 'y': obj.pos_y, 'z': obj.pos_z}


class TourTagSerializer(serializers.ModelSerializer):
    position = serializers.SerializerMethodField()

    class Meta:
        model = TourTag
        fields = ('id', 'title', 'description', 'position')

    def get_position(self, obj):
        return {'x': obj.pos_x, 'y': obj.pos_y, 'z': obj.pos_z}


class TourSceneSerializer(serializers.ModelSerializer):
    hotspots = TourHotspotSerializer(many=True, read_only=True)
    tags = TourTagSerializer(many=True, read_only=True)
    panorama_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    # Expose scene_id as 'id' for frontend compatibility
    id = serializers.CharField(source='scene_id')
    # Fix #32: include camera rotation
    camera_position = serializers.SerializerMethodField()
    camera_rotation = serializers.SerializerMethodField()

    class Meta:
        model = TourScene
        fields = (
            'id', 'name', 'panorama_url', 'thumbnail_url',
            'hotspots', 'tags', 'order',
            'camera_position', 'camera_rotation',
        )

    def get_panorama_url(self, obj):
        request = self.context.get('request')
        if obj.panorama_image and request:
            return request.build_absolute_uri(obj.panorama_image.url)
        return None

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None

    def get_camera_position(self, obj):
        return {'x': obj.camera_x, 'y': obj.camera_y, 'z': obj.camera_z}

    def get_camera_rotation(self, obj):
        return {'x': obj.camera_rot_x, 'y': obj.camera_rot_y, 'z': obj.camera_rot_z}


class TourSerializer(serializers.ModelSerializer):
    scenes = TourSceneSerializer(many=True, read_only=True)
    floor_plan_url = serializers.SerializerMethodField()

    class Meta:
        model = Tour
        fields = (
            'id', 'property', 'title', 'description',
            'initial_scene', 'scenes', 'floor_plan_url',
            'status', 'created_at', 'updated_at',
        )

    def get_floor_plan_url(self, obj):
        request = self.context.get('request')
        if obj.floor_plan and request:
            return request.build_absolute_uri(obj.floor_plan.url)
        return None
