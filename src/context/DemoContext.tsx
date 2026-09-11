import { createContext, useContext } from "react";
import { demoListings, demoMessages, demoTheses } from "../data/demoData";

const DemoContext = createContext({ demoListings, demoMessages, demoTheses });

export function DemoProvider({ children }: { children: React.ReactNode }) {
  return <DemoContext.Provider value={{ demoListings, demoMessages, demoTheses }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  return useContext(DemoContext);
}
