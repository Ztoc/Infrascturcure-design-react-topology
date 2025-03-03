"use client";

import { Sun, Moon, Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Tab = {
  name: string;
  path: string;
};

const tabs: Tab[] = [
  { name: "Monitor", path: "/monitor" },
  { name: "Structure", path: "/structure" },
  { name: "Detail", path: "/detail" },
  { name: "Manage", path: "/manage" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(
    null
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDarkMode = () => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark");
      setIsDarkMode(!isDarkMode);
    }
  };

  const handleLogout = () => {
    if (isLoggedIn) {
      toast.success("Successfully logged out");
      router.push("/login");
    } else {
      router.push("/login");
    }
    setDropdownOpen(false);
  };

  // All tabs are now visible and middleware will handle redirects
  const visibleTabs = tabs;

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <span className="font-medium text-xl mr-10">InfraHub</span>
        </div>

        {/* Tabs aligned to the right */}
        <nav
          className="hidden md:flex space-x-1 flex-1 justify-end mr-4"
          aria-label="Tabs"
        >
          {visibleTabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.path}
              className={cn(
                "tab-button animate-on-load",
                pathname === tab.path ? "active" : ""
              )}
            >
              {tab.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-foreground/70 hover:text-foreground bg-secondary/50 hover:bg-secondary transition-colors"
              aria-label="User menu"
            >
              <User size={18} />
              {isLoggedIn && (
                <span className="text-sm hidden sm:inline">
                  {user?.name || "User"}
                </span>
              )}
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform",
                  dropdownOpen ? "rotate-180" : ""
                )}
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg glass z-10 animate-in fade-in-50 slide-in-from-top-5">
                <div className="py-1">
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-2 text-sm text-foreground/70 border-b border-border/50">
                        Signed in as{" "}
                        <span className="font-semibold">
                          {user?.name || "User"}
                        </span>
                      </div>
                      <button
                        onClick={toggleDarkMode}
                        className="flex w-full items-center px-4 py-2 text-sm hover:bg-secondary/70 transition-colors"
                      >
                        {isDarkMode ? (
                          <>
                            <Sun size={16} className="mr-2" />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <Moon size={16} className="mr-2" />
                            <span>Dark Mode</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm hover:bg-secondary/70 transition-colors text-destructive"
                      >
                        <LogOut size={16} className="mr-2" />
                        <span>Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 text-sm text-foreground/70 border-b border-border/50">
                        Not signed in
                      </div>
                      <button
                        onClick={toggleDarkMode}
                        className="flex w-full items-center px-4 py-2 text-sm hover:bg-secondary/70 transition-colors"
                      >
                        {isDarkMode ? (
                          <>
                            <Sun size={16} className="mr-2" />
                            <span>Light Mode</span>
                          </>
                        ) : (
                          <>
                            <Moon size={16} className="mr-2" />
                            <span>Dark Mode</span>
                          </>
                        )}
                      </button>
                      <Link
                        href="/login"
                        className="flex w-full items-center px-4 py-2 text-sm hover:bg-secondary/70 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User size={16} className="mr-2" />
                        <span>Sign in</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="md:hidden rounded-full p-2 text-foreground/70 hover:text-foreground bg-secondary/50 hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass animate-slide-in-up">
          <div className="space-y-1 p-4">
            {visibleTabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.path}
                className={cn(
                  "block px-4 py-3 text-base rounded-lg transition-colors",
                  pathname === tab.path
                    ? "bg-secondary text-foreground"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary/50"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {tab.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
