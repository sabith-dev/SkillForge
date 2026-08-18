from django.contrib.auth import authenticate, login, logout
from django.shortcuts import redirect, render
from django.db import IntegrityError
from .models import User
from students.models import StudentProfile
from faculty.models import FacultyProfile


def login_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard")

    error_message = None
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None:
            login(request, user)
            
            # Ensure profile exists
            if user.role == User.Role.STUDENT:
                StudentProfile.objects.get_or_create(user=user)
            elif user.role == User.Role.FACULTY:
                FacultyProfile.objects.get_or_create(user=user)
                
            return redirect("dashboard")
        else:
            error_message = "Invalid username or password."

    return render(request, "accounts/login.html", {"error": error_message})


def register_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard")

    error_message = None
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")
        role = request.POST.get("role")  # STUDENT or FACULTY

        if role not in [User.Role.STUDENT, User.Role.FACULTY]:
            role = User.Role.STUDENT

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role=role
            )
            
            # Create corresponding profile
            if role == User.Role.STUDENT:
                StudentProfile.objects.create(user=user, full_name=username)
            elif role == User.Role.FACULTY:
                FacultyProfile.objects.create(user=user, full_name=username)

            # Auto login after registration
            authenticated_user = authenticate(request, username=username, password=password)
            if authenticated_user:
                login(request, authenticated_user)
            return redirect("dashboard")
        except IntegrityError:
            error_message = "Username already exists."
        except Exception as e:
            error_message = str(e)

    return render(request, "accounts/register.html", {"error": error_message})


def logout_view(request):
    logout(request)
    return redirect("accounts:login")