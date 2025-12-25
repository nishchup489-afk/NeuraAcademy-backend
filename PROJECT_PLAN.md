# NeuraAcademy 🎓🧠

NeuraAcademy is a full-stack AI-powered education platform built with **React (frontend)** and **Flask (backend)**, using **session-based authentication + OAuth**.  
The platform supports **Students, Teachers, Parents, and Admins**, each with role-specific dashboards and analytics.

The system is designed to be **content-first (docs-based learning)** with support for videos, exams, analytics, and AI-powered assistance.

---

### dont try to change database model , if must needed tell me 

## 🧱 Tech Stack

### Frontend
- React
- Axios (API communication)
- Session-based auth (cookies)
- TipTap (planned – rich text editor)
- Chart libraries (analytics)

### Backend
- Flask
- Flask-Login (session auth)
- OAuth (Google, github)
- SQLAlchemy
- Marshmallow
- PostgreSQL 
---

## 🔐 Authentication System

- Session-based authentication (no JWT)
- OAuth supported (Google login , github login)
- Role-based access control:
  - Student
  - Teacher
  - Parent
  - Admin

i completed auth system already, 
and there is no admin register , 
only admin login , 
and it will ask for 4 question 

admin_key = One_piece
admin_secret = 9296292178
Name_one_archeologist = Nico Robin

if answered correctly give access


---

## 👨‍🎓 Student Features

### Core Flow
1. Login / Register
2. Browse & select courses
3. Purchase course
4. Start learning
5. return role_id as id

### Learning Experience
- Text-based lessons (docs-style)
- Embedded YouTube video lectures
- Structured chapters & lessons
- can see course rating
- can rate course and add comments in lessons

### Exams & Analytics
- Attend exams (time-based)
- Auto evaluation
- Results & performance analytics
- Consistency rate tracking
- Learning progress graphs

### Social Features
- Add friends via role_id 
- Friends ranking (leaderboard)
- Messaging (lightweight) ( add one on one messaging with teacher and student with photo uploading , no calling just chat )
- AI assistant (Grok bot integration) ( do it later when i say)

---

## 👩‍🏫 Teacher Features

### Course Management
- Create courses 
- Add chapters & lessons
- Write docs (TipTap)
- Embed external youtube video (YouTube embed links)
- student review and rating
- Create exams:
  - Questions
  - Time limits
  - Correct answers

### Analytics
- Course sales analytics
- Number of enrolled students
- Student engagement metrics
- Exam performance insights
- Course ratings & reviews

### AI Assistance ( later )
- Grok AI for:
  - Content drafting
  - Question generation
  - Teaching insights

---

## 👨‍👩‍👧 Parent Features

> Parent access is **explicitly permitted by the student**
> for now just enter student id 
### Monitoring
- Student progress tracking
- Learning consistency
- Exam results
- Teacher feedback

### Social View
- Student’s friends ranking
- Peer comparison (limited & ethical)

### Discipline Feature (Experimental)
- “Online sandal” interaction and student sandal show
- Publicly visible sandal  signal

---

## 🛡️ Admin Features

- Full access to all roles
- View & manage users
- Handle reports & abuse
- Block users (except parents)
- Monitor system errors
- Manage updates & platform health
- Database maintenance tools
- can see errors 

---

## 🧠 Future Enhancements

- Mobile app
- Offline reading mode

---

## 🚧 Project Status

- ✅ Minimal authentication system completed , try not to touch it 
- ✅ Backend essentials set up for teacher , and profiles 
- 🚧 Landing page in progress
- 🚧 Course system under active development


## What you will do 

- complete all teacher , student , parent feature
- try less to touch models , if needed tell me , because it needs to migrate
- make the tipatap editor more rich 
- add tailwind css and gsap make it professional

---

## ⚠️ Disclaimer

NeuraAcademy is an experimental educational platform under active development.
Features and behavior may evolve rapidly.

---

## 📜 License

MIT License
