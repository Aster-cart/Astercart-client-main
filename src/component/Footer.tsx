import React from 'react';
import { Link } from 'react-router-dom'; 

const Footer: React.FC = () => (
  <footer className="bg-gray-800 font-rob text-white py-8 text-center">
    <div className="flex flex-col md:flex-row justify-center items-center space-x-0 md:space-x-6 mb-4">
      <Link to="/" className="hover:underline mb-2 md:mb-0">Home</Link>
      <Link to="/" className="hover:underline mb-2 md:mb-0">About</Link>
      <a href="#" className="hover:underline mb-2 md:mb-0">Contact</a>
      <a href="#" className="hover:underline mb-2 md:mb-0">FAQs</a>
    </div>
    <p className="text-gray-400">© 2024 Astercart. All rights reserved.</p>
  </footer>
);

export default Footer
