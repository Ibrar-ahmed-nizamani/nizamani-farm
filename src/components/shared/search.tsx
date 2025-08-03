"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  KeyboardEvent,
} from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface BaseUser {
  _id: string;
  name: string;
  // [key: string]: unknown;
}

interface SearchProps<T extends BaseUser> {
  data: T[];
  baseUrl: string;
  placeholder?: string;
  maxHeight?: string;
}

export default function CustomSearch<T extends BaseUser>({
  data,
  baseUrl,
  placeholder = "Search...",
}: SearchProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const resultItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const filteredData = useCallback(() => {
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const results = filteredData();

    // Open dropdown when starting to type
    if (!isOpen && searchQuery) {
      setIsOpen(true);
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        const nextIndex =
          selectedIndex < results.length - 1
            ? selectedIndex + 1
            : selectedIndex;
        setSelectedIndex(nextIndex);

        // Scroll to selected item if it's out of view
        if (resultsContainerRef.current && resultItemRefs.current[nextIndex]) {
          const container = resultsContainerRef.current;
          const selectedItem = resultItemRefs.current[nextIndex];

          if (selectedItem) {
            const containerRect = container.getBoundingClientRect();
            const itemRect = selectedItem.getBoundingClientRect();

            // Check if item is above or below visible area
            if (itemRect.bottom > containerRect.bottom) {
              // Scroll down
              container.scrollTop += itemRect.bottom - containerRect.bottom;
            } else if (itemRect.top < containerRect.top) {
              // Scroll up
              container.scrollTop -= containerRect.top - itemRect.top;
            }
          }
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : -1;
        setSelectedIndex(prevIndex);

        // Scroll to selected item if it's out of view
        if (
          resultsContainerRef.current &&
          prevIndex >= 0 &&
          resultItemRefs.current[prevIndex]
        ) {
          const container = resultsContainerRef.current;
          const selectedItem = resultItemRefs.current[prevIndex];

          if (selectedItem) {
            const containerRect = container.getBoundingClientRect();
            const itemRect = selectedItem.getBoundingClientRect();

            // Check if item is above or below visible area
            if (itemRect.top < containerRect.top) {
              // Scroll up
              container.scrollTop -= containerRect.top - itemRect.top;
            } else if (itemRect.bottom > containerRect.bottom) {
              // Scroll down
              container.scrollTop += itemRect.bottom - containerRect.bottom;
            }
          }
        }
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          const selectedItem = results[selectedIndex];
          window.location.href = `${baseUrl}/${selectedItem._id}`;
        }
        break;

      case "Escape":
        setIsOpen(false);
        inputRef.current?.focus();
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  return (
    <div className="relative max-w-72" ref={searchRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-8"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-activedescendant={
            selectedIndex >= 0 ? `search-item-${selectedIndex}` : undefined
          }
        />
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
      </div>

      {isOpen && (
        <div
          id="search-results"
          className="absolute mt-1 w-full z-50 rounded-md border bg-white shadow-lg"
        >
          <div ref={resultsContainerRef} className="max-h-40 overflow-y-scroll">
            {filteredData().length > 0 ? (
              <div className="p-1">
                {filteredData().map((item, index) => (
                  <Link
                    href={`${baseUrl}/${item._id}`}
                    key={item._id}
                    id={`search-item-${index}`}
                    ref={(el) => {
                      resultItemRefs.current[index] = el;
                    }}
                  >
                    <div
                      className={`
                        flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm 
                        ${
                          index === selectedIndex
                            ? "bg-gray-200"
                            : "hover:bg-gray-100"
                        }
                      `}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-2 text-sm text-gray-500">No results found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
