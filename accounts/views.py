import base64
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.http import JsonResponse
from django.urls import reverse
from .forms import UserRegisterForm, UserLoginForm, UserProfileUpdateForm, ProfileUpdateForm
from .models import Profile


def _process_avatar_upload(avatar_file):
    """Safely converts an uploaded image to a lightweight base64 Data URI."""
    if not avatar_file:
        return None
    try:
        # Check if Pillow is available for high-quality compression & resizing
        try:
            from PIL import Image
            import io
            img = Image.open(avatar_file)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            # Downscale avatar to max 300x300
            img.thumbnail((300, 300), Image.Resampling.LANCZOS)
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=85, optimize=True)
            b64_str = base64.b64encode(buf.getvalue()).decode('utf-8')
            return f"data:image/jpeg;base64,{b64_str}"
        except Exception:
            pass

        # Fallback: direct base64 encoding without Pillow
        avatar_file.seek(0)
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

            # Ensure profile exists and handle avatar upload safely without touching disk
            profile, _ = Profile.objects.get_or_create(user=user)
            avatar_data_input = request.POST.get('avatar_data')
            avatar_file = request.FILES.get('avatar') or form.cleaned_data.get('avatar')
            avatar_uri = None
            if avatar_data_input and avatar_data_input.startswith('data:image/'):
                avatar_uri = avatar_data_input
            elif avatar_file:
                avatar_uri = _process_avatar_upload(avatar_file)

            if avatar_uri:
                Profile.objects.filter(pk=profile.pk).update(avatar_data=avatar_uri)

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
        profile_form = ProfileUpdateForm(request.POST, instance=profile)

        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()

            # Handle avatar: first check if client sent compressed data URI from canvas,
            # or fallback to file uploaded in request.FILES
            avatar_data_input = request.POST.get('avatar_data')
            avatar_file = request.FILES.get('avatar')
            avatar_uri = None

            if avatar_data_input and avatar_data_input.startswith('data:image/'):
                avatar_uri = avatar_data_input
            elif avatar_file:
                avatar_uri = _process_avatar_upload(avatar_file)

            # Update profile via direct SQL UPDATE to guarantee zero filesystem writes (Vercel-safe)
            update_data = {
                'phone_number': profile_form.cleaned_data.get('phone_number', ''),
                'bio': profile_form.cleaned_data.get('bio', ''),
            }
            if avatar_data_input == 'RESET':
                update_data['avatar_data'] = ''
            elif avatar_uri:
                update_data['avatar_data'] = avatar_uri

            Profile.objects.filter(pk=profile.pk).update(**update_data)

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
    """
    Handles password reset requests. Generates a secure one-time token and sends
    a beautifully formatted HTML email containing the website logo, name, and CTA link.
    """
    is_ajax = (
        request.headers.get('x-requested-with') == 'XMLHttpRequest' or
        'application/json' in request.headers.get('Accept', '')
    )

    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        if not email:
            error_msg = "Please enter a valid email address."
            if is_ajax:
                return JsonResponse({'success': False, 'message': error_msg}, status=400)
            messages.error(request, error_msg)
            return redirect('login')

        # Find active users registered with this email (case-insensitive)
        users = list(User.objects.filter(email__iexact=email, is_active=True))

        if users:
            for user in users:
                token = default_token_generator.make_token(user)
                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                reset_path = reverse('password_reset_confirm', kwargs={'uidb64': uidb64, 'token': token})
                reset_url = request.build_absolute_uri(reset_path)

                user_display_name = user.get_full_name() or user.username or "Valued Member"

                context = {
                    'user': user,
                    'user_display_name': user_display_name,
                    'reset_url': reset_url,
                    'site_name': 'Personal Expense Tracker',
                }

                subject = "Reset Your Password - Personal Expense Tracker"
                from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', None) or 'Personal Expense Tracker <noreply@expense-tracker.com>'
                html_content = render_to_string('accounts/emails/password_reset_email.html', context)
                text_content = render_to_string('accounts/emails/password_reset_email.txt', context)

                try:
                    email_msg = EmailMultiAlternatives(
                        subject=subject,
                        body=text_content,
                        from_email=from_email,
                        to=[user.email]
                    )
                    email_msg.attach_alternative(html_content, "text/html")

                    # If SMTP credentials are configured, send real email via SMTP
                    if getattr(settings, 'EMAIL_HOST_USER', None) and getattr(settings, 'EMAIL_HOST_PASSWORD', None):
                        email_msg.send(fail_silently=False)
                    else:
                        # Development console fallback so no crash occurs without .env credentials
                        from django.core.mail.backends.console import EmailBackend as ConsoleBackend
                        ConsoleBackend().send_messages([email_msg])
                except Exception as e:
                    print(f"Error sending password reset email to {user.email}: {e}")

        success_msg = f"If an account exists for {email}, a password reset link has been sent. Please check your inbox and spam folder."
        if is_ajax:
            return JsonResponse({'success': True, 'message': success_msg})

        messages.success(request, success_msg)
        return redirect('login')

    return redirect('login')


def password_reset_confirm_view(request, uidb64, token):
    """
    Validates the password reset token and allows user to set a new password.
    """
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid, is_active=True)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    validlink = bool(user and default_token_generator.check_token(user, token))

    if not validlink:
        return render(request, 'accounts/password_reset_confirm.html', {'validlink': False})

    if request.method == 'POST':
        new_password1 = request.POST.get('new_password1', '')
        new_password2 = request.POST.get('new_password2', '')

        if len(new_password1) < 8:
            messages.error(request, "Password must be at least 8 characters long.")
            return render(request, 'accounts/password_reset_confirm.html', {'validlink': True})

        if new_password1 != new_password2:
            messages.error(request, "The two passwords do not match. Please re-enter them.")
            return render(request, 'accounts/password_reset_confirm.html', {'validlink': True})

        # Save new password
        user.set_password(new_password1)
        user.save()

        messages.success(request, "Your password has been reset successfully! Please log in with your new password.")
        return redirect('password_reset_complete')

    return render(request, 'accounts/password_reset_confirm.html', {'validlink': True})


def password_reset_complete_view(request):
    """
    Confirmation screen showing password successfully updated.
    """
    return render(request, 'accounts/password_reset_complete.html')


