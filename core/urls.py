from django.contrib import admin
from django.urls import include, path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from django.views.static import serve
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    path('accounts/', include('accounts.urls')),
    path('favicon.ico', RedirectView.as_view(url='/static/favicon.svg', permanent=False)),
    path('favicon.svg', RedirectView.as_view(url='/static/favicon.svg', permanent=False)),
    path('favicon.png', RedirectView.as_view(url='/static/favicon.png', permanent=False)),
]

# Ensure static & media files are always served reliably across Vercel & local
urlpatterns += [
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR / 'static'}),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

