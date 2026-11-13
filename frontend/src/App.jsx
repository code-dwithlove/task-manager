import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/projects/:id"
                 element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;