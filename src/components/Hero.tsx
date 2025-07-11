
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye, Beaker } from 'lucide-react';

const Hero = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:60px_60px] animate-pulse" />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full animate-float blur-xl" />
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-300/20 rounded-full animate-float-delayed blur-xl" />
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-blue-300/10 rounded-full animate-float blur-xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center text-white">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Artificial Intelligence
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              & Data Science
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Pioneering the future of technology through cutting-edge research, 
            innovative education, and transformative applications in AI and Data Science
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
          <Button
            size="lg"
            onClick={() => scrollToSection('#about')}
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 text-lg flex items-center space-x-2 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <Eye className="w-5 h-5" />
            <span>Explore Our Vision</span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollToSection('#research')}
            className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 text-lg flex items-center space-x-2 backdrop-blur-sm transition-all duration-300"
          >
            <Beaker className="w-5 h-5" />
            <span>View Research</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[
            { number: '500+', label: 'Students' },
            { number: '50+', label: 'Faculty' },
            { number: '100+', label: 'Research Papers' },
            { number: '95+', label: 'Placement Rate' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                {stat.number}
              </div>
              <div className="text-blue-100 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
