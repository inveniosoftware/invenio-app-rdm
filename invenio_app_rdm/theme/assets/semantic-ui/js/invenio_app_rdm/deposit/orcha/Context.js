import { createContext, useContext } from "react";

const SuggestionsContext = createContext(null);

export const useSuggestions = () => {
  return useContext(SuggestionsContext);
};

export default SuggestionsContext;
export { SuggestionsContext };
