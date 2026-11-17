from django.db import models
from django.conf import settings


class PropertyCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name_plural = 'Property Categories'

    def __str__(self):
        return self.name


class PropertyAmenity(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name_plural = 'Property Amenities'

    def __str__(self):
        return self.name


class Property(models.Model):
    PROPERTY_TYPE_CHOICES = [
        ('apartment', 'Apartment'),
        ('house', 'House'),
        ('villa', 'Villa'),
        ('commercial', 'Commercial'),
        ('land', 'Land'),
        ('office', 'Office'),
    ]
    LISTING_TYPE_CHOICES = [
        ('sale', 'For Sale'),
        ('rent', 'For Rent'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=15, decimal_places=2)
    listing_type = models.CharField(max_length=10, choices=LISTING_TYPE_CHOICES)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES)
    category = models.ForeignKey(
        PropertyCategory, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='properties',
    )
    bedrooms = models.PositiveIntegerField(default=0)
    bathrooms = models.PositiveIntegerField(default=0)
    area_sqft = models.PositiveIntegerField(default=0)

    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    amenities = models.ManyToManyField(PropertyAmenity, blank=True, related_name='properties')
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='agent_properties',
    )
    landlord = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='landlord_properties',
    )

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    featured = models.BooleanField(default=False)

    # Denormalised view counter — incremented by PropertyDetailView
    view_count = models.PositiveIntegerField(default=0, editable=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Properties'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='properties/')
    alt = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Image for {self.property.title}"


class AgentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='agent_profile'
    )
    agency_name = models.CharField(max_length=255, blank=True)
    license_number = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Agent: {self.user.get_full_name()}"

    @property
    def total_listings(self):
        return self.user.agent_properties.filter(status='approved').count()

    @property
    def total_sales(self):
        return self.user.agent_properties.filter(
            status='approved', listing_type='sale'
        ).count()


class Inquiry(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('read', 'Read'),
        ('replied', 'Replied'),
        ('archived', 'Archived'),
    ]

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='inquiries')
    # Optional FK to an authenticated user — null for anonymous inquiries
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='inquiries',
    )
    sender_name = models.CharField(max_length=255)
    sender_email = models.EmailField()
    sender_phone = models.CharField(max_length=20, blank=True)
    message = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Inquiries'
        ordering = ['-created_at']

    def __str__(self):
        return f"Inquiry from {self.sender_name} on {self.property.title}"


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites'
    )
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name='favorited_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'property')

    def __str__(self):
        return f"{self.user.email} → {self.property.title}"


class Review(models.Model):
    """User reviews for agents."""
    agent = models.ForeignKey(
        AgentProfile, on_delete=models.CASCADE, related_name='reviews'
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews_given'
    )
    rating = models.PositiveSmallIntegerField()   # 1–5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('agent', 'reviewer')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.reviewer.email} → {self.agent.user.get_full_name()} ({self.rating}★)"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recompute agent average rating after every review save/delete
        self._update_agent_rating()

    def delete(self, *args, **kwargs):
        agent = self.agent
        super().delete(*args, **kwargs)
        agent_reviews = Review.objects.filter(agent=agent)
        if agent_reviews.exists():
            from django.db.models import Avg
            avg = agent_reviews.aggregate(Avg('rating'))['rating__avg']
            agent.rating = round(avg, 1)
        else:
            agent.rating = 0.0
        agent.save(update_fields=['rating'])

    def _update_agent_rating(self):
        from django.db.models import Avg
        avg = Review.objects.filter(agent=self.agent).aggregate(Avg('rating'))['rating__avg']
        self.agent.rating = round(avg or 0.0, 1)
        self.agent.save(update_fields=['rating'])
