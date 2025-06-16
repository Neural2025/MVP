import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  LogOut,
  User,
  Brain,
  Menu,
  X,
  Home,
  TestTube,
  Shield,
  Zap,
  Moon,
  Sun
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import * as anime from 'animejs'; // Temporarily disabled

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Animations temporarily disabled
    // anime({
    //   targets: '.navbar',
    //   translateY: [-100, 0],
    //   opacity: [0, 1],
    //   duration: 800,
    //   easing: 'easeOutExpo',
    // });

    // anime({
    //   targets: '.nav-item',
    //   translateY: [-20, 0],
    //   opacity: [0, 1],
    //   duration: 600,
    //   delay: anime.stagger(100, {start: 300}),
    //   easing: 'easeOutQuart',
    // });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);

    // if (!isMenuOpen) {
    //   anime({
    //     targets: '.mobile-menu',
    //     translateX: [300, 0],
    //     opacity: [0, 1],
    //     duration: 400,
    //     easing: 'easeOutQuart',
    //   });
    // }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/api-testing", label: "API Testing", icon: TestTube },
    { href: "/dashboard", label: "Dashboard", icon: Shield },
    { href: "/pricing", label: "Pricing", icon: Zap },
  ];

  const isHomePage = location.pathname === '/';

  return (
    <>
      <nav className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHomePage
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700 shadow-lg'
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="nav-item flex items-center space-x-3 group">
              <div className="relative">
                <Brain className="h-8 w-8 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                <div className="absolute inset-0 bg-purple-600 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI QA Assistant
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="nav-item flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 group"
                >
                  <link.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="nav-item rounded-full p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-300"
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Moon className="h-4 w-4 text-purple-600" />
                )}
              </Button>

              {/* User Menu or Auth Buttons */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="nav-item flex items-center space-x-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-300">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="hidden sm:block font-medium">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <TestTube className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className="nav-item hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-300"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="nav-item bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="md:hidden nav-item rounded-full p-2"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleMenu}></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-slate-900 shadow-2xl">
            <div className="p-6 pt-20">
              <div className="space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={toggleMenu}
                    className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30"
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}

                {!user && (
                  <div className="pt-6 border-t border-gray-200 dark:border-slate-700 space-y-3">
                    <Link to="/login" onClick={toggleMenu}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={toggleMenu}>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;