from rest_framework import viewsets, filters
from .models import Distillery, Whisky, VaultItem, Distillery, Whisky, VaultItem, Flight
from .serializers import DistillerySerializer, WhiskySerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializers import (
    DistillerySerializer, 
    WhiskySerializer, 
    VaultItemSerializer,
    RegisterSerializer,
    UserSerializer,
    FlightSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken

class DistilleryViewSet(viewsets.ModelViewSet):
    queryset = Distillery.objects.all()
    serializer_class = DistillerySerializer

class WhiskyViewSet(viewsets.ModelViewSet):
    queryset = Whisky.objects.all()
    serializer_class = WhiskySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'distillery__name', 'distillery__region', 'distillery__country', 'cask_type']


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT pair for the new user instantly
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=201)
    
    return Response(serializer.errors, status=400)

class VaultItemViewSet(viewsets.ModelViewSet):
    serializer_class = VaultItemSerializer
    permission_classes = [IsAuthenticated] # CRUCIAL: Locks this endpoint down!

    def get_queryset(self):
        # Security check: Only return items belonging to the user making the request
        return VaultItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # When React sends a bottle to save, secretly attach the logged-in user to it
        serializer.save(user=self.request.user)

class FlightViewSet(viewsets.ModelViewSet):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    # CRITICAL: Anyone can view (GET), but only logged-in users can create/edit (POST/PATCH)
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Automatically attach the creator to the flight
        serializer.save(user=self.request.user)
