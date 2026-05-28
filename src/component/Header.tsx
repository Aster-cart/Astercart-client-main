import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => (
  <header className="flex  md:flex-row gap-5 w-full font-rob sticky top-0 z-10 justify-between p-4 bg-white shadow">
    <div className="w-full md:w-[20%] flex justify-between items-center">
      <h1 className="text-pry font-bold text-xl md:text-2xl">Astercart</h1>
    </div>
    <nav className="flex md:flex-row gap-5 md:gap-10 justify-between text-sm md:text-sm">
      <a href="#" className="hover:underline hover:text-pry">About</a>
      <a href="#" className="hover:underline hover:text-pry">Contact</a>
      <a href="#" className="hover:underline hover:text-pry">FAQs</a>
      <Link className="hover:text-pry" to="/signup">Signup</Link>
    </nav>
  </header>
);

export default Header;
