# Inventory Management Application

This project is a **Next.js-based Inventory Management App** that allows users to efficiently manage inventory, including batch uploading of items, sorting, filtering, and Firebase authentication.

## Features

- **Batch Item Upload**: Users can bulk add or update items through CSV/Excel file uploads, streamlining the inventory management process for businesses.
- **Low Stock Alerts**: Automatically highlights items with stock below a specified threshold.
- **Inventory Sorting**: Users can sort inventory by name, quantity, or date added.
- **Firebase Integration**: Secure user authentication and real-time database storage using Firebase.
- **Active/Inactive Status**: Users can filter items based on their status, ensuring only relevant products are displayed.

## Technologies Used

- **Next.js 13+**
- **React**
- **Firebase (Auth & Firestore)**
- **Material-UI (MUI)**
- **CSV Parsing**: Using `PapaParse` for CSV handling and `xlsx` for Excel file processing.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/inventory-management-app.git
   cd inventory-management-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Firebase**:
   - Add your Firebase credentials in a `.env.local` file.

4. **Run the app**:
   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

## Future Improvements

- **Pagination for large inventories**.
- **Analytics dashboard** to track stock performance.
- **Role-based access control** for multi-user management.

