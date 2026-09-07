from rest_framework import viewsets, filters
from .models import Distillery, Whisky
from .serializers import DistillerySerializer, WhiskySerializer

class DistilleryViewSet(viewsets.ModelViewSet):
    queryset = Distillery.objects.all()
    serializer_class = DistillerySerializer

class WhiskyViewSet(viewsets.ModelViewSet):
    queryset = Whisky.objects.all()
    serializer_class = WhiskySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'distillery__name', 'distillery__region', 'distillery__country', 'cask_type']