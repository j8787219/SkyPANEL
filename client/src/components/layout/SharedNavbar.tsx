import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, LogIn } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getBrandColors, getButtonStyles } from "@/lib/brand-theme";
import FrontendThemeToggle from "@/components/ui/frontend-theme-toggle";

interface BrandingSettings {
  company_name: string;
  company_color?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
}

export function SharedNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  // Fetch branding settings with default values
  const {
    data: branding = {
      company_name: "SkyVPS360",
      company_color: "2563eb",
      primary_color: "2563eb",
      secondary_color: "10b981",
      accent_color: "f59e0b"
    },
  } = useQuery<BrandingSettings>({
    queryKey: ["/api/settings/branding"],
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Close mobile menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const companyName = branding?.company_name || "SkyVPS360";

  // Use the new color system with fallbacks
  const brandColorOptions = {
    primaryColor: branding?.primary_color || branding?.company_color || "2563eb",
    secondaryColor: branding?.secondary_color || "10b981",
    accentColor: branding?.accent_color || "f59e0b"
  };

  // Get theme colors using our new utility with the enhanced color system
  const brandColors = getBrandColors(brandColorOptions);
  const buttonStyles = getButtonStyles(brandColorOptions);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to handle hash links by scrolling to the element
  const handleHashClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    if (path.includes("#")) {
      event.preventDefault();

      // If not on homepage, navigate to homepage first, then scroll
      if (location !== "/") {
        window.location.href = path;
        return;
      }

      // Extract the ID from the hash
      const hashId = path.split("#")[1];
      const element = document.getElementById(hashId);

      // Scroll to element if it exists
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const isActive = (path: string) => {
    // For paths with hashes, check if we're on home page
    if (path.includes("#")) {
      return location === "/";
    }
    return location === path;
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Plans", path: "/plans" },
    { name: "Our Team", path: "/team" },
    { name: "Blog", path: "/blog" },
    { name: "Documentation", path: "/docs" },
    { name: "Status", path: "/status" },
    { name: "Speed Test", path: "/speed-test" },
  ];

  // Styled button based on active state
  const NavButton = ({
    active,
    children,
    ...props
  }: {
    active: boolean;
    children: React.ReactNode;
    [key: string]: any;
  }) => {
    // Dynamic styling based on active state and brand colors
    const buttonStyle = {
      backgroundColor: active ? brandColors.primary.full : 'transparent',
      color: active ? 'white' : 'var(--gray-700)',
      borderColor: 'transparent',
      // Direct styles applied instead of relying on &:hover CSS
    } as React.CSSProperties;

    // Setup event handlers for consistent hover effects
    const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (active) {
        // No change for active state hover
        return;
      }
      e.currentTarget.style.backgroundColor = brandColors.primary.lighter;
      e.currentTarget.style.color = brandColors.primary.full;
    };

    const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (active) {
        // Reset to active styling
        e.currentTarget.style.backgroundColor = brandColors.primary.full;
        e.currentTarget.style.color = 'white';
        return;
      }
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = 'var(--gray-700)';
    };

    return (
      <Button
        variant={active ? "default" : "ghost"}
        data-nav-button="true"
        style={buttonStyle}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${brandColors.primary.light}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      >
        {children}
      </Button>
    );
  };

  // Mobile menu item with consistent styling
  const MobileNavItem = ({
    active,
    children
  }: {
    active: boolean;
    children: React.ReactNode;
  }) => {
    // Dynamic styling using brand colors
    const style = {
      backgroundColor: active ? brandColors.primary.full : 'transparent',
      color: active ? 'white' : 'var(--gray-700)',
      '&:hover': {
        backgroundColor: !active ? brandColors.primary.lighter : undefined,
        color: !active ? brandColors.primary.full : undefined
      }
    } as React.CSSProperties;

    return (
      <div
        className="block px-3 py-2 rounded-md text-base font-medium"
        data-nav-button="true"
        style={style}
      >
        {children}
      </div>
    );
  };

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div
                className="flex items-center justify-center h-8 w-10 mr-2 rounded text-white font-bold text-lg"
                style={{ backgroundColor: brandColors.primary.full }}
              >
                {companyName?.charAt(0) || "S"}
              </div>
              <span className="text-xl font-bold text-gray-800">
                {companyName}
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) =>
              item.path.includes("#") ? (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleHashClick(e, item.path)}
                >
                  <NavButton active={isActive(item.path)}>
                    {item.name}
                  </NavButton>
                </a>
              ) : (
                <Link key={item.path} href={item.path}>
                  <NavButton active={isActive(item.path)}>
                    {item.name}
                  </NavButton>
                </Link>
              ),
            )}
            <Link href="/auth">
              <Button
                variant="outline"
                className="ml-2 font-medium border"
                data-nav-button="true"
                style={{
                  color: brandColors.primary.full,
                  borderColor: brandColors.primary.medium,
                  '&:hover': {
                    backgroundColor: brandColors.primary.lighter,
                    borderColor: brandColors.primary.full
                  }
                } as React.CSSProperties}
              >
                Client Area
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              className={`inline-flex items-center justify-center p-2 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2`}
              style={{
                color: 'var(--gray-500)',
                '&:hover': {
                  color: brandColors.primary.full,
                  backgroundColor: brandColors.primary.lighter
                },
                '&:focus': {
                  outline: 'none',
                  boxShadow: `0 0 0 2px ${brandColors.primary.light}`,
                  borderColor: brandColors.primary.full
                }
              } as React.CSSProperties}
              onClick={toggleMenu}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="pt-2 pb-3 space-y-1 px-4">
          {navItems.map((item) =>
            item.path.includes("#") ? (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => handleHashClick(e, item.path)}
              >
                <MobileNavItem active={isActive(item.path)}>
                  {item.name}
                </MobileNavItem>
              </a>
            ) : (
              <Link key={item.path} href={item.path}>
                <MobileNavItem active={isActive(item.path)}>
                  {item.name}
                </MobileNavItem>
              </Link>
            ),
          )}
          <Link href="/auth">
            <div
              className="mt-4"
            >
              <MobileNavItem active={false}>
                <span className="flex items-center justify-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Client Area
                </span>
              </MobileNavItem>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
