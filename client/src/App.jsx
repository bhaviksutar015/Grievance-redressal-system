import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Awareness from "./pages/Awareness";
import HowItWorks from "./pages/HowItWorks";
import Track from "./pages/Track";
import Faqs from "./pages/Faqs";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/citizen/Dashboard";
import SubmitGrievance from "./pages/citizen/SubmitGrievance";
import MyGrievances from "./pages/citizen/MyGrievances";
import GrievanceDetail from "./pages/citizen/GrievanceDetail";
import Notifications from "./pages/citizen/Notifications";
import Profile from "./pages/citizen/Profile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminGrievances from "./pages/admin/AdminGrievances";
import AdminGrievanceDetail from "./pages/admin/AdminGrievanceDetail";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminAwareness from "./pages/admin/AdminAwareness";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="awareness" element={<Awareness />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="track" element={<Track />} />
          <Route path="faqs" element={<Faqs />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Citizen portal (Neon Auth session required) */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="submit" element={<SubmitGrievance />} />
          <Route path="my-grievances" element={<MyGrievances />} />
          <Route path="my-grievances/:id" element={<GrievanceDetail />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin console (ADMIN role required; server enforces too) */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <DashboardLayout admin />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="grievances" element={<AdminGrievances />} />
          <Route path="grievances/:id" element={<AdminGrievanceDetail />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="awareness" element={<AdminAwareness />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
