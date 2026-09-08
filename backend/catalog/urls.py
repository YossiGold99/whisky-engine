from rest_framework.routers import DefaultRouter
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token # 
from . import views

router = DefaultRouter()
router.register(r'distilleries', views.DistilleryViewSet)
router.register(r'whiskies', views.WhiskyViewSet)
router.register(r'vault', views.VaultItemViewSet, basename='vault')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', obtain_auth_token, name='login'), 
    path('register/', views.register_user, name='register'),
]