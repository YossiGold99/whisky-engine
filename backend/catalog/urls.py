from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'distilleries', views.DistilleryViewSet)
router.register(r'whiskies', views.WhiskyViewSet)
router.register(r'vault', views.VaultItemViewSet, basename='vault')
router.register(r'flights', views.FlightViewSet, basename='flight')

urlpatterns = router.urls + [
    # Secure JWT Login Endpoints
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Custom registration function
    path('register/', views.register_user, name='register'),
]