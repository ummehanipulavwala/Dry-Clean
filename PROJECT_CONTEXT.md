# Dry Clean Ecommerce Project Context

This document provides a technical overview of the Dry Clean ecommerce platform, outlining its core architecture, technology stack, and key components.

## Project Overview
A specialized ecommerce platform designed for dry cleaning services, facilitating interactions between customers, shop owners, and delivery personnel.

## Technology Stack
- **Backend Framework**: Express.js (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.io (Chat, status updates)
- **Authentication**: JWT (JSON Web Tokens), Bcryptjs
- **File Uploads**: Multer
- **Notifications/SMS**: Twilio
- **Environment Management**: dotenv

## Core Components & Directory Structure
- `controllers/`: Business logic for API endpoints.
- `models/`: Mongoose schemas for data entities.
- `routes/`: API route definitions.
- `middleware/`: Authentication and authorization logic.
- `utils/`: Helper functions and configurations.
- `uploads/`: Storage for uploaded files (e.g., service images).
- `server.js`: Application entry point.
- `socket.js`: Socket.io configuration and event handlers.

## Data Models (Database Schema)
1. **User**: Manages customer and administrator profiles.
2. **Shopdetails**: Stores shop-specific information, locations, and settings.
3. **servicemodel**: Defines dry cleaning and laundry services offered by shops.
4. **Order**: Tracks service requests, statuses, and pricing.
5. **Payment**: Manages transaction records and payment statuses.
6. **DeliveryPerson**: Profiles for agents responsible for pickup and delivery.
7. **Chat & Message**: Facilitates real-time communication between participants.
8. **Feedback**: Stores ratings and reviews for services.
9. **advertisementModel**: Handles promotional content for shops.
10. **ShopOrderAction**: Logs specific actions taken on orders for audit and tracking.

## Key API Routes
- `/api/auth`: Login, registration, and password management.
- `/api/users`: User profile management.
- `/api/shopdetails`: Shop management and discovery.
- `/api/services`: Service catalog management.
- `/api/orders`: Order placement, tracking, and fulfillment.
- `/api/payments`: Processing and verifying payments.
- `/api/delivery`: Delivery agent assignments and routing.
- `/api/chat`: Messaging and communication.
- `/api/feedback`: Review and rating submissions.
- `/api/advertisements`: Managing and displaying ads.

## Development Setup
1. **Environment**: Create a `.env` file with `PORT`, `MONGO_URI`, `JWT_SECRET`, and `TWILIO` credentials.
2. **Install Dependencies**: `npm install`
3. **Run Development Server**: `npm run dev` (Uses nodemon)
4. **Run Production Server**: `npm start`
