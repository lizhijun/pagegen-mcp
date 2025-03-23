import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WebpagePreview from './pages/WebpagePreview';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/preview" element={<WebpagePreview />} />
    </Routes>
  );
}

export default App; 