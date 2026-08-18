from django import forms

from .models import StudentSkill, Skill


class StudentSkillForm(forms.ModelForm):

    class Meta:
        model = StudentSkill

        fields = [
            "skill",
            "level",
            "years_experience",
        ]

        widgets = {
            "skill": forms.Select(
                attrs={
                    "class": "form-control"
                }
            ),

            "level": forms.Select(
                attrs={
                    "class": "form-control"
                }
            ),

            "years_experience": forms.NumberInput(
                attrs={
                    "class": "form-control",
                    "step": "0.5",
                    "min": "0"
                }
            ),
        }