from rest_framework import serializers
from django.contrib.auth.models import User
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

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password')
        # Ensure the password is never sent back to the frontend
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Using create_user ensures the password is automatically securely hashed!
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user