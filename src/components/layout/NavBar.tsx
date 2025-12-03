import { createSignal, onMount, onCleanup, Show, For } from "solid-js";
import { Link } from "@tanstack/solid-router";
import { navLinks } from "../../lib/data";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = createSignal(false);
  let navRef: HTMLElement | undefined;

  // Toggle mobile menu
  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);

  // Close menu when clicking a link
  const closeMenu = () => setIsMobileMenuOpen(false);

  // Handle click outside to close menu
  const handleClickOutside = (event: MouseEvent) => {
    if (
      navRef &&
      !navRef.contains(event.target as Node) &&
      isMobileMenuOpen()
    ) {
      setIsMobileMenuOpen(false);
    }
  };

  onMount(() => {
    // Add event listener on mount (Client only)
    document.addEventListener("click", handleClickOutside);

    // Register cleanup INSIDE onMount to ensure it only runs on the client
    onCleanup(() => {
      document.removeEventListener("click", handleClickOutside);
    });
  });

  // Base classes used for both Desktop and Mobile links
  const linkBaseClasses = "transition-all duration-200 font-amiri";
  const activeClasses = "text-amber-400 bg-white/10 shadow-sm";
  const inactiveClasses =
    "text-emerald-100/90 hover:text-amber-400 hover:bg-white/5";

  return (
    <nav
      ref={navRef}
      class="fixed top-0 w-full z-50 bg-emerald-950/90 backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between md:justify-start md:gap-x-10 h-20 items-center">
          {/* Logo */}
          <div class="flex-shrink-0 flex items-center">
            <Link
              to="/"
              class="text-2xl font-bold text-amber-400 font-amiri hover:text-amber-300 transition-colors drop-shadow-md"
              onClick={closeMenu}
            >
              د. يسري جبر
            </Link>
          </div>

          {/* Desktop Menu */}
          <div class="hidden md:flex items-center flex-1">
            {/* 1. Navigation Links */}
            <div class="flex items-center space-x-8 space-x-reverse">
              <For each={navLinks}>
                {(link) => (
                  <Link
                    to={link.href}
                    class={`px-3 py-2 rounded-md text-base font-medium ${linkBaseClasses}`}
                    activeProps={{ class: activeClasses }}
                    inactiveProps={{ class: inactiveClasses }}
                  >
                    {link.label}
                  </Link>
                )}
              </For>
            </div>

            {/* 2. Actions Group */}
            <div class="flex items-center gap-4 mr-auto">
              <Link
                to="/contact"
                class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-amber-900/20 font-amiri"
              >
                تواصل معنا
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div class="flex items-center md:hidden">
            <button
              type="button"
              class="inline-flex items-center justify-center p-2 rounded-md text-emerald-100 hover:text-white hover:bg-white/10 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen()}
              onClick={toggleMenu}
            >
              <span class="sr-only">Open main menu</span>
              <Show
                when={isMobileMenuOpen()}
                fallback={
                  <svg
                    class="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                }
              >
                <svg
                  class="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Show>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        class={`md:hidden bg-emerald-950 border-b border-white/10 shadow-2xl ${isMobileMenuOpen() ? "block" : "hidden"
          }`}
        id="mobile-menu"
      >
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <For each={navLinks}>
            {(link) => (
              <Link
                to={link.href}
                class={`block px-3 py-3 rounded-md text-base font-bold text-right border-b border-white/5 last:border-0 ${linkBaseClasses}`}
                activeProps={{ class: activeClasses }}
                inactiveProps={{ class: inactiveClasses }}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            )}
          </For>

          <div class="pt-4 pb-2 px-3">
            <a
              href="#contact"
              class="block w-full text-center bg-amber-500 text-white py-3 rounded-full font-bold shadow-lg font-amiri"
              onClick={closeMenu}
            >
              تواصل معنا
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
