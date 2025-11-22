import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Language = 'tr' | 'en' | 'de' | 'es';

export const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

export const translations = {
  tr: {
    searchPlaceholder: "GitHub kullanıcı adı ara...",
    searchPlaceholderMobile: "Kullanıcı adı...",
    searchButton: "Ara",
    notFound: "Kullanıcı veya ilgili depo bulunamadı.",
    connectionError: "Bir bağlantı hatası oluştu.",
    fetching: "GitHub verileri getiriliyor...",
    errorTitle: "Hata Oluştu",
    heroTitle: "InstantGitHub",
    heroSubtitle: "Kullanıcıları arayın, depoları inceleyin ve yapay zeka ile kod analizleri alın.",
    followers: "Takipçi",
    following: "Takip",
    repos: "Depolar",
    joined: "Üyelik",
    sortedBy: "Son güncellenene göre sıralandı",
    noRepos: "Bu kullanıcının hiç açık deposu yok.",
    private: "Gizli",
    public: "Herkese Açık",
    noDesc: "Açıklama bulunmuyor.",
    // Modal
    overview: "Genel Bakış & Readme",
    aiAnalysis: "Gemini AI Analizi",
    created: "Oluşturulma",
    size: "Boyut",
    license: "Lisans",
    defaultBranch: "Varsayılan Dal",
    readmePreview: "README.md Önizleme",
    readmeEmpty: "Readme bulunamadı veya boş.",
    viewFull: "Tamamı için repoya gidin",
    analyzeTitle: "Gemini AI ile Analiz Et",
    analyzeDesc: "Bu depoyu, teknolojilerini ve kullanım senaryolarını yapay zeka ile saniyeler içinde analiz edin.",
    analyzeBtn: "Analizi Başlat",
    analyzing: "Repo analiz ediliyor...",
    analyzingDesc: "Readme okunuyor, kod yapısı inceleniyor.",
    analyzeError: "Bir hata oluştu.",
    retry: "Tekrar Dene",
    aiSummary: "AI Özeti",
    complexity: "Karmaşıklık Skoru",
    techStack: "Teknoloji Analizi",
    useCases: "Önerilen Kullanım Senaryoları",
    // Global
    language: "Dil",
    // Archive Search -> Changed to Repositories/Results
    archiveResults: "Depolar",
    archiveBio: "'{query}' araması için bulunan popüler depolar.",
    archiveLocation: "Global Arama",
    // New Banner
    searchAsRepoQuestion: "Bunu depolarda aramak istiyor musunuz?",
    yesButton: "Evet",
    // Pagination & Long Desc
    loadMore: "Daha Fazla Göster",
    longDescWarning: "Bu deponun açıklaması çok uzun, görmek ister misiniz?",
    yesShow: "Evet, Göster"
  },
  en: {
    searchPlaceholder: "Search GitHub username...",
    searchPlaceholderMobile: "Username...",
    searchButton: "Search",
    notFound: "User or relevant repository not found.",
    connectionError: "A connection error occurred.",
    fetching: "Fetching GitHub data...",
    errorTitle: "Error Occurred",
    heroTitle: "InstantGitHub",
    heroSubtitle: "Search users, explore repositories, and get code analysis with AI.",
    followers: "Followers",
    following: "Following",
    repos: "Repositories",
    joined: "Joined",
    sortedBy: "Sorted by recently updated",
    noRepos: "This user has no public repositories.",
    private: "Private",
    public: "Public",
    noDesc: "No description available.",
    // Modal
    overview: "Overview & Readme",
    aiAnalysis: "Gemini AI Analysis",
    created: "Created",
    size: "Size",
    license: "License",
    defaultBranch: "Default Branch",
    readmePreview: "README.md Preview",
    readmeEmpty: "Readme not found or empty.",
    viewFull: "Go to repo for full readme",
    analyzeTitle: "Analyze with Gemini AI",
    analyzeDesc: "Analyze this repository, its technologies, and use cases in seconds with AI.",
    analyzeBtn: "Start Analysis",
    analyzing: "Analyzing repo...",
    analyzingDesc: "Reading Readme, examining code structure.",
    analyzeError: "An error occurred.",
    retry: "Try Again",
    aiSummary: "AI Summary",
    complexity: "Complexity Score",
    techStack: "Tech Stack Analysis",
    useCases: "Suggested Use Cases",
    // Global
    language: "Language",
    // Archive Search -> Changed to Repositories/Results
    archiveResults: "Repositories",
    archiveBio: "Popular repositories found for '{query}'.",
    archiveLocation: "Global Search",
    // New Banner
    searchAsRepoQuestion: "Do you want to search for this in repositories?",
    yesButton: "Yes",
    // Pagination & Long Desc
    loadMore: "Load More",
    longDescWarning: "Description is very long, do you want to see it?",
    yesShow: "Yes, Show"
  },
  de: {
    searchPlaceholder: "GitHub-Benutzernamen suchen...",
    searchPlaceholderMobile: "Benutzername...",
    searchButton: "Suchen",
    notFound: "Benutzer oder Repository nicht gefunden.",
    connectionError: "Ein Verbindungsfehler ist aufgetreten.",
    fetching: "GitHub-Daten werden abgerufen...",
    errorTitle: "Fehler aufgetreten",
    heroTitle: "InstantGitHub",
    heroSubtitle: "Benutzer suchen, Repositories erkunden und Code-Analysen mit KI erhalten.",
    followers: "Follower",
    following: "Folgt",
    repos: "Repositories",
    joined: "Beigetreten",
    sortedBy: "Sortiert nach Aktualisierung",
    noRepos: "Dieser Benutzer hat keine öffentlichen Repositories.",
    private: "Privat",
    public: "Öffentlich",
    noDesc: "Keine Beschreibung verfügbar.",
    // Modal
    overview: "Übersicht & Readme",
    aiAnalysis: "Gemini KI-Analyse",
    created: "Erstellt",
    size: "Größe",
    license: "Lizenz",
    defaultBranch: "Standard-Branch",
    readmePreview: "README.md Vorschau",
    readmeEmpty: "Readme nicht gefunden oder leer.",
    viewFull: "Zum Repo für vollständige Readme",
    analyzeTitle: "Mit Gemini KI analysieren",
    analyzeDesc: "Analysieren Sie dieses Repository, seine Technologien und Anwendungsfälle in Sekunden mit KI.",
    analyzeBtn: "Analyse starten",
    analyzing: "Repo wird analysiert...",
    analyzingDesc: "Readme wird gelesen, Code-Struktur untersucht.",
    analyzeError: "Ein Fehler ist aufgetreten.",
    retry: "Erneut versuchen",
    aiSummary: "KI-Zusammenfassung",
    complexity: "Komplexitätsbewertung",
    techStack: "Tech-Stack-Analyse",
    useCases: "Vorgeschlagene Anwendungsfälle",
    // Global
    language: "Sprache",
    // Archive Search
    archiveResults: "Repositories",
    archiveBio: "Beliebte Repositories für '{query}' gefunden.",
    archiveLocation: "Globale Suche",
    // New Banner
    searchAsRepoQuestion: "Möchten Sie dies in Repositories suchen?",
    yesButton: "Ja",
    // Pagination & Long Desc
    loadMore: "Mehr laden",
    longDescWarning: "Beschreibung ist sehr lang, möchten Sie sie sehen?",
    yesShow: "Ja, Anzeigen"
  },
  es: {
    searchPlaceholder: "Buscar nombre de usuario de GitHub...",
    searchPlaceholderMobile: "Usuario...",
    searchButton: "Buscar",
    notFound: "Usuario o repositorio no encontrado.",
    connectionError: "Ocurrió un error de conexión.",
    fetching: "Obteniendo datos de GitHub...",
    errorTitle: "Ocurrió un error",
    heroTitle: "InstantGitHub",
    heroSubtitle: "Busca usuarios, explora repositorios y obtén análisis de código con IA.",
    followers: "Seguidores",
    following: "Siguiendo",
    repos: "Repositorios",
    joined: "Se unió",
    sortedBy: "Ordenado por actualización reciente",
    noRepos: "Este usuario no tiene repositorios públicos.",
    private: "Privado",
    public: "Público",
    noDesc: "No hay descripción disponible.",
    // Modal
    overview: "Resumen y Readme",
    aiAnalysis: "Análisis de Gemini AI",
    created: "Creado",
    size: "Tamaño",
    license: "Licencia",
    defaultBranch: "Rama por defecto",
    readmePreview: "Vista previa de README.md",
    readmeEmpty: "Readme no encontrado o vacío.",
    viewFull: "Ir al repo para ver readme completo",
    analyzeTitle: "Analizar con Gemini AI",
    analyzeDesc: "Analiza este repositorio, sus tecnologías y casos de uso en segundos con IA.",
    analyzeBtn: "Iniciar análisis",
    analyzing: "Analizando repo...",
    analyzingDesc: "Leyendo Readme, examinando estructura del código.",
    analyzeError: "Ocurrió un error.",
    retry: "Intentar de nuevo",
    aiSummary: "Resumen de IA",
    complexity: "Puntuación de complejidad",
    techStack: "Análisis de Tech Stack",
    useCases: "Casos de uso sugeridos",
    // Global
    language: "Idioma",
    // Archive Search
    archiveResults: "Repositorios",
    archiveBio: "Repositorios populares encontrados para '{query}'.",
    archiveLocation: "Búsqueda Global",
    // New Banner
    searchAsRepoQuestion: "¿Quieres buscar esto en repositorios?",
    yesButton: "Sí",
    // Pagination & Long Desc
    loadMore: "Cargar más",
    longDescWarning: "La descripción es muy larga, ¿quieres verla?",
    yesShow: "Sí, mostrar"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.tr;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    // Default to 'en' if no language is saved
    return (saved === 'en' || saved === 'tr' || saved === 'de' || saved === 'es') ? (saved as Language) : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};