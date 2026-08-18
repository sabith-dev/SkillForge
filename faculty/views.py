from django.shortcuts import redirect

def faculty_dashboard(request):
    return redirect("dashboard")

def verify_skill(request, skill_id, action):
    return redirect("dashboard")