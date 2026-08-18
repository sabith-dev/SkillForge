import json
from pathlib import Path

from django.conf import settings


def get_vite_asset(asset_name):
    manifest_path = (
        settings.BASE_DIR
        / "static"
        / "frontend"
        / ".vite"
        / "manifest.json"
    )

    with open(manifest_path, "r", encoding="utf-8") as file:
        manifest = json.load(file)

    asset = manifest.get(asset_name)

    if not asset:
        raise KeyError(
            f"{asset_name} not found in Vite manifest"
        )

    return asset