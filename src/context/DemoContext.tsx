import { createContext, useContext } from "react";
import { demoListings, demoMessages, demoTheses, nearbyFounders, supportOrganizations } from "../data/demoData";

const value = { demoListings, demoMessages, demoTheses, nearbyFounders, supportOrganizations };
const DemoContext = createContext(value);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  return useContext(DemoContext);
}
