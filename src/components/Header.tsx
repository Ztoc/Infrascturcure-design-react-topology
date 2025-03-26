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
import { Tab, Branch } from "@/type";
import { AuthContext, SECURITY_STORAGE_ITEM } from "@/context/AuthContext";
import { GET_BRANCHES } from "@/query";
import { useQuery } from "@apollo/client";

const Header = () => {
  const { data: branches, loading: isLoadingBranches } = useQuery(GET_BRANCHES);

  const tabs: Tab[] = [
    { name: MONITOR, path: "/monitor", icon: <BarChart2 size={18} /> },
    {
      name: STRUCTURE,
      path: "/structure",
      icon: <Network size={18} />,
      isDropdown: true,
      dropdownItems: [{ name: "All", path: "/structure" }],
    },
    { name: DETAIL, path: "/detail", icon: <FileText size={18} /> },
    { name: MANAGE, path: "/manage", icon: <Settings size={18} /> },
  ];

  if (branches) {
    tabs[1].dropdownItems?.push(
      ...branches?.getBranches.map((branch: Branch) => ({
        name: branch.branch_name,
        path: `/structure?org=${branch.branch_id}`,
      }))
    );
  }

  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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

      if (activeDropdown) {
        const target = event.target as Node;
        if (target instanceof Element) {
          if (!target.closest(".structure-dropdown")) {
            setActiveDropdown(null);
          }
        } else {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  const handleLogout = () => {
    if (authenticated) {
      localStorage.setItem(
        SECURITY_STORAGE_ITEM, ""
      )
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
          {visibleTabs.map((tab, index) =>
            tab.isDropdown ? (
              <div key={tab.name} className="relative structure-dropdown">
                <button
                  onClick={() =>
                    setActiveDropdown(
                      activeDropdown === tab.name ? null : tab.name
                    )
                  }
                  className={cn(
                    "tab-button flex items-center gap-1.5 animate-on-load",
                    pathname.startsWith(tab.path) ? "active" : "",
                    `animate-on-load-delay-${index}`
                  )}
                >
                  {tab.icon}
                  {tab.name}
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform duration-200 ml-1",
                      activeDropdown === tab.name ? "rotate-180" : ""
                    )}
                  />
                </button>

                {activeDropdown === tab.name && tab.dropdownItems && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg glass z-10 animate-in fade-in-50 slide-in-from-top-5 overflow-hidden">
                    <div className="py-1">
                      {tab.dropdownItems.map(
                        (
                          item: { name: string; path: string },
                          index: number
                        ) => (
                          <Link
                            key={index}
                            href={item.path}
                            className="flex w-full items-center px-4 py-2 text-sm hover:bg-secondary/70 transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <span>{item.name}</span>
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
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
            )
          )}
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
            {visibleTabs.map((tab) =>
              tab.isDropdown ? (
                <div key={tab.name}>
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === tab.name ? null : tab.name
                      )
                    }
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-4 py-3 text-base rounded-lg transition-colors",
                      pathname.startsWith(tab.path)
                        ? "bg-secondary text-foreground font-medium"
                        : "text-foreground/70 hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {tab.icon}
                      {tab.name}
                    </div>
                    <ChevronDown
                      size={14}
                      className={cn(
                        "transition-transform duration-200",
                        activeDropdown === tab.name ? "rotate-180" : ""
                      )}
                    />
                  </button>

                  {activeDropdown === tab.name && tab.dropdownItems && (
                    <div className="pl-8 mt-1 space-y-1">
                      {tab.dropdownItems.map((item) => (
                        <Link
                          key={item.name || item.path}
                          href={item.path}
                          className={cn(
                            "flex items-center px-4 py-2 text-sm rounded-lg transition-colors",
                            pathname === item.path
                              ? "bg-secondary/70 text-foreground"
                              : "text-foreground/70 hover:text-foreground hover:bg-secondary/30"
                          )}
                          onClick={() => {
                            setActiveDropdown(null);
                            setMobileMenuOpen(false);
                          }}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
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
              )
            )}
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
