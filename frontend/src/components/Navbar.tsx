import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import {
  LogOut,
  User,
  Brain,
  Menu,
  X,
  Home,
  TestTube,
  Shield,
  Moon,
  Sun,
  Code,
  Bug
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import * as anime from 'animejs'; // Temporarily disabled

const Navbar = () => {
  // Debug: Print user on every render
  const debugUser = useAuth().user;
  console.log('[Navbar] Render user:', debugUser);

  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    setTheme(theme === "dark" ? "light" : "dark");
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

  // Robust role-based menu links
  console.log('Navbar user:', user);
  let navLinks: Array<{ href: string; label: string; icon: any }> = [];
  if (user && user.role) {
    const role = user.role.trim().toLowerCase();
    if (["dev", "developer"].includes(role)) {
      navLinks = [
        { href: "/", label: "Home", icon: Home },
        { href: "/code-analysis", label: "Code Analysis", icon: Code },
        { href: "/bug-reports", label: "Bug Reporting", icon: Bug },
      ];
    } else if (["tester", "test", "qa"].includes(role)) {
      navLinks = [
        { href: "/", label: "Home", icon: Home },
        { href: "/test-suites", label: "Test Suites", icon: TestTube },
        { href: "/bug-reports", label: "Bug Reporting", icon: Bug },
      ];
    } else if ([
      "po", "product_owner", "productowner", "product manager", "productmanager", "product owner", "pm", "owner", "manager", "product_manager"
    ].includes(role)) {
      navLinks = [
        { href: "/", label: "Home", icon: Home },
        { href: "/bug-reports", label: "Bug Reporting", icon: Bug },
        { href: "/dashboard", label: "Dashboard", icon: Shield },
      ];
    } else {
      navLinks = [
        { href: "/", label: "Home", icon: Home },
      ];
    }
  } else {
    navLinks = [
      { href: "/", label: "Home", icon: Home },
    ];
  }

  const isHomePage = location.pathname === '/';

  return (
    <>
      <nav className={`navbar fixed top-0 left-0 right-0 z-50 bg-white text-black`}>
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="nav-item flex items-center space-x-3 min-w-0 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-all duration-500 animate-pulse"></div>
                <Brain className="h-7 w-7 lg:h-8 lg:w-8 text-purple-400 group-hover:text-purple-300 transition-all duration-300 relative z-10 animate-float" />
              </div>
              <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient hidden sm:block">
                AI QA Assistant
              </span>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient sm:hidden">
                AIQA
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-4 flex-1 justify-center max-w-2xl mx-8">
              {navLinks.map(link => ( 
                <Link
                  key={link.href}
                  to={link.href}
                  className={`nav-item flex items-center space-x-2 px-3 xl:px-4 py-2 rounded-xl ${location.pathname === link.href ? 'bg-black text-white' : 'text-black'}`}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="font-medium whitespace-nowrap">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="nav-item rounded-full p-1.5 lg:p-2 hover:bg-primary/10 transition-all duration-300 hover:scale-110 hidden sm:flex"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-accent animate-color-shift" />
                ) : (
                  <Moon className="h-4 w-4 text-primary animate-color-shift" />
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
                <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="nav-item text-xs lg:text-sm px-2 lg:px-3 bg-black text-white border border-black"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button
                      size="sm"
                      className="nav-item bg-black text-white border border-white text-xs lg:text-sm px-2 lg:px-3"
                    >
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
                className="md:hidden nav-item rounded-full p-2 bg-black text-white border border-white"
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
          <div className="absolute inset-0 bg-black opacity-80" onClick={toggleMenu}></div>
          <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-black">
            <div className="p-6 pt-20">
              <div className="space-y-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={toggleMenu}
                    className="flex items-center space-x-3 text-black hover:text-black p-3 rounded-lg hover:bg-gray-100"
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}

                {!user && (
                  <div className="pt-6 border-t border-gray-200 dark:border-slate-700 space-y-3">
                    <Link to="/login" onClick={toggleMenu}>
                      <Button variant="outline" className="w-full bg-white text-black border border-black">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={toggleMenu}>
                      <Button className="w-full bg-black text-white border border-white">
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