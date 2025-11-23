import { useCallback, useEffect, useMemo, useState, useRef, memo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { dateOnlyFormatter, timeSince } from "../constants/timeGetter";
import { useFilter } from "../contexts/FilterContext";
import { useAuth } from "../contexts/AuthContext";
import { makeRequest } from "../config/axios";
import { COLORS } from "../constants/theme";
import Transition from "../Transition";
import Icon from "../constants/Icon";
import { profileImageGetter } from "../constants/imageGetter";
import "./styles/events.scss";

// ============== COMPONENTES AUXILIARES ==============

const Header = memo(() => {
  return (
    <div className="events-header">
      <button className="header-back-button" aria-label="Go back">
        <Icon name="left-arrow" size={24} color={COLORS.white_01} />
      </button>
      <h1 className="header-title">FIND YOUR NIGHT</h1>
      <button className="header-settings-button" aria-label="Settings">
        <p>?</p>
      </button>
    </div>
  );
});

const Tabs = memo(({ activeTab, onChange }) => {
  const tabs = [
    { id: 'partys', label: 'Partys' },
    { id: 'shows', label: 'Shows' },
    { id: 'bars', label: 'Bars' }
  ];

  return (
    <div className="tabs-container">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`tab-button ${isActive ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
            aria-pressed={isActive}
            aria-label={`Show ${tab.label}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
});

const FilterChips = memo(({ activeFilters, onFilterChange }) => {
  const filters = [
    { id: 'this-week', label: 'This week', icon: 'calendar' },
    { id: 'location', label: 'Location', icon: 'user' },
    { id: 'music', label: 'Music', icon: 'music' },
    { id: 'free', label: 'Free', icon: 'tag' }
  ];

  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const chipsInnerRef = useRef(null);

  useEffect(() => {
    const checkScroll = () => {
      if (chipsInnerRef.current) {
        const { scrollWidth, clientWidth } = chipsInnerRef.current;
        setShowScrollIndicator(scrollWidth > clientWidth);
      }
    };

    checkScroll();
    const resizeObserver = new ResizeObserver(checkScroll);
    if (chipsInnerRef.current) {
      resizeObserver.observe(chipsInnerRef.current);
    }
    
    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="filter-chips">
      <div className="filter-chips-inner" ref={chipsInnerRef}>
        {filters.map(filter => {
          const isActive = activeFilters.includes(filter.id);
          return (
            <button
              key={filter.id}
              className={`filter-chip ${isActive ? 'active' : ''}`}
              onClick={() => onFilterChange(filter.id)}
              aria-pressed={isActive}
              aria-label={`Filter by ${filter.label}`}
            >
              <Icon name={filter.icon} size={14} color={isActive ? COLORS.black_01 : COLORS.white_01} />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
      {showScrollIndicator && (
        <div className="filter-scroll-indicator">
          <Icon name="right-arrow" size={16} color={COLORS.white_01} />
        </div>
      )}
    </div>
  );
});

const HighlightCard = memo(({ event }) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    if (event.link) {
      window.open(event.link, '_blank', 'noopener,noreferrer');
    } else if (event.id) {
      navigate(`/event?id=${event.id}`);
    }
  }, [event.link, event.id, navigate]);

  return (
    <div className="highlight-card" onClick={handleClick}>
      <div className="highlight-image">
        <img src={event.image_url} alt={event.name} />
        <div className="highlight-badge">
          <img src={profileImageGetter(event.profile_image)} alt={event.venue} className="highlight-badge-image" />
          <span>{event.venue}</span>
        </div>
      </div>
      <div className="highlight-info">
        <p className="highlight-date">{event.date}</p>
        <h4 className="highlight-title">{event.name}</h4>
      </div>
    </div>
  );
});

const HighlightsSection = memo(({ events }) => {
  return (
    <div className="highlights-section-new">
      <div className="highlights-header">
        <Icon name="eggplant-colorless" size={24} color={COLORS.white_01} />
        <h2>Selección Previate</h2>
      </div>
      <div className="highlights-scroll">
        {events.map(event => (
          <HighlightCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
});


const DateSectionCard = memo(({ event }) => {
  // Truncar el título a máximo 30 caracteres (27 + "...") con ">" al inicio
  const truncatedTitle = useMemo(() => {
    if (!event.name) return '';
    const title = event.name.length >= 30 
      ? event.name.substring(0, 27) + '...' 
      : event.name;
    return '>' + title;
  }, [event.name]);

  // Truncar la ubicación a máximo 24 caracteres
  const truncatedLocation = useMemo(() => {
    if (!event.location) return '';
    return event.location.length > 24 
      ? event.location.substring(0, 24) + '...' 
      : event.location;
  }, [event.location]);

  // Construir la URL de Google Maps
  const googleMapsUrl = useMemo(() => {
    if (!event.location_full) return null;
    const encodedLocation = encodeURIComponent(event.location_full);
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  }, [event.location_full]);

  const navigate = useNavigate();

  const handleCardClick = useCallback((e) => {
    // No abrir el link si se hace clic en el botón de tickets o en el link de mapa
    if (e.target.closest('.tickets-button') || e.target.closest('.date-card-map-link') || e.target.closest('.date-card-favorite')) {
      return;
    }
    if (event.link) {
      window.open(event.link, '_blank', 'noopener,noreferrer');
    } else if (event.id) {
      navigate(`/event?id=${event.id}`);
    }
  }, [event.link, event.id, navigate]);

  const handleTicketsClick = useCallback((e) => {
    e.stopPropagation();
    if (event.link) {
      window.open(event.link, '_blank', 'noopener,noreferrer');
    } else if (event.id) {
      navigate(`/event?id=${event.id}`);
    }
  }, [event.link, event.id, navigate]);

  const hasLink = !!event.link;

  return (
    <div className={`date-section-card ${!hasLink ? 'date-section-card-no-link' : ''}`} onClick={handleCardClick}>
      <div className="date-card-image">
        <img src={event.image_url} alt={event.name} />
      </div>
      <div className="date-card-content">
        <div className="date-card-top">
          <div className="date-card-header-data">
            <p className="date-card-username">{event.username || ''}</p>
            <div className="date-card-location-container">
              <p className="date-card-location">{truncatedLocation}</p>
              {googleMapsUrl && (
                <a 
                  href={googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="date-card-map-link"
                >
                  VIEW MAP
                </a>
              )}
            </div>
          </div>
          <div className="date-card-social">
            <button className="date-card-favorite">
              <Icon name="eggplant-colorless" size={18} color={COLORS.white_02} />
            </button>
          </div>
        </div>
        <div className="date-card-center">
          <button className="tickets-button" onClick={handleTicketsClick}>
            <span>Tickets</span>
            <span className="tickets-icon">
              <Icon name="right-arrow" size={14} color={hasLink ? COLORS.black_01 : COLORS.purple_01} />
            </span>
          </button>
        </div>
        <h3 className="date-card-name">{truncatedTitle}</h3>
      </div>
    </div>
  );
});

const DateSection = memo(({ date, events, originalDate }) => {
  // Verificar si la fecha es hoy
  const isToday = useMemo(() => {
    if (!originalDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parsear la fecha original (formato: YYYY-MM-DD)
    const [year, month, day] = originalDate.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day);
    eventDate.setHours(0, 0, 0, 0);
    
    return today.getTime() === eventDate.getTime();
  }, [originalDate]);

  return (
    <div className={`date-section ${isToday ? 'date-section-today' : ''}`}>
      <h2 className={`date-section-title ${isToday ? 'date-section-title-today' : ''}`}>
        {isToday ? 'TODAYS PLANS' : date}
      </h2>
      <div className="date-section-list">
        {events.map(event => (
          <DateSectionCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
});

const ListLoading = memo(() => (
  <div className="loading-container">
    <div className="spinner" />
  </div>
));

const ListEmpty = memo(() => {
  return (
    <div className="empty-container">
      <Icon name="world" size={250} color={COLORS.purple_01} />
      <h2 className="empty-title">No hay eventos disponibles</h2>
      <p className="empty-subtitle">Vuelve pronto para ver nuevos eventos</p>
    </div>
  );
});

const ListError = memo(({ onRetry }) => {
  return (
    <div className="error-container">
      <Icon name="close" size={128} color={COLORS.white_01} />
      <h2 className="error">Ocurrió un error</h2>
      <p className="sub-error">Por favor, intenta de nuevo</p>
      <button className="error-button" onClick={onRetry}>
        <span>Reintentar</span>
      </button>
    </div>
  );
});

// ============== HOOKS PERSONALIZADOS ==============

function usePaginatedEvents(endpoint, filter, token) {
  const fetcher = useCallback(async ({ pageParam = undefined }) => {
    const requestParams = {};
    
    if (pageParam) {
      requestParams.cursor = JSON.stringify(pageParam);
    }
    
    let processedFilter = { ...filter };
    if (processedFilter.tags?.value && Array.isArray(processedFilter.tags.value)) {
      processedFilter.tags = processedFilter.tags.value.join(",");
    }
    if (processedFilter.music?.value && Array.isArray(processedFilter.music.value)) {
      processedFilter.music = processedFilter.music.value.join(",");
    }
    
    requestParams.filters = JSON.stringify(processedFilter);
    
    // Solo incluir el header de autorización si el token existe y es válido
    const config = { params: requestParams };
    if (token && typeof token === 'string' && token.trim() !== '') {
      config.headers = { authorization: token };
    }
    
    const res = await makeRequest.get(endpoint, config);
    
    const data = res.data || [];
    const lastEvent = data[data.length - 1];
    const hasMore = data.length >= 20 && lastEvent;
    
    return {
      data,
      nextCursor: hasMore 
        ? { date_cursor: lastEvent.date?.split(" ")[0], priority_cursor: lastEvent.priority, id_cursor: lastEvent.id }
        : undefined,
    };
  }, [endpoint, filter, token]);

  return useInfiniteQuery({
    queryKey: [endpoint, filter, token],
    queryFn: fetcher,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    placeholderData: (previousData) => previousData,
    staleTime: 10000,
    gcTime: 300000,
  });
}

// ============== COMPONENTE PRINCIPAL ==============

const Events = () => {
  const [activeTab, setActiveTab] = useState('partys');
  const [activeFilters, setActiveFilters] = useState(['this-week']);
  
  const { filter: contextFilter } = useFilter();
  const { authState } = useAuth();
  const listRef = useRef(null);
  const observerRef = useRef(null);

  const filter = useMemo(() => ({
    location: contextFilter.location,
    latest: contextFilter.latest,
    music: contextFilter.music,
    free: contextFilter.free,
    date: contextFilter.date,
    tags: contextFilter.tags,
    ages: contextFilter.ages,
  }), [contextFilter]);

  // Highlights hardcodeados
  const highlights = useMemo(() => [
    {
      id: 1,
      name: "Proyecto X",
      venue: "nightFull",
      date: "02/12/2024 -- 23.55hs",
      image_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop",
      profile_image: "17593578830593862.jpg",
      link: null,
    },
    {
      id: 2,
      name: "Domingo full",
      venue: "fest",
      date: "02/12/2024 -- 23.55hs",
      image_url: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=300&fit=crop",
      profile_image: "17587174399557208.jpg",
      link: null,
    },
    {
      id: 3,
      name: ">Good Night",
      venue: "club",
      date: "02/12/2024 -- 23.55hs",
      image_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop",
      profile_image: "17587169103117315.jpg",
      link: null,
    }
  ], []);


  // Obtener eventos del servidor
  const { 
    data: eventsData, 
    isLoading: eventsLoading, 
    fetchNextPage: eventsFetchNextPage, 
    hasNextPage: eventsHasNextPage, 
    refetch: eventsRefetch, 
    isError: eventsError, 
    isFetchingNextPage: eventsFetchingNextPage 
  } = usePaginatedEvents("events", filter, authState.token);

  // Procesar eventos de la API y agruparlos por fecha
  const dateEvents = useMemo(() => {
    if (!eventsData?.pages) return {};

    // Aplanar todos los eventos de todas las páginas
    const allEvents = eventsData.pages.flatMap(page => page.data || []);

    // Agrupar eventos por fecha
    const groupedByDate = {};
    
    allEvents.forEach(event => {
      if (!event.date) return;
      
      const formattedDate = dateOnlyFormatter(event.date);
      const originalDate = event.date.split(' ')[0]; // Obtener solo la parte de la fecha (YYYY-MM-DD)
      
      if (!groupedByDate[formattedDate]) {
        groupedByDate[formattedDate] = {
          events: [],
          originalDate: originalDate
        };
      }
      
      // Construir la URL de la imagen
      const imageUrl = event.image 
        ? `https://api.previateesta.com/image/event/${event.image}`
        : null;
      
      groupedByDate[formattedDate].events.push({
        id: event.id,
        name: event.title || '',
        username: event.username || '',
        location: event.location_text || '',
        location_full: event.location_text || '', // Guardar la ubicación completa para Google Maps
        image_url: imageUrl,
        link: event.link || null
      });
    });

    return groupedByDate;
  }, [eventsData]);

  // Infinite scroll observer
  useEffect(() => {
    // Limpiar observer anterior si existe
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // No crear observer si no hay más páginas o está cargando
    if (!eventsHasNextPage || eventsFetchingNextPage) return;

    // Crear nuevo observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && eventsHasNextPage && !eventsFetchingNextPage) {
          eventsFetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    // Observar el elemento trigger
    const target = document.querySelector('.scroll-trigger');
    if (target && observerRef.current) {
      observerRef.current.observe(target);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [eventsHasNextPage, eventsFetchingNextPage, eventsFetchNextPage]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleFilterChange = useCallback((filterId) => {
    setActiveFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(f => f !== filterId);
      }
      return [...prev, filterId];
    });
  }, []);

  const handleRetry = useCallback(() => {
    eventsRefetch();
  }, [eventsRefetch]);

  if (eventsError) {
    return (
      <div id="Events">
        <div className="main-container-new">
          <Header />
          <ListError onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div id="Events">
      <div className="main-container-new" ref={listRef}>
        <Header />
        <Tabs activeTab={activeTab} onChange={handleTabChange} />
        <FilterChips activeFilters={activeFilters} onFilterChange={handleFilterChange} />
        
        <div className="content-scroll">
          <HighlightsSection events={highlights} />
          
          {!eventsLoading && Object.keys(dateEvents).length > 0 && (
            Object.entries(dateEvents).map(([date, dateData]) => (
              <DateSection 
                key={date} 
                date={date} 
                events={dateData.events} 
                originalDate={dateData.originalDate}
              />
            ))
          )}

          {eventsLoading && eventsData?.pages?.length === 0 && <ListLoading />}
          {!eventsLoading && eventsData?.pages?.length === 0 && <ListEmpty />}
          
          {eventsFetchingNextPage && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <ListLoading />
            </div>
          )}
          
          {eventsHasNextPage && <div className="scroll-trigger" />}
        </div>
      </div>
    </div>
  );
};

export default Transition(Events);
