import { BrowserRouter, Route, Routes } from "react-router";

import HomeLayout from "./layouts/HomeLayout";
import PageLayout from "./layouts/PageLayout";
import Home from "./pages/Home";
import Knowledge from "./pages/Knowledge";
import CourseDetail from "./pages/CourseDetail";
import Albums from "./pages/Albums";
import AlbumDetail from "./pages/AlbumDetail";
import Portfolio from "./pages/Portfolio";
import ArticleList from "./pages/ArticleList";
import PostDetail from "./pages/PostDetail";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomeLayout />}>
          <Route index element={<Home />} />
          <Route path="personalizations/:accessCode" element={<Home />} />
        </Route>

        <Route element={<PageLayout />}>
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="knowledge/:id" element={<CourseDetail />} />
          <Route path="albums" element={<Albums />} />
          <Route path="albums/:id" element={<AlbumDetail />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="posts" element={<ArticleList />} />
          <Route path="posts/:id" element={<PostDetail />} />
          <Route path="search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}
