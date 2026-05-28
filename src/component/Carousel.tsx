import { useState, useEffect, ReactNode } from "react";

interface CarouselProps {
  children: ReactNode[]; 
  autoslide?: boolean; 
  autoslideinterval?: number; 
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  autoslide = false,
  autoslideinterval = 5000,
}) => {

  const [currentSlide, setCurrentSlide] = useState(0);


  const nextSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === children.length - 1 ? 0 : prevSlide + 1
    ); 
  };

 
  useEffect(() => {
    if (autoslide) {
      const interval = setInterval(() => {
        nextSlide(); 
      }, autoslideinterval);
      return () => clearInterval(interval); 
    }
  }, [autoslide, autoslideinterval]); 

  return (
    <div className="relative font-inter w-full h-full overflow-hidden">
      {/* Container for all the slides, transforms based on the current slide */}
      <div
        className="flex transition-transform ease-in-out duration-500"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {/* Map over children (slides) and render each slide */}
        {children.map((slide, index) => (
          <div key={index} className="min-w-full h-full">
            {slide}
          </div>
        ))}
      </div>

      {/* Optional navigation dots for manual slide navigation */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center">
        {children.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 mx-1 rounded-full ${
              currentSlide === index ? "bg-white" : "bg-gray-400"
            }`} // Highlight current slide dot
            onClick={() => setCurrentSlide(index)} // Clicking a dot moves to the corresponding slide
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
