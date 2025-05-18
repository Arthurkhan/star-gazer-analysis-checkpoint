// Type definitions for business types
export enum BusinessType {
  CAFE = "CAFE",
  BAR = "BAR",
  GALLERY = "GALLERY"
}

export const businessTypeMap = {
  "The Little Prince Cafe": BusinessType.CAFE,
  "Vol de Nuit, The Hidden Bar": BusinessType.BAR,
  "L'Envol Art Space": BusinessType.GALLERY
};

export type BusinessName = keyof typeof businessTypeMap;

// Type mapping for business-specific data and settings
export interface BusinessSettings {
  displayName: string;
  color: string;
  icon: string;
  description: string;
}

export const businessSettings: Record<BusinessType, BusinessSettings> = {
  [BusinessType.CAFE]: {
    displayName: "The Little Prince Cafe",
    color: "#8B4513", // Coffee brown
    icon: "coffee",
    description: "Cozy cafe with specialty coffee and pastries"
  },
  [BusinessType.BAR]: {
    displayName: "Vol de Nuit, The Hidden Bar",
    color: "#4B0082", // Dark indigo
    icon: "glass-martini-alt",
    description: "Speakeasy cocktail bar with live jazz"
  },
  [BusinessType.GALLERY]: {
    displayName: "L'Envol Art Space",
    color: "#009688", // Teal
    icon: "paint-brush",
    description: "Contemporary art gallery featuring local artists"
  }
};
