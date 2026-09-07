from rest_framework import viewsets, filters
from .models import Distillery, Whisky
from .serializers import DistillerySerializer, WhiskySerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer

class DistilleryViewSet(viewsets.ModelViewSet):
    queryset = Distillery.objects.all()
    serializer_class = DistillerySerializer

class WhiskyViewSet(viewsets.ModelViewSet):
    queryset = Whisky.objects.all()
    serializer_class = WhiskySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'distillery__name', 'distillery__region', 'distillery__country', 'cask_type']


@api_view(['POST'])
@permission_classes([AllowAny]) # Anyone can access the registration page
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        # Generate the auth token for the new user immediately
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=201)
    
    # If the username is taken, return the exact error
    return Response(serializer.errors, status=400)