from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'distilleries', views.DistilleryViewSet)
router.register(r'whiskies', views.WhiskyViewSet)
router.register(r'vault', views.VaultItemViewSet, basename='vault')

urlpatterns = router.urls + [
    # Secure JWT Login Endpoint (Returns Access + Refresh tokens)
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Endpoint to silently refresh expired tokens
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Keep your custom registration function
    path('register/', views.register_user, name='register'),
]