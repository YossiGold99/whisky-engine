from django.contrib import admin
from .models import Distillery, Whisky

# Register your models so they show up in the admin panel
admin.site.register(Distillery)
admin.site.register(Whisky)