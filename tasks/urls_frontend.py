from django.urls import path
from .views import dashboard, signup

urlpatterns = [
    path('', dashboard, name='dashboard'),
    path('signup/', signup, name='signup'),
]