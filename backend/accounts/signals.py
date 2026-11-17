from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()


@receiver(post_save, sender=User)
def create_agent_profile(sender, instance, created, **kwargs):
    """
    Automatically create an AgentProfile whenever a new user with role='agent'
    is created. Also creates one if an existing user's role is changed to agent.
    """
    if instance.role == 'agent':
        # Import here to avoid circular imports
        from properties.models import AgentProfile
        AgentProfile.objects.get_or_create(user=instance)
