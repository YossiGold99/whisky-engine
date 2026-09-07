from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DistilleryViewSet, WhiskyViewSet

# This automatically generates the /whiskies/ and /distilleries/ JSON endpoints
router = DefaultRouter()
router.register(r'distilleries', DistilleryViewSet)
router.register(r'whiskies', WhiskyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]