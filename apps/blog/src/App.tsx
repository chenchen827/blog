import { BrowserRouter, Route, Routes } from 'react-router'

import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="posts/:id" element={<PostDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
