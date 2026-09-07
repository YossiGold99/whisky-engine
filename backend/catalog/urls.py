from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DistilleryViewSet, WhiskyViewSet
from django.urls import path
from . import views

# This automatically generates the /whiskies/ and /distilleries/ JSON endpoints
router = DefaultRouter()
router.register(r'distilleries', DistilleryViewSet)
router.register(r'whiskies', WhiskyViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.register_user, name='register'),
]