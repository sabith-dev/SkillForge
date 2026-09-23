# SkillForge

## Student Skill, Career & Achievement Platform

SkillForge is a digital career identity platform that allows students
to maintain a verified profile containing their skills, projects,
certifications, internships, achievements, seminars and research work.

## Features

- Student authentication
- Faculty authentication
- Admin management
- Student profiles
- Skill management
- Skill verification
- Project management
- Certification management
- Internship tracking
- Achievement management
- Research and seminars
- Career score
- Profile strength
- Faculty verification
- Public portfolio
- Opportunity matching
- Notifications

## Tech Stack

### Backend
- Python
- Django
- PostgreSQL

### Frontend
- React
- Vite
- JavaScript

### Tools
- Git
- GitHub
- VS Code

## Project Architecture

Student
↓
Django
↓
PostgreSQL

React
↓
Django Templates
↓
Django Views
↓
PostgreSQL

## Installation

### Clone

git clone https://github.com/sabith-dev/SkillForge.git

### Backend

cd SkillForge

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

### Database

Create a PostgreSQL database named:

skillforge

Configure the environment variables in `.env`.

### Django

python manage.py migrate

python manage.py runserver

### Frontend

cd frontend

npm install

npm run dev