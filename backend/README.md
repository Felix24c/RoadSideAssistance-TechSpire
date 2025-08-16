
## QuickAssist Django Backend Setup & Usage

### 1. Clone the repository
```powershell
git clone https://github.com/Felix24c/RoadSideAssistance-TechSpire.git
cd backend
```

### 2. Create a `.env` file
Create a file named `.env` in the `backend` folder with:
```
DJANGO_SECRET_KEY=your-very-secret-key
```
You can use any random string for the secret key. Each developer should generate their own.

### 3. Install dependencies
```powershell
pip install -r requirements.txt
```
This will install Django, Django REST Framework, drf-yasg, and python-dotenv for .env support.

### 4. Run migrations (if needed)
```powershell
python manage.py migrate
```

### 5. Start the development server
```powershell
python manage.py runserver
```

### 6. Access Swagger/OpenAPI docs
Visit:
```
http://127.0.0.1:8000/api/swagger/
```
```
DJANGO_SECRET_KEY=
---
If you see a `RuntimeError: DJANGO_SECRET_KEY environment variable not set`, make sure your `.env` file exists and contains the key as shown above.


