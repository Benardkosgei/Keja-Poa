from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
        ('agent', 'Agent'),
        ('landlord', 'Landlord'),
        ('tenant', 'Tenant'),
        ('client', 'Client'),
    ]

    # Public roles that can be chosen at self-registration
    PUBLIC_ROLES = ('agent', 'landlord', 'tenant', 'client')

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    # Enforce unique emails — required for email-based login.
    # max_length=191 keeps the unique index under MySQL's 767-byte InnoDB limit
    # when using utf8mb4 (4 bytes/char × 191 = 764 bytes).
    email = models.EmailField(max_length=191, unique=True)

    class Meta:
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f"{self.get_full_name()} <{self.email}> [{self.role}]"
