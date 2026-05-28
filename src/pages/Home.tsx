import React from "react";
import { FaTruck, FaStore, FaMapMarkerAlt, FaWallet, FaCheckCircle, FaTags, FaShoppingCart } from 'react-icons/fa';
import Carousel from "../component/Carousel";
import Footer from "../component/Footer";
import Header from "../component/Header";
import {grocery1, grocery2, grocery3, grocery4} from "../assets/res";
import { products, testimonials} from "../data.ts"


const features = [
  {
    id: 1,
    title: "Fast Delivery",
    quote: "Groceries delivered in under 60 minutes.", 
    icon: <FaTruck className="text-3xl mb-2" />,
  },

  {
    id: 2,
    title: "Affordable Prices",
    quote: "Enjoy competitive prices on all your grocery essentials.",
    icon: <FaTags className="text-3xl mb-2" />,
  },
  {
    id: 3,
    title: "Add Items to Cart",
    quote: "Easily browse and add items to your cart.",
    icon: <FaShoppingCart className="text-3xl mb-2" />,
  },
  {
    id: 4,
    title: "Real-time Tracking",
    quote: "Follow your delivery from store to doorstep.",
    icon: <FaMapMarkerAlt className="text-3xl mb-2" />,
  },
  {
    id: 5,
    title: "Easy Payments",
    quote: "Seamless checkout with multiple payment options.",
    icon: <FaWallet className="text-3xl mb-2" />,
  },
  {
    id: 6,
    title: "Quality Products",
    quote: "We source our products from trusted suppliers across Nigeria.",
    icon: <FaCheckCircle className="text-3xl mb-2" />, 
  },
  {
    id: 7,
    title: "Local Supermarkets",
    quote: "Support your community with every order.",
    icon: <FaStore className="text-3xl mb-2" />,
  },
];

const Products: React.FC = () => (

  <div className="font-rob">
   <Header/>
   <section className="w-[95%] mb-10 flex flex-col md:flex-row mx-auto gap-10 p-5 text-center max-h-screen items-center h-auto">
  <div className="w-full md:w-1/2">
    <h2 className="text-lg text-pry font-semibold mb-2">Fresh Groceries, Fast Delivery</h2>
    <p className="text-base font-rob mb-2">Shop from local supermarkets and have groceries delivered to your doorstep in minutes.</p>
    <p className="mb-8 text-sm">
      Astercart is revolutionizing the way you shop for groceries. With both
      online and offline options, we provide a seamless shopping experience
      that meets your needs. Browse through a wide variety of fresh products
      and essentials, all sourced from local supermarkets.
    </p>
    <h2 className="text-lg font-bold mb-2">Convenience at Your Fingertips</h2>
    <p className="text-gray-600 mb-3 max-w-md mx-auto">Download the app and start ordering now!</p>
    <div className="space-x-4">
      <a href="#" className="inline-block bg-pry text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-900">Apple Store</a>
      <a href="#" className="inline-block bg-pry text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-900">Google Play</a>
    </div>
  </div>
  <div className="flex w-full md:flex sm:flex-wrap md:w-1/2 max-w-[40rem] p-5 rounded-3xl flex-wrap m-auto justify-center items-center gap-5">
  <img className="hidden sm:block w-full sm:w-[40%] aspect-square rounded-ss-full" src={grocery3} alt="" />
  <img className="hidden sm:block w-full sm:w-[40%] aspect-square rounded-se-full" src={grocery1} alt="" />
  <img className="hidden sm:block w-full sm:w-[40%] aspect-square rounded-es-full" src={grocery2} alt="" />
  <img className="hidden sm:block w-full sm:w-[40%] aspect-square rounded-ee-full" src={grocery4} alt="" />
</div>

</section>

<section className="bg-[#FF6B00] my-10 w-[90%] md:w-[85%] mx-auto rounded-3xl p-5 text-white text-center">
  <div className="grid grid-cols-1 pt-3 gap-3 max-w-5xl mx-auto">
    <h3 className="text-lg md:text-xl font-bold text-center">
      Why Shop With Us?
    </h3>
    <Carousel autoslide={true} autoslideinterval={3000}>
      {features.map((feature) => (
        <div
          key={feature.id}
          className="flex flex-col items-center p-6 rounded-lg transition-transform duration-300 transform hover:scale-105"
        >
          <div className="mb-4">{feature.icon}</div>
          <p className="text-lg pb-5 font-bold italic">
            "{feature.title}"
          </p>
          <p className="font-semibold pb-5 text-sm md:text-base">
            {feature.quote}
          </p>
        </div>
      ))}
    </Carousel>
  </div>

  <button className="bg-white text-[#FF6B00] shadow-2xl py-2 px-4 mt-4 rounded-lg font-bold hover:bg-gray-900">
    Shop Now
  </button>
</section>



<section id="products" className="p-5 my-10">
  <h3 className="text-2xl font-bold text-center mb-4">
    Popular Products
  </h3>
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
    {products.map((product) => (
      <div
        key={product.id}
        className="relative bg-white p-4 rounded-lg"
      >
        {/* Image of the product */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-cover rounded-lg mb-2 shadow-md transition-transform duration-300 transform hover:scale-125"
        />

        <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end items-center text-center bg-black bg-opacity-50 rounded-lg p-2">
          <h4 className="text-base font-semibold text-white">{product.name}</h4>
          <button className="mt-2 px-2 py-2 shadow-2xl bg-pry text-white rounded-lg hover:bg-gray-900">
            Add to Cart
          </button>
        </div>
      </div>
    ))}
  </div>
</section>


<section className="my-10 px-4 w-[85%] mx-auto">
  <h2 className="text-2xl font-bold text-center mb-5">How It Works</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
    <div className="bg-white py-5 mx-5 rounded-lg shadow">
      <div className="flex items-center justify-center mb-4">
        <FaStore className="text-2xl text-pry mr-2" />
        <h3 className="text-lg font-bold">Browse Supermarkets</h3>
      </div>
      <p>Choose from a list of local stores.</p>
    </div>

    <div className="bg-white py-5 mx-5 rounded-lg shadow">
      <div className="flex items-center justify-center mb-4">
        <FaShoppingCart className="text-2xl text-pry mr-2" />
        <h3 className="text-lg font-bold">Add Items to Cart</h3>
      </div>
      <p>Easily browse and add items to your cart.</p>
    </div>

    <div className="bg-white py-5 mx-5 rounded-lg shadow">
      <div className="flex items-center justify-center mb-4">
        <FaMapMarkerAlt className="text-2xl text-pry mr-2" />
        <h3 className="text-lg font-bold">Track Your Order</h3>
      </div>
      <p>Live updates on your delivery status.</p>
    </div>
  </div>
</section>


<section className="py-5 px-4 w-[85%] mx-auto mb-5 text-center">
  <h2 className="text-2xl font-bold text-gray-800 mb-5">What Our Users Say</h2>
  <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
    <Carousel autoslide={true} autoslideinterval={5000}>
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="flex flex-col items-center"
        >
          <img
            src={testimonial.image}
            alt={`Customer ${testimonial.name}`}
            className="w-16 h-16 object-cover rounded-full mb-4" // Customer image
          />
          <p className="font-semibold text-center">
            "{testimonial.quote}"
          </p> {/* Customer quote */}
          <p className="text-base italic pb-10 text-gray-600">
            {testimonial.name}
          </p> {/* Customer name and location */}
        </div>
      ))}
    </Carousel>
  </div>
