import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pending from './pages/Pending';
import AllPosts from './pages/AllPosts';
import PostDetail from './pages/PostDetail';
import EditPost from './pages/EditPost';
import Channels from './pages/Channels';
import Settings from './pages/Settings';
import Users from './pages/Users';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="pending" element={<Pending />} />
              <Route path="posts" element={<AllPosts />} />
              <Route path="posts/:id" element={<PostDetail />} />
              <Route path="posts/:id/edit" element={<EditPost />} />
              <Route path="channels" element={<Channels />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
