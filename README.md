# FitTrack API: Precision Nutrition Backend

## 📝 Overview & PurposeThe **FitTrack API** is a high-performance, RESTful service designed to manage user authentication, nutritional data, and fitness goal tracking. Built with a focus on **data integrity, speed, and scalability**, the API provides the reliable backbone for the FitTrack client application.

### Architectural Highlights\*

- **Type Safety:** Uses TypeScript and Prisma for end-to-end data validation and schema integrity.
- **Decoupling:** Fully separated API layer ensures independent scaling from the frontend client.
- **Goal Management:** Implements advanced status logic (e.g., automatically setting the previous goal to `PAUSED` when a new one is set to `ACTIVE`).

---

## ⚙️ Technology StackThe project utilizes a robust and modern stack for maximum performance and maintainability:

| Category             | Technology            | Purpose                                                                      |
| -------------------- | --------------------- | ---------------------------------------------------------------------------- |
| **Backend**          | **Node.js (Express)** | High-speed, non-blocking server environment.                                 |
| **Language**         | **TypeScript**        | Type-safe development for robust, scalable code.                             |
| **Database**         | **PostgreSQL**        | Primary persistent data store for reliability.                               |
| **ORM**              | **Prisma**            | Type-safe querying, schema management, and migrations.                       |
| **Caching**          | **Redis**             | In-memory store for high-speed data retrieval (optimizing read performance). |
| **Containerization** | **Docker**            | Ensures consistent development, testing, and production environments.        |
| **Precision**        | **Decimal.js**        | Handling of precise nutritional arithmetic to avoid floating-point errors.   |

---

##💡 Caching Strategy (Redis)To ensure the API remains fast under heavy load, a sophisticated caching layer is implemented using Redis:

| Strategy         | Implementation                                                                                                                    | Purpose                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Cache-Aside**  | Implemented in the Service layer; checks Redis before hitting PostgreSQL for read operations (e.g., retrieving `FoodItem` lists). | Optimizes response time for read-heavy endpoints.             |
| **Invalidation** | Cache entries are immediately deleted or updated upon `POST`, `PUT`, or `DELETE` operations.                                      | Guarantees **data consistency** between Redis and PostgreSQL. |
| **Hot Data**     | Cached data includes frequently accessed lists (e.g., `FoodItem` catalog) and individual item details.                            | Reduces database load significantly.                          |

---

## 🐳 Getting Started (Local Development)This project relies on Docker for running required services (PostgreSQL and Redis).

### Prerequisites\* Node.js (LTS version)

- npm (or yarn)
- **Docker Desktop** (must be running)

### Installation & Run Steps1. **Clone the Repository:**

```bash
git clone https://github.com/elonavr/FitTrack-API.git
cd FitTrack-API

```

2. **Install Dependencies:**

```bash
npm install

```

3. **Start Services (Redis & DB):**
   If you are using a separate Docker container for Redis:

```bash
# Ensure Docker Desktop is running
docker start my-fittrack-redis
# OR: docker-compose up -d (if using a docker-compose file)

```

4. **Apply Migrations:**
   Set up the PostgreSQL database schema using Prisma:

```bash
npx prisma migrate dev --name init

```

5. **Run the Server:**

```bash
npm run start
# Server will start on http://localhost:5000

```

---

## 🎯 Key API Endpoints (Goals & Food Items)This is a selection of the core endpoints managed by the API:

| Category  | Endpoint                  | Method | Description                                                                   |
| --------- | ------------------------- | ------ | ----------------------------------------------------------------------------- |
| **Goals** | `/api/goals`              | `POST` | Creates a new goal plan.                                                      |
| **Goals** | `/api/goals/:id/activate` | `PUT`  | Sets a specific goal as `ACTIVE` (and sets all others to `PAUSED`). **(NEW)** |
| **Goals** | `/api/goals/:id/pause`    | `PUT`  | Sets a specific goal to `PAUSED`. **(NEW)**                                   |
| **Food**  | `/api/fooditem`           | `GET`  | Retrieves all food items (Cached).                                            |
| **Food**  | `/api/fooditem/:id`       | `GET`  | Retrieves detailed item info (Cached).                                        |
| **Food**  | `/api/fooditem`           | `POST` | Creates a new food item (Invalidates Cache).                                  |

# FitTrack-Client
