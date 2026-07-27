import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => (
  <header className="flex md:flex-row gap-5 w-full font-inter sticky top-0 z-10 justify-between p-4 bg-white shadow-sm border-b border-border">
    <div className="w-full md:w-[20%] flex justify-between items-center">
      <h1 className="text-pry font-bold text-xl md:text-2xl font-space">Astercart</h1>
    </div>
    <nav className="flex md:flex-row gap-5 md:gap-10 justify-between text-sm md:text-sm items-center">
      <a href="#" className="text-body hover:text-pry transition-colors font-medium">About</a>
      <a href="#" className="text-body hover:text-pry transition-colors font-medium">Contact</a>
      <a href="#" className="text-body hover:text-pry transition-colors font-medium">FAQs</a>
      <Link className="bg-pry text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors font-medium" to="/signup">Signup</Link>
    </nav>
  </header>
);

export default Header;
