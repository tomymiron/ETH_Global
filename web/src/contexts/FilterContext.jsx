import { createContext, useContext, useState, useEffect } from "react";

const FilterContext = createContext();

export const useFilter = () => {
  return useContext(FilterContext);
};

export const FilterProvider = ({ children }) => {
  const savedFilterState = sessionStorage.getItem("filterState");
  const savedLatestFilter = sessionStorage.getItem("latestFilter");

  const [filterState, setFilterState] = useState(savedFilterState ? JSON.parse(savedFilterState) : {
    id: 0,
    label: "",
    value: {
      startDate: null,
      endDate: null,
    }
  });

  const [latestFilter, setLatestFilter] = useState(savedLatestFilter ? JSON.parse(savedLatestFilter) : false);

  useEffect(() => {
    if (filterState.id !== 0) {
      setLatestFilter(false);
    }
    sessionStorage.setItem("filterState", JSON.stringify(filterState));
  }, [filterState]);

  useEffect(() => {
    if (latestFilter) {
      setFilterState({ id: 0, label: "", value: { startDate: null, endDate: null } });
    }
    sessionStorage.setItem("latestFilter", JSON.stringify(latestFilter));
  }, [latestFilter]);

  const value = { filterState, setFilterState, latestFilter, setLatestFilter };

  return (
      <FilterContext.Provider value={value}>
          {children}
      </FilterContext.Provider>
  );
};