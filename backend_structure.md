# Backend Structure Approach 🏗️

The backend of **Exam Battle** is built with **Node.js** and **Express**, following a **Modular Architecture**. This approach ensures that each feature (module) is self-contained, making the codebase easier to scale, test, and maintain.

## 📂 Folder Overview

```tree
src/
├── app/
│   ├── modules/           # Feature-based business logic
│   │   ├── auth/          # Authentication & Authorization
│   │   ├── users/         # User Management
│   │   ├── battle/        # Real-time Battle logic
│   │   └── question/      # Question & Paper management
│   ├── middleware/        # Global & Custom Middlewares (auth, error-handler)
│   ├── config/            # Environment and App configurations
│   ├── utils/             # Helper functions & Utilities
│   └── interface/         # Global Types & Interfaces
├── routes.ts              # Main Route aggregator
├── server.ts              # Entry point for the server
└── app.ts                 # Express App configuration
```

## 🧩 Anatomy of a Module

Each module under `src/app/modules` follows a standardized structure:

1.  **`module.interface.ts`**: Defines the TypeScript types and interfaces for the module.
2.  **`module.model.ts`**: Mongoose schema and model definition.
3.  **`module.service.ts`**: Contains business logic and database interactions.
4.  **`module.controller.ts`**: Handles incoming HTTP requests and sends responses.
5.  **`module.route.ts`**: Defines the API endpoints for the module.
6.  **`module.validation.ts`**: Zod schemas for request validation.

## 🚀 Key Philosophies

- **Separation of Concerns**: Logic is separated into Controllers, Services, and Models.
- **Dry (Don't Repeat Yourself)**: Common utilities and middlewares are centralized in `src/app/utils` and `src/app/middleware`.
- **Validation-First**: Every request is validated using **Zod** before reaching the controller.
- **Type Safety**: TypeScript is used throughout the backend to ensure data integrity and catch errors early.
