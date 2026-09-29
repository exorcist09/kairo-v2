"use client";

import {
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  CheckCircle,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

export const AVATAR_OPTIONS = [
  {
    id: "avatar1",
    src: "/avatar/avatar1.jpg",
    alt: "Avatar 1",
    label: "Astronaut",
  },
  {
    id: "avatar2",
    src: "/avatar/avatar2.jpg",
    alt: "Avatar 2",
    label: "Explorer",
  },
  {
    id: "avatar3",
    src: "/avatar/avatar3.jpg",
    alt: "Avatar 3",
    label: "Cyber",
  },
  {
    id: "avatar4",
    src: "/avatar/avatar4.jpg",
    alt: "Avatar 4",
    label: "Synth",
  },
  {
    id: "avatar5",
    src: "/avatar/avatar5.jpg",
    alt: "Avatar 5",
    label: "Pilot",
  },
];

export const getAvatarSrc = (labelOrSrc?: string): string => {
  const cyber =
    AVATAR_OPTIONS.find((a) => a.label.toLowerCase() === "cyber") ||
    AVATAR_OPTIONS[0];
  if (!labelOrSrc) return cyber.src;
  const match = AVATAR_OPTIONS.find(
    (a) =>
      a.label.toLowerCase() === labelOrSrc.toLowerCase() ||
      a.id.toLowerCase() === labelOrSrc.toLowerCase() ||
      a.src.toLowerCase() === labelOrSrc.toLowerCase(),
  );
  if (match) return match.src;
  if (labelOrSrc.startsWith("/")) return labelOrSrc;
  return cyber.src;
};

export const getAvatarLabel = (labelOrSrc?: string): string => {
  if (!labelOrSrc) return "Cyber";
  const match = AVATAR_OPTIONS.find(
    (a) =>
      a.src.toLowerCase() === labelOrSrc.toLowerCase() ||
      a.label.toLowerCase() === labelOrSrc.toLowerCase() ||
      a.id.toLowerCase() === labelOrSrc.toLowerCase(),
  );
  return match ? match.label : "Cyber";
};

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (avatarSrc: string, avatarLabel: string) => void;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export default function AvatarSelector({
  selectedAvatar,
  onSelect,
  className = "",
  orientation = "horizontal",
}: AvatarSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const centerItem = useCallback(
    (index: number) => {
      const container = containerRef.current;
      const item = itemRefs.current[index];
      if (!container || !item) return;

      if (orientation === "vertical") {
        const containerCenter = container.clientHeight / 2;
        const itemCenter = item.offsetTop + item.offsetHeight / 2;
        const scrollTarget = itemCenter - containerCenter;

        container.scrollTo({
          top: scrollTarget,
          behavior: "smooth",
        });
      } else {
        const containerCenter = container.offsetWidth / 2;
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const scrollTarget = itemCenter - containerCenter;

        container.scrollTo({
          left: scrollTarget,
          behavior: "smooth",
        });
      }
    },
    [orientation],
  );

  const selectedIndex = Math.max(
    0,
    AVATAR_OPTIONS.findIndex(
      (a) =>
        a.src === selectedAvatar ||
        a.label.toLowerCase() === selectedAvatar?.toLowerCase() ||
        a.id.toLowerCase() === selectedAvatar?.toLowerCase(),
    ),
  );

  useEffect(() => {
    centerItem(selectedIndex);
  }, [selectedIndex, centerItem]);

  const handlePrev = () => {
    const nextIndex =
      selectedIndex > 0 ? selectedIndex - 1 : AVATAR_OPTIONS.length - 1;
    const item = AVATAR_OPTIONS[nextIndex];
    onSelect(item.src, item.label);
  };

  const handleNext = () => {
    const nextIndex =
      selectedIndex < AVATAR_OPTIONS.length - 1 ? selectedIndex + 1 : 0;
    const item = AVATAR_OPTIONS[nextIndex];
    onSelect(item.src, item.label);
  };

  if (orientation === "vertical") {
    return (
      <div
        className={`flex flex-col items-center justify-center select-none ${className}`}
      >
        {/* Up Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous avatar"
          className="flex-shrink-0 z-20 w-8 h-8 rounded-full bg-white shadow-xs border border-gray-200 flex items-center justify-center text-gray-700 hover:text-blue-600 hover:border-blue-300 transition-all hover:scale-105 active:scale-95 cursor-pointer mb-2"
        >
          <CaretUp weight="bold" className="w-4 h-4" />
        </button>

        {/* Vertical Avatar Scroll Track */}
        <div
          ref={containerRef}
          className="relative flex flex-col items-center gap-3 overflow-y-auto no-scrollbar scroll-smooth py-14 px-3 snap-y snap-mandatory h-60 w-32"
          style={{ scrollbarWidth: "none" }}
        >
          {AVATAR_OPTIONS.map((avatarItem, idx) => {
            const isSelected =
              avatarItem.src === selectedAvatar ||
              avatarItem.label.toLowerCase() ===
                selectedAvatar?.toLowerCase() ||
              avatarItem.id.toLowerCase() === selectedAvatar?.toLowerCase();

            return (
              <button
                key={avatarItem.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => onSelect(avatarItem.src, avatarItem.label)}
                className={`group relative flex-shrink-0 aspect-square rounded-full transition-all duration-300 ease-out snap-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer ${
                  isSelected
                    ? "w-20 h-20 scale-105 ring-4 ring-blue-600 ring-offset-4 ring-offset-white shadow-lg z-10"
                    : "w-13 h-13 scale-90 opacity-40 hover:opacity-80 hover:scale-95 ring-2 ring-transparent"
                }`}
                aria-label={`Select ${avatarItem.label}`}
                aria-pressed={isSelected}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 shadow-inner">
                  <Image
                    src={avatarItem.src}
                    alt={avatarItem.alt}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 shadow-md border-2 border-white">
                    <CheckCircle weight="fill" className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Down Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next avatar"
          className="flex-shrink-0 z-20 w-8 h-8 rounded-full bg-white shadow-xs border border-gray-200 flex items-center justify-center text-gray-700 hover:text-blue-600 hover:border-blue-300 transition-all hover:scale-105 active:scale-95 cursor-pointer mt-2"
        >
          <CaretDown weight="bold" className="w-4 h-4" />
        </button>

        {/* Persona Name Label Below with Avatar title */}
        <div className="flex items-center gap-1.5 mt-5 text-center select-none">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Avatar:
          </span>
          <span className="text-sm font-bold text-gray-900 tracking-tight">
            {AVATAR_OPTIONS[selectedIndex]?.label || "Cyber"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center w-full select-none ${className}`}
    >
      <span className="text-xs font-semibold tracking-wider uppercase text-gray-400 mb-3">
        Avatar
      </span>

      {/* Main Selector Row without clipping */}
      <div className="relative w-full max-w-xl flex items-center justify-center px-2">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous avatar"
          className="flex-shrink-0 z-20 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:text-blue-600 hover:border-blue-300 transition-all hover:scale-105 active:scale-95 cursor-pointer mr-2 sm:mr-3"
        >
          <CaretLeft weight="bold" className="w-4 h-4" />
        </button>

        {/* Avatar Scroll Track - Visible Overflow to Prevent Clipping */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-start sm:justify-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {AVATAR_OPTIONS.map((avatarItem, idx) => {
            const isSelected =
              avatarItem.src === selectedAvatar ||
              avatarItem.label.toLowerCase() ===
                selectedAvatar?.toLowerCase() ||
              avatarItem.id.toLowerCase() === selectedAvatar?.toLowerCase();

            return (
              <button
                key={avatarItem.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => onSelect(avatarItem.src, avatarItem.label)}
                className={`group relative flex-shrink-0 aspect-square rounded-full transition-all duration-300 ease-out snap-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer ${
                  isSelected
                    ? "w-18 h-18 sm:w-22 sm:h-22 scale-110 ring-4 ring-blue-600 ring-offset-4 ring-offset-white shadow-xl z-10"
                    : "w-13 h-13 sm:w-15 sm:h-15 scale-95 opacity-50 hover:opacity-85 hover:scale-100 ring-2 ring-transparent"
                }`}
                aria-label={`Select ${avatarItem.label}`}
                aria-pressed={isSelected}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 shadow-inner">
                  <Image
                    src={avatarItem.src}
                    alt={avatarItem.alt}
                    width={88}
                    height={88}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 shadow-md border-2 border-white">
                    <CheckCircle weight="fill" className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next avatar"
          className="flex-shrink-0 z-20 w-9 h-9 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:text-blue-600 hover:border-blue-300 transition-all hover:scale-105 active:scale-95 cursor-pointer ml-2 sm:ml-3"
        >
          <CaretRight weight="bold" className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Indicator Label */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-3">
        <span>Active:</span>
        <span className="font-semibold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-full">
          {AVATAR_OPTIONS[selectedIndex]?.label || "Persona"}
        </span>
      </div>
    </div>
  );
}
