import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
// import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import Form from "./pages/Form";
import ReportPage2 from "./pages/RegisterPage2";

function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
      <Route path="/" element={<Form />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register2" element={<ReportPage2 />} />
          {/* <Route path="/login" element={<Form />} /> */}
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
