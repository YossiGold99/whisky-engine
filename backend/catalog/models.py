from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Distillery(models.Model):
    name = models.CharField(max_length=255)
    region = models.CharField(max_length=100) ## e.g., Islay, Speyside, Highlands
    country = models.CharField(max_length=100, default="Scotland") ## e.g., Scotland, Ireland, USA

    def __str__(self):
        return self.name

class Whisky(models.Model):
    name = models.CharField(max_length=255) # e.g., Lagavulin 16 Year Old
    distillery = models.ForeignKey(Distillery, on_delete=models.CASCADE, related_name='whiskies')
    abv = models.DecimalField(max_digits=4, decimal_places=1) # Alcohol by volume, e.g., 43.0
    cask_type = models.CharField(max_length=255, blank=True, null=True) # e.g., Bourbon, Sherry, Peated

    smoke_level = models.IntegerField(default=0) # Scale from 0 (no smoke) to 10 (very smoky)
    wood_level = models.IntegerField(default=0) # Scale from 0 (no wood influence) to 10 (very woody)
    fruit_level = models.IntegerField(default=0) # Scale from 0 (no fruitiness) to 10 (very fruity)
    brine_level = models.IntegerField(default=0) # Scale from 0 (no brine) to 10 (very briny)

    is_peated = models.BooleanField(default=False)
    is_cask_strength = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.distillery.name} {self.name}"

class VaultItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vault_items')
    whisky = models.ForeignKey(Whisky, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    personal_rating = models.IntegerField(null=True, blank=True) # Room to rate it 1-5 later!
    notes = models.TextField(blank=True) # Room for tasting notes

    class Meta:
        # Prevent the user from adding the exact same bottle to their vault twice
        unique_together = ('user', 'whisky')

    def __str__(self):
        return f"{self.user.username} - {self.whisky.name}"