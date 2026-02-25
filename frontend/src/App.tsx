import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeAuth from "./pages/HomeAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeAuth />} />
      </Routes>
    </BrowserRouter>
  );
}