</section>


  {/* <!-- Join the Network -->
  <section className="bg-[#FF6B00] w-[85%] shadow-2xl mb-5 shadow-slate-600 mx-auto rounded-3xl p-5 text-white text-center">
    <div className=" shadow-xl p-5">
  <h2 className="text-2xl font-bold mb-3">Join the Astercart Network</h2>
    <p className="max-w-md mx-auto mb-8">Partner with us as a supermarket or join as a rider for exciting opportunities.</p>
    <div className="space-x-4">
      <a href="#" className="inline-block bg-white text-orange-500 shadow-2xl px-4 py-2 rounded-lg font-semibold hover:bg-gray-900">Partner with Us</a>
      <a href="#" className="inline-block bg-white text-orange-500 shadow-2xl px-4 py-2 rounded-lg font-semibold hover:bg-gray-900">Join as a Rider</a>
    </div>
    </div>
  </section>

  <footer className="bg-pry text-white p-6 text-center">
  <div className="container mx-auto">
    <p className="text-lg font-semibold mb-2">
      © 2024 Aster-Cart Nigeria. All rights reserved.
    </p>
    <p className="mb-4 text-sm">
      Follow us on social media for the latest updates!
    </p>
    <div className="flex justify-center space-x-6 mb-4">
      <a href="#" className="hover:underline transition duration-300 ease-in-out hover:text-orange-400">Home</a>
      <a href="#" className="hover:underline transition duration-300 ease-in-out hover:text-orange-400">About</a>
      <a href="#" className="hover:underline transition duration-300 ease-in-out hover:text-orange-400">Contact</a>
      <a href="#" className="hover:underline transition duration-300 ease-in-out hover:text-orange-400">FAQs</a>
    </div>
  </div>
</footer> */}
 {/* <!-- Join the Network --> */}
<section className=" bg-orange text-white py-16 px-4 text-center">
  <h2 className="text-3xl font-bold mb-6">Join the Astercart Network</h2>
  <p className="max-w-md mx-auto mb-8">
    Partner with us as a supermarket or join as a rider for exciting opportunities.
  </p>
  <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
    <a href="#" className="inline-block bg-white text-orange px-6 py-3 rounded-lg font-semibold hover:bg-gray-900">
      Partner with Us
    </a>
    <a href="#" className="inline-block bg-white text-orange px-6 py-3 rounded-lg font-semibold hover:bg-gray-900">
      Join as a Rider
    </a>
  </div>
</section>

  {/* <!-- Footer --> */}
 <Footer/>

  </div>
);

export default Products;
