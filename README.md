
# [**Inventory Management App**](https://inventory-management-six-drab.vercel.app)

<img width="1186" alt="Screenshot 2024-09-06 at 16 17 48" src="https://github.com/user-attachments/assets/d7ecdd2b-0113-46a0-ad43-ccc9da037197">

This project is a **Next.js-based Inventory Management App** that enables users to efficiently manage inventory, including batch uploading of items, sorting, filtering, and Firebase authentication.

## Features

- **Batch Item Upload**: Bulk add or update items through CSV/Excel file uploads, simplifying inventory management.
- **Low Stock Alerts**: Highlights items with stock below a specific threshold.
- **Inventory Sorting**: Sort by name, quantity, or date added for easy organization.
- **Firebase Integration**: Secure user authentication and real-time database storage using Firebase.
- **Active/Inactive Status**: Filter inventory items based on their status.

## Technologies Used

- **Next.js 13+**
- **React**
- **Firebase (Auth & Firestore)**
- **Material-UI (MUI)**
- **CSV/Excel Parsing**: With `PapaParse` and `xlsx` libraries.

## Live Demo

Check out the live version of the app:  
[**Inventory Management App**](https://inventory-management-six-drab.vercel.app)

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
