from rest_framework import serializers
from .models import Distillery, Whisky

class DistillerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Distillery
        fields = ['id', 'name', 'region', 'country']

class WhiskySerializer(serializers.ModelSerializer):
    distillery = DistillerySerializer(read_only=True)

    class Meta:
        model = Whisky
        fields = [
            'id', 'name', 'distillery', 'abv', 'cask_type', 
            'smoke_level', 'wood_level', 'fruit_level', 'brine_level',
            'is_peated', 'is_cask_strength'
        ]