import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const FilterContext = createContext();

const SCREEN_TYPES_BASE = [
  { label: "Fiestas", value: 1 },
  { label: "Bares", value: 2 },
  { label: "Shows", value: 3 },
];

const FILTERS_BASE = [
  { label: "Ubicación", value: "location", icon: "map", target: "FilterLocation", available: [1, 2, 3] },
  { label: "Edad", value: "ages", icon: "user", target: "FilterAges", available: [1, 3] },
  { label: "Fecha", value: "date", icon: "calendar", target: "FilterDate", available: [1, 3] },
  { label: "Planes", value: "tags", icon: "tag", target: "FilterTags", available: [1, 2, 3] },
  { label: "Gratis", value: "free", icon: "plus", target: null, available: [1, 3] },
  { label: "Música", value: "music", icon: "music", target: "FilterMusic", available: [1, 3] },
  { label: "Recientes", value: "latest", icon: "bell-ring", target: null, available: [1, 3] },
];

export const SCREEN_TYPES = SCREEN_TYPES_BASE;
export const FILTERS = FILTERS_BASE;

export const useFilter = () => {
  return useContext(FilterContext);
};

export const FilterProvider = ({ children }) => {
  const { authState } = useAuth();

  const [screenType, setScreenType] = useState(SCREEN_TYPES[0]);
  const [filter, setFilter] = useState({
    location: null,
    latest: null,
    music: null,
    free: null,
    date: null,
    tags: null,
    ages: null,
  });
  const [tags, setTags] = useState([null, null, null]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load filters and tags from localStorage on mount
  useEffect(() => {
    const loadFilter = async () => {
      try {
        const savedFilter = localStorage.getItem("userFilters");
        const savedTags = localStorage.getItem("userTags");

        let parsedFilter = savedFilter ? JSON.parse(savedFilter) : null;
        let parsedTags = savedTags ? JSON.parse(savedTags) : [null, null, null];

        if (!Array.isArray(parsedTags) || parsedTags.length !== 3) {
          parsedTags = [null, null, null];
        }

        setTags(parsedTags);

        if (parsedFilter) {
          setFilter({ ...parsedFilter, tags: parsedTags[screenType.value - 1] ?? null });
        } else {
          setFilter((f) => ({ ...f, tags: parsedTags[screenType.value - 1] ?? null }));
        }

        setIsLoaded(true);
      } catch (e) {
        setIsLoaded(true);
        console.log("Error cargando filtros/tags:", e);
      }
    };

    loadFilter();
  }, []);

  // Save filters and tags to localStorage when they change
  useEffect(() => {
    if (!isLoaded) return;

    setTags((prevTags) => {
      const newTags = [...prevTags];
      newTags[screenType.value - 1] = filter.tags;
      localStorage.setItem("userTags", JSON.stringify(newTags));
      return newTags;
    });

    localStorage.setItem("userFilters", JSON.stringify(filter));
  }, [filter, isLoaded, screenType.value]);

  // Update filter tags when screen type changes
  useEffect(() => {
    if (!isLoaded) return;
    setFilter((prev) => ({ ...prev, tags: tags[screenType.value - 1] ?? null }));
  }, [screenType, isLoaded]);

  const changeFilter = (key, newValue) => {
    setFilter((prev) => ({ ...prev, [key]: newValue }));
    
    // Track filter changes if you have analytics
    // trackEventsFilter(authState?.user?.id, screenType?.label || "none", key);
  };

  const changeScreenType = (type) => {
    setScreenType(SCREEN_TYPES[type]);
  };

  const value = {
    changeScreenType,
    changeFilter,
    setScreenType,
    screenType,
    filter,
    SCREEN_TYPES,
    FILTERS,
    isLoaded,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};