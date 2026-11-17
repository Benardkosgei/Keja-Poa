from django.db import models
from properties.models import Property


class Tour(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]

    property = models.OneToOneField(Property, on_delete=models.CASCADE, related_name='tour')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    initial_scene = models.CharField(max_length=100, blank=True)
    floor_plan = models.ImageField(upload_to='tours/floor_plans/', null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Tour: {self.title}"


class TourScene(models.Model):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE, related_name='scenes')
    scene_id = models.CharField(max_length=100)   # client-side id e.g. "scene_001"
    name = models.CharField(max_length=255)
    panorama_image = models.ImageField(upload_to='tours/panoramas/')
    thumbnail = models.ImageField(upload_to='tours/thumbnails/', null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    # Camera defaults — position
    camera_x = models.FloatField(default=0)
    camera_y = models.FloatField(default=0)
    camera_z = models.FloatField(default=0)

    # Camera defaults — rotation (added to fix gap #32)
    camera_rot_x = models.FloatField(default=0)
    camera_rot_y = models.FloatField(default=0)
    camera_rot_z = models.FloatField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ('tour', 'scene_id')

    def __str__(self):
        return f"{self.tour.title} — {self.name}"


class TourHotspot(models.Model):
    scene = models.ForeignKey(TourScene, on_delete=models.CASCADE, related_name='hotspots')
    target_scene = models.ForeignKey(
        TourScene, on_delete=models.SET_NULL,
        related_name='incoming_hotspots',
        null=True, blank=True,
    )
    label = models.CharField(max_length=255)
    icon = models.CharField(max_length=50, blank=True)
    pos_x = models.FloatField(default=0)
    pos_y = models.FloatField(default=0)
    pos_z = models.FloatField(default=0)

    def __str__(self):
        return f"Hotspot: {self.label}"


class TourTag(models.Model):
    scene = models.ForeignKey(TourScene, on_delete=models.CASCADE, related_name='tags')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    pos_x = models.FloatField(default=0)
    pos_y = models.FloatField(default=0)
    pos_z = models.FloatField(default=0)

    def __str__(self):
        return f"Tag: {self.title}"
