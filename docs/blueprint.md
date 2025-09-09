# **App Name**: QGO Cargo POD

## Core Features:

- Firebase Authentication: Integrate with existing Firebase Auth (Email/Password and Google if enabled) to authenticate users and manage access based on roles.
- Role-Based Access Control: Implement a role-based access control system ('admin', 'ops', 'driver') to restrict access to features and data based on the user's role.
- POD Creation and Assignment: Enable Admin/Ops users to create POD records with comprehensive details (job number, client, addresses, etc.), assign them to drivers, and generate client tracking links and QR codes.
- Driver Job Management: Allow drivers to view assigned PODs, grouped by status and date, with details including job information, delivery requirements (OTP, photo, signature), and navigation functionality.
- Delivery Confirmation: Enable drivers to mark deliveries as 'delivered' or 'failed', capturing customer signature, photos, OTP (if required), geotag (if required), and notes. Store delivery information in the 'deliveries' collection.
- POD Status Tool: Provide a client tracking link (generated with public_token) where the LLM determines, for security reasons, if and when the client will see near real time status. It includes delivery status, timestamps, and geotag map link.
- PDF Export and Sharing: Enable Admin/Ops users to export POD records as branded PDF receipts with all relevant details (logo, job info, signatures, photos, geotag) and share them via WhatsApp.

## Style Guidelines:

- Primary color: Indigo (#6366F1) for a professional and trustworthy feel.
- Background color: Light gray (#F9FAFB), almost white, providing a clean backdrop and focusing attention on key elements.
- Accent color: Slate Blue (#7DD3FC) for interactive elements and highlights, differentiating it from the primary and improving usability.
- Body and headline font: 'PT Sans', a humanist sans-serif, for its modern look and a touch of warmth and readability in various sections.
- Use Heroicons for navigation and actions, ensuring consistency and clarity across the application.
- Mobile-first, touch-optimized layout with a bottom navigation bar for easy access to key features (Jobs, Create POD, Scan, Search, Analytics).
- Use subtle transitions and animations to enhance user experience, such as loading indicators, feedback on button taps, and smooth scrolling.