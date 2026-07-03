import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BuyerForm from './pages/BuyerForm';
import SellerForm from './pages/SellerForm';
import Payment from './pages/Payment';
import MyPosts from './pages/MyPosts';
import PostDetail from './pages/PostDetail';
import Search from './pages/Search';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="buyer" element={<BuyerForm />} />
          <Route path="seller" element={<SellerForm />} />
          <Route path="payment/:postId" element={<Payment />} />
          <Route path="my-posts" element={<MyPosts />} />
          <Route path="post/:id" element={<PostDetail />} />
          <Route path="search" element={<Search />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
