# 🍽️ Food-back Hub

Food-back Hub is a MERN-based platform that improves communication between students and the college mess.  
Students can view weekly menus, submit feedback with ratings & photos, and track status.  
Admins can update menus, manage complaints, and view analytics.

---

## 🚀 Features

### 🎓 Student Features
- View **today’s menu** & **weekly menu**
- Submit feedback with:
  - ⭐ Rating
  - ✍️ Complaint text
  - 📸 Optional photo
- Track feedback status (Pending → Viewed → Resolved)
- Like/Dislike meals (optional)

### 👨‍💼 Admin Features
- Manage & update full weekly menu
- View all student feedback
- Update feedback statuses
- Highlight special dishes
- Basic analytics (optional)

---

## 🛠️ Tech Stack (MERN)

### Frontend
- React.js (Vite)
- TailwindCSS
- Axios
- Zustand / Context API (optional)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (file upload)
- Cloudinary (image hosting)

---

## 📁 Folder Structure
project/
│── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       └── utils/
│
│── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js

---

## 🧬 API Endpoints

### 🔐 Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register student/admin |
| POST | `/api/auth/login` | Login & get JWT token |

---

### 🍽️ Menu Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu/week` | Get weekly menu |
| GET | `/api/menu/today` | Get today's menu |
| POST | `/api/menu/` | Add or update menu (admin only) |

---

### ⭐ Feedback Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/feedback/` | Submit feedback |
| GET | `/api/feedback/my` | Get student's feedback history |
| GET | `/api/feedback/` | Admin → get all feedback |
| PATCH | `/api/feedback/:id/status` | Admin → update feedback status |

---

### 🖼️ Upload Routes (Optional)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/photo` | Upload image to Cloudinary |

---

## 🔐 Authentication (JWT)

All private routes require:

---

## 🗂️ Environment Variables

Create `.env` inside `/server`:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

---

## 🏃‍♂️ Running the Project

### Backend
```bash
cd server
npm install
npm start
```

### Frontend
cd client
npm install
npm run dev

Backend runs at:
http://localhost:5000

Frontend runs at:
http://localhost:5173
