from rest_framework import viewsets, filters
from .models import Distillery, Whisky
from .serializers import DistillerySerializer, WhiskySerializer

class DistilleryViewSet(viewsets.ModelViewSet):
    queryset = Distillery.objects.all()
    serializer_class = DistillerySerializer

class WhiskyViewSet(viewsets.ModelViewSet):
    queryset = Whisky.objects.all()
    serializer_class = WhiskySerializer
    # 1. This line turns on the DRF search engine
    filter_backends = [filters.SearchFilter]
    # 2. This tells it exactly which fields to search through (including the distillery's region!)
    search_fields = ['name', 'distillery__name', 'distillery__region', 'cask_type']