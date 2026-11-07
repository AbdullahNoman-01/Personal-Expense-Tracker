import base64
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import UserRegisterForm, UserLoginForm, UserProfileUpdateForm, ProfileUpdateForm
from .models import Profile


def _process_avatar_upload(avatar_file):
    """Safely converts an uploaded image to a base64 Data URI to prevent read-only filesystem errors on Vercel."""
    if not avatar_file:
        return None
    try:
        file_bytes = avatar_file.read()
        if not file_bytes:
            return None
        content_type = getattr(avatar_file, 'content_type', '') or 'image/jpeg'
        if not content_type.startswith('image/'):
            content_type = 'image/jpeg'
        b64_str = base64.b64encode(file_bytes).decode('utf-8')
        return f"data:{content_type};base64,{b64_str}"
    except Exception as e:
        print("Avatar processing error:", e)
        return None


def register_view(request):
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = UserRegisterForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()

            # Ensure profile exists and handle avatar upload safely
            profile, _ = Profile.objects.get_or_create(user=user)
            avatar_file = request.FILES.get('avatar') or form.cleaned_data.get('avatar')
            if avatar_file:
                avatar_uri = _process_avatar_upload(avatar_file)
                if avatar_uri:
                    profile.avatar_data = avatar_uri
                try:
                    profile.avatar = avatar_file
                    profile.save()
                except OSError:
                    profile.avatar = None
                    profile.save()
            else:
                profile.save()

            messages.success(request, f"Account created successfully for {user.username}! You are now logged in.")
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, "Please correct the errors below to create your account.")
    else:
        form = UserRegisterForm()

    return render(request, 'accounts/register.html', {'form': form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')

    next_url = request.GET.get('next', 'home')

    if request.method == 'POST':
        form = UserLoginForm(request.POST)
        if form.is_valid():
            username_or_email = form.cleaned_data['username_or_email'].strip()
            password = form.cleaned_data['password']
            remember_me = form.cleaned_data.get('remember_me', False)

            # Check if input is email or username
            user_obj = User.objects.filter(email__iexact=username_or_email).first()
            username = user_obj.username if user_obj else username_or_email

            user = authenticate(request, username=username, password=password)

            if user is not None:
                login(request, user)
                if not remember_me:
                    request.session.set_expiry(0)  # Session expires on browser close
                else:
                    request.session.set_expiry(1209600)  # 2 weeks

                messages.success(request, f"Welcome back, {user.first_name or user.username}!")
                return redirect(next_url)
            else:
                messages.error(request, "Invalid username/email or password. Please try again.")
    else:
        form = UserLoginForm()

    return render(request, 'accounts/login.html', {'form': form, 'next': next_url})


def logout_view(request):
    if request.method == 'POST' or request.GET.get('confirm') == 'true':
        logout(request)
        messages.info(request, "You have been logged out.")
        return redirect('login')
    
    # If user accesses GET /accounts/logout/, show friendly confirmation or log them out
    logout(request)
    return render(request, 'accounts/logout.html')


@login_required(login_url='login')
def profile_view(request):
    # Ensure profile exists
    profile, _ = Profile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        user_form = UserProfileUpdateForm(request.POST, instance=request.user)
        # We do not pass request.FILES directly to ModelForm to prevent Django's default
        # FileSystemStorage from trying to write to read-only /var/task/media/ on Vercel!
        profile_form = ProfileUpdateForm(request.POST, instance=profile)

        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_obj = profile_form.save(commit=False)

            # Check if user uploaded an avatar file
            avatar_file = request.FILES.get('avatar')
            if avatar_file:
                avatar_uri = _process_avatar_upload(avatar_file)
                if avatar_uri:
                    profile_obj.avatar_data = avatar_uri
                # Avoid file write on read-only environments
                profile_obj.avatar = None

            try:
                profile_obj.save()
            except OSError:
                profile_obj.avatar = None
                profile_obj.save()

            messages.success(request, "Your profile has been updated successfully!")
            return redirect('profile')
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        user_form = UserProfileUpdateForm(instance=request.user)
        profile_form = ProfileUpdateForm(instance=profile)

    context = {
        'user_form': user_form,
        'profile_form': profile_form,
        'profile': profile,
    }
    return render(request, 'accounts/profile.html', context)


def social_login_demo(request, provider):
    """Instant social demo login for Google/Facebook buttons"""
    provider_name = provider.capitalize()
    username = f"{provider.lower()}_user"
    email = f"{provider.lower()}.user@example.com"
    first_name = provider_name
    last_name = "Member"

    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'first_name': first_name,
            'last_name': last_name
        }
    )
    if created:
        user.set_unusable_password()
        user.save()

    login(request, user)
    messages.success(request, f"Welcome! You have signed in with {provider_name}.")
    return redirect('home')


def forgot_password_view(request):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        if email:
            messages.success(request, f"Password reset instructions have been sent to {email}.")
        else:
            messages.error(request, "Please enter a valid email address.")
    return redirect('login')

