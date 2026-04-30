# ☕ Beige & Beans

![Beige & Beans Banner](https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2000&auto=format&fit=crop)

> **"At Beige & Beans, we believe that every cup of coffee tells a story of passion, precision, and craftsmanship."**

Beige & Beans is a premium, full-stack coffee shop application designed to provide a seamless and visually stunning experience for coffee enthusiasts. From curated bean selections to a smooth, interactive ordering process, this project showcases modern web technologies integrated with a robust backend.

---

## ✨ Features

- 🎨 **Premium UI/UX**: A modern, "glassmorphic" aesthetic with a sophisticated beige-toned palette.
- ⚡ **Dynamic Animations**: Smooth, scroll-triggered animations powered by **GSAP** and **ScrollTrigger**.
- 🛒 **Interactive Menu & Cart**: Browse coffee categories and manage your order via a sleek, responsive side drawer.
- 👤 **User Authentication**: Secure login and account management integrated with **Firebase**.
- 🛠️ **Full-Stack Persistence**: Real-time synchronization of menu items and cart data with a **Spring Boot** backend.
- 📱 **Fully Responsive**: Optimized for every device, from mobile phones to high-resolution desktops.

---

## 🚀 Tech Stack

### Frontend
- **React 19**: Modern UI component architecture.
- **Vite**: Ultra-fast build tool and development server.
- **GSAP**: High-performance animations and visual effects.
- **Tailwind CSS**: Utility-first styling for a polished look.
- **Firebase**: Reliable authentication and state management.

### Backend
- **Java 21**: Leveraging the latest features of the Java language.
- **Spring Boot 3.4**: Industry-standard framework for building microservices.
- **MongoDB**: Flexible NoSQL database for managing the coffee menu and user carts.
- **Maven**: Robust project management and dependency handling.

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v18+)
- **Java JDK 21**
- **MongoDB** (Running locally or via Atlas)
- **Maven**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rathimax/Coffee-Shop-Website.git
   cd Beige-and-Beans
   ```

2. **Setup the Backend:**
   ```bash
   cd backend
   # Configure your .env or application.properties with MongoDB URI
   ./mvnw spring-boot:run
   ```

3. **Setup the Frontend:**
   ```bash
   cd frontend
   npm install
   # Configure your .env with Firebase credentials
   npm run dev
   ```

---

## 📁 Project Structure

```text
Beige and Beans/
├── frontend/             # React + Vite application
│   ├── src/
│   │   ├── components/   # Modular UI components
│   │   ├── assets/       # Visual assets
│   │   └── services/     # API and Firebase integration
├── backend/              # Spring Boot application
│   ├── src/main/java/    # Java source code
│   └── pom.xml           # Maven configuration
└── README.md             # Project documentation
```

---

## 👨‍💻 Author

**Abhay Raj Rathi**  
*Passionate Developer & Coffee Enthusiast*

---

## 📜 License

This project is licensed under the MIT License.

---

<p align="center">
  Made with ❤️ and plenty of ☕
</p>
