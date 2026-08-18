from django.conf import settings
import json

def vite_assets(request):
    user_role = ""
    if request.user.is_authenticated:
        user_role = request.user.role.lower()

    if settings.DEBUG:
        return {
            "vite_js": "http://localhost:5180/src/main.jsx",
            "vite_css": [],
            "is_dev": True,
            "user_role": user_role
        }
    else:
        # Load from manifest.json
        manifest_path = settings.BASE_DIR / "static" / "frontend" / ".vite" / "manifest.json"
        if manifest_path.exists():
            try:
                with open(manifest_path, "r", encoding="utf-8") as f:
                    manifest = json.load(f)
                main_asset = manifest.get("src/main.jsx")
                if main_asset:
                    js_file = f"frontend/{main_asset['file']}"
                    css_files = [f"frontend/{css}" for css in main_asset.get("css", [])]
                    return {
                        "vite_js": js_file,
                        "vite_css": css_files,
                        "is_dev": False,
                        "user_role": user_role
                    }
            except Exception:
                pass
                
        return {
            "vite_js": None,
            "vite_css": [],
            "is_dev": False,
            "user_role": user_role
        }
