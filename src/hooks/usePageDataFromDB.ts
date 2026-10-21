import { useContext } from "react";
import { PageDataContext } from "@/contexts/PageDataContext";

/** Page settings and contact info, loaded once by PageDataProvider. */
export const usePageDataFromDB = () => {
  const value = useContext(PageDataContext);
  if (!value) {
    throw new Error("usePageDataFromDB must be used inside PageDataProvider");
  }
  return value;
};
