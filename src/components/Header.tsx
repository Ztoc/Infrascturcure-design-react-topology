"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef, useContext } from "react";
import {
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  BarChart2,
  Network,
  FileText,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import {
  MONITOR,
  STRUCTURE,
  DETAIL,
  MANAGE,
  SIGNED_IN_AS,
  SIGN_OUT,
  SIGN_IN,
} from "@/consts";
import { useTheme } from "@/hook/useTheme";
import { cn } from "@/lib/utils";
import { Tab } from "@/type";
import { AuthContext } from "@/context/AuthContext";

const tabs: Tab[] = [
  { name: MONITOR, path: "/monitor", icon: <BarChart2 size={18} /> },
  { name: STRUCTURE, path: "/structure", icon: <Network size={18} /> },
  { name: DETAIL, path: "/detail", icon: <FileText size={18} /> },
  { name: MANAGE, path: "/manage", icon: <Settings size={18} /> },
];

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleDarkMode } = useTheme();

  const { authenticated, user, setAuthenticated, setUser } =
    useContext(AuthContext);

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

  const handleLogout = () => {
    if (authenticated) {
      setAuthenticated(false);
      setUser("");
      toast.success("Successfully logged out");
      router.push("/login");
    } else {
      router.push("/login");
    }
    setDropdownOpen(false);
  };

  const visibleTabs = tabs;

  return (
    <header className="w-full glass border-b border-border/30 shadow-sm sticky top-0 z-50">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/monitor" className="flex items-center">
            <span className="font-semibold text-xl mr-10 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:scale-105 transition-transform">
              InfraHub
            </span>
          </Link>
        </div>

        <nav
          className="hidden md:flex space-x-3 flex-1 justify-end mr-4"
          aria-label="Tabs"
        >
          {visibleTabs.map((tab, index) => (
            <Link
              key={tab.name}
              href={tab.path}
              className={cn(
                "tab-button flex items-center gap-1.5 animate-on-load",
                pathname === tab.path ? "active" : "",
                `animate-on-load-delay-${index}`
              )}
            >
              {tab.icon}
              {tab.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="rounded-full p-2 text-foreground/70 hover:text-foreground bg-secondary/50 hover:bg-secondary transition-colors hidden sm:flex items-center justify-center"
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-foreground/70 hover:text-foreground bg-secondary/50 hover:bg-secondary transition-colors"
              aria-label="User menu"
            >
              <User size={18} className="text-primary" />
              {authenticated && (
                <span className="text-sm hidden sm:inline font-medium">
                  {user || "User"}
                </span>
              )}
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform duration-200",
                  dropdownOpen ? "rotate-180" : ""
                )}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg glass z-10 animate-in fade-in-50 slide-in-from-top-5 overflow-hidden">
                <div className="py-1">
                  {authenticated ? (
                    <>
                      <div className="px-4 py-2 text-sm text-foreground/70 border-b border-border/50">
                        {SIGNED_IN_AS} &nbsp;
                        <span className="font-semibold">{user || "User"}</span>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm hover:bg-secondary/70 transition-colors text-destructive"
                      >
                        <LogOut size={16} className="mr-2" />
                        <span>{SIGN_OUT}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="flex w-full items-center px-4 py-2 text-sm hover:bg-secondary/70 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User size={16} className="mr-2" />
                        <span>{SIGN_IN}</span>
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

      {mobileMenuOpen && (
        <div className="md:hidden glass animate-slide-in-up border-t border-border/30">
          <div className="space-y-1 p-4">
            {visibleTabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-base rounded-lg transition-colors",
                  pathname === tab.path
                    ? "bg-secondary text-foreground font-medium"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary/50"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {tab.icon}
                {tab.name}
              </Link>
            ))}
            <button
              onClick={toggleDarkMode}
              className="flex w-full items-center gap-2 px-4 py-3 text-base rounded-lg text-foreground/70 hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
