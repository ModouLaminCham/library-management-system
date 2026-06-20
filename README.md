 # Library Management System

A full-stack library management system built with Spring Boot (backend), React (frontend), and MySQL (database), containerized with Docker.

## Features

- **Book Management**: Add, update, delete, and search books
- **Member Management**: Manage library members
- **Borrowing System**: Track book borrowing and returns with due dates
- **Fine Calculation**: Automatic fine calculation for overdue books
- **Responsive UI**: Modern React interface with Material-UI

## Tech Stack

- **Backend**: Spring Boot 3.2.0, Java 17, Spring Data JPA, Hibernate
- **Frontend**: React 18, Material-UI, Axios
- **Database**: MySQL 8.0
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker and Docker Compose installed on your system

## Quick Start

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **(Recommended) Configure environment variables**:
   ```bash
   cp .env.example .env
   # then edit .env — at minimum change JWT_SECRET and ADMIN_PASSWORD
   # before deploying anywhere other than your own machine.
   ```
   If you skip this step, sensible local-dev defaults are used automatically.

3. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8080
   - MySQL Database: localhost:3306

5. **Log in**: a default admin account is seeded on first run —
   `username=admin`, `password=admin123` (or whatever you set
   `ADMIN_USERNAME` / `ADMIN_PASSWORD` to). **Change this password** if this
   is deployed anywhere reachable by others.

### Deploying somewhere other than localhost

If the frontend and backend won't both be reached at `localhost` (e.g. a real
server, a cloud host, or separate domains for frontend/backend), you must set
`VITE_API_BASE_URL` to the public URL of the backend API before building the
frontend image, and `ALLOWED_ORIGINS` to the public URL of the frontend so
CORS allows it. These are baked into the frontend's static build at build
time, so changing them requires rebuilding the `react` image. See
`.env.example` for all available variables.

## API Endpoints

Endpoints marked **(auth)** require a `Bearer` JWT from `/api/auth/signin` in
the `Authorization` header. Endpoints marked **(admin)** additionally require
the authenticated user to have the `ROLE_ADMIN` role.

### Auth
- `POST /api/auth/signin` - Log in, returns a JWT
- `POST /api/auth/signup` - Register a new account (defaults to `ROLE_USER`; pass `"role": ["admin"]` for an admin account)

### Books
- `GET /api/books` - Get all books
- `GET /api/books/available` - Get available books
- `GET /api/books/{id}` - Get book by ID
- `GET /api/books/search?title={title}` - Search books by title
- `POST /api/books` **(auth)** - Add new book
- `PUT /api/books/{id}` **(auth)** - Update book
- `DELETE /api/books/{id}` **(admin)** - Delete book

### Members **(admin only)**
- `GET /api/members` - Get all members
- `GET /api/members/active` - Get active members
- `GET /api/members/{id}` - Get member by ID
- `POST /api/members` - Add new member
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member

### Borrowing **(admin only)**
- `GET /api/borrowing/active` - Get active borrowing records
- `POST /api/borrowing/borrow` - Borrow a book
- `POST /api/borrowing/return/{id}` - Return a book
- `GET /api/borrowing/overdue` - Get overdue books

## Development Setup

### Backend (Spring Boot)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run with Maven:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) configure the API URL for local dev:
   ```bash
   cp .env.example .env
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Database (MySQL)

The MySQL database is automatically set up with Docker Compose. For local development, you can connect to it using:

- Host: localhost
- Port: 3306
- Database: library_db
- Username: root
- Password: password (or `MYSQL_ROOT_PASSWORD` if you set it in `.env`)

## Project Structure

```
library-management-system/
├── backend/                 # Spring Boot application
│   ├── src/
│   │   ├── main/java/com/example/library/
│   │   │   ├── controller/  # REST controllers
│   │   │   ├── model/       # JPA entities
│   │   │   ├── repository/  # Data repositories
│   │   │   ├── security/    # JWT auth, Spring Security config
│   │   │   ├── exception/   # Global error response handling
│   │   │   └── service/     # Business logic
│   │   └── resources/
│   │       └── application.properties
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   ├── Dockerfile
│   └── package.json
├── docker/
│   └── mysql/
│       └── init.sql        # Database initialization (creates DB only —
│                            # sample data is seeded by DataSeeder.java)
├── docker-compose.yml       # Docker services
├── .env.example             # Configuration template — copy to .env
└── README.md
```

## Database Schema

### Books Table
- id (Primary Key)
- title
- author
- isbn (Unique)
- genre
- publication_year
- description
- available (Boolean)
- created_at

### Members Table
- id (Primary Key)
- name
- email (Unique)
- phone_number
- address
- active (Boolean)
- membership_date

### Borrowing Records Table
- id (Primary Key)
- book_id (Foreign Key)
- member_id (Foreign Key)
- borrow_date
- return_date
- due_date
- returned (Boolean)
- fine_amount

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.