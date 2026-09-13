import type { ComponentType } from "react";

export interface AccordionGalleryItem {
  image: string;
  label?: string;
  alt?: string;
  link?: string;
}

export interface AccordionGalleryProps {
  items?: AccordionGalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  fill?: boolean;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: "horizontal" | "vertical";
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: "hover" | "click";
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
}

declare const AccordionGallery: ComponentType<AccordionGalleryProps>;
export default AccordionGallery;