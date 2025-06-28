import {  useRef  } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Home = () => {
  const heroRef = useRef(null);

 

  

  return (
    <div className="bg-white text-black">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 bg-white">
        <div className="relative z-10 w-full max-w-2xl mx-auto text-center p-10">
          <h1 className="text-4xl md:text-4xl font-extrabold tracking-tight leading-tight mb-9 text-black font-sans" style={{fontFamily: 'Inter, Arial, sans-serif'}}>
            Revolutionising Testing with AI-Powered No-Code Simplicity
          </h1>
          <p className="text-lg md:text-xl font-normal text-gray-700 mb-10 leading-relaxed font-sans" style={{fontFamily: 'Inter, Arial, sans-serif'}}>
            Software testing is broken—slow, expensive, and outdated. NeuralBI is here to change that. We’re building an AI-driven, no-code test automation platform that eliminates complexity, accelerates software releases, and makes automation accessible to all businesses.
          </p>
          <Link to="/signup">
            <Button className="px-10 py-4 text-lg md:text-xl font-semibold bg-black text-white shadow hover:scale-105 transition-transform duration-200 font-sans" style={{fontFamily: 'Inter, Arial, sans-serif'}}>
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
