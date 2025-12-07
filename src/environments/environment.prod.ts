export const environment = {
  production: true,
  apiUrl: 'https://admin-dashboard-b14w.onrender.com/api',
  socketUrl: 'https://admin-dashboard-b14w.onrender.com',
  socketPath: '/socket.io',
};

// Deployed URLs:
// Frontend (Vercel): https://admin-dashboard-d924.vercel.app
// Backend (Render):  https://admin-dashboard-b14w.onrender.com
// CORS: Ensure backend FRONTEND_URL env includes the Vercel URL
