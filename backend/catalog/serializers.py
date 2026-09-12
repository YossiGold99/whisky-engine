from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Distillery, Flight, Whisky, VaultItem

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        # Ensure the password is never sent back to the frontend
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Using create_user ensures the password is automatically securely hashed!
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

class DistillerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Distillery
        fields = '__all__'

class WhiskySerializer(serializers.ModelSerializer):
    distillery = DistillerySerializer(read_only=True)

    class Meta:
        model = Whisky
        fields = [
            'id', 'name', 'distillery', 'abv', 'cask_type', 
            'smoke_level', 'wood_level', 'fruit_level', 'brine_level',
            'is_peated', 'is_cask_strength'
        ]

class VaultItemSerializer(serializers.ModelSerializer):
    # Automatically includes the full whisky details so React can render the bottle cards!
    whisky_detail = WhiskySerializer(source='whisky', read_only=True)

    class Meta:
        model = VaultItem
        fields = ['id', 'whisky', 'whisky_detail', 'added_at', 'personal_rating', 'notes', 'status', 'fill']

class FlightSerializer(serializers.ModelSerializer):
    # automatically packages the full whisky data (name, ABV, smoke_level, etc.) for the frontend
    whiskies_detail = WhiskySerializer(source='whiskies', many=True, read_only=True)

    class Meta:
        model= Flight
        fields = ['id', 'user', 'name', 'whiskies', 'whiskies_detail', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']  # user and created_at are set automatically, not by the client