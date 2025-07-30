
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { LegislativeMatter, Category } from './types';
// import { legislativeData } from './data/processedData'; // Removido
import Header from './components/Header';
import CategoryChart from './components/CategoryChart';
import IndicationsList from './components/IndicationsList';
import Toast from './components/Toast';
import { ChartIcon, ListIcon, SearchIcon, SyncIcon, XCircleIcon, GovIcon } from './components/icons';

const ptMonths: { [key: string]: number } = {
    'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3, 'maio': 4, 'junho': 5,
    'julho': 6, 'agosto': 7, 'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
};

const parsePtDate = (dateString: string): Date => {
    try {
        const dateParts = dateString.split(' ')[0].split('/');
        if (dateParts.length === 3) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]) - 1;
            const year = parseInt(dateParts[2]);
            return new Date(year, month, day);
        }
        // Fallback for "30 de Julho de 2025" format
        const parts = dateString.toLowerCase().split(' de ');
        if (parts.length < 3) return new Date(0);
        const day = parseInt(parts[0]);
        const monthName = parts[1];
        const year = parseInt(parts[2]);
        const month = ptMonths[monthName];
        if (isNaN(day) || isNaN(year) || month === undefined) return new Date(0);
        return new Date(year, month, day);
    } catch (e) {
        console.error("Failed to parse date:", dateString, e);
        return new Date(0);
    }
};


const App: React.FC = () => {
    const [allData, setAllData] = useState<LegislativeMatter[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<Category | 'Todas'>('Todas');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<'date' | 'id'>('id');
    
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'info'>('info');

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme') === 'dark';
        }
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/indications');

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({
                        message: `Erro no servidor: ${response.status} ${response.statusText}`
                    }));
                    throw new Error(errorData.message || 'Falha ao buscar os dados das indicações.');
                }

                const data: LegislativeMatter[] = await response.json();
                
                if (!data || data.length === 0) {
                    throw new Error("Nenhuma indicação foi encontrada. Verifique se há dados disponíveis na fonte.");
                }

                setAllData(data);
                setLastUpdated(new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }));
            } catch (err: any) {
                setError(err.message);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const handleSelectCategory = useCallback((category: Category | 'Todas') => {
        const newCategory = selectedCategory === category ? 'Todas' : category;
        setSelectedCategory(newCategory);
    }, [selectedCategory]);

    const filteredAndSortedData = useMemo(() => {
        let data = [...allData];

        if (selectedCategory !== 'Todas') {
            data = data.filter(item => item.category === selectedCategory);
        }

        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            data = data.filter(item =>
                item.id.toLowerCase().includes(lowercasedQuery) ||
                item.summary.toLowerCase().includes(lowercasedQuery) ||
                (item.location.address && item.location.address.toLowerCase().includes(lowercasedQuery)) ||
                (item.location.neighborhood && item.location.neighborhood.toLowerCase().includes(lowercasedQuery)) ||
                item.protocol.toLowerCase().includes(lowercasedQuery)
            );
        }
        
        data.sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = parsePtDate(a.presentationDate).getTime();
                const dateB = parsePtDate(b.presentationDate).getTime();
                return dateB - dateA;
            }
            if (sortBy === 'id') {
                const [, idPartA] = a.id.split(' ');
                const [numA, yearA] = idPartA.split('/').map(Number);
                const [, idPartB] = b.id.split(' ');
                const [numB, yearB] = idPartB.split('/').map(Number);
                if (yearA !== yearB) return yearB - yearA;
                return numB - numA;
            }
            return 0;
        });

        return data;
    }, [allData, selectedCategory, searchQuery, sortBy]);

    const categoryCounts = useMemo(() => {
        const counts = allData.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {} as Record<Category, number>);

        return Object.entries(counts).map(([name, value]) => ({
            name: name as Category,
            value,
        }));
    }, [allData]);
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200">
                <GovIcon className="h-16 w-16 text-blue-600 dark:text-blue-400 animate-pulse" />
                <p className="mt-4 text-lg font-semibold">Carregando dados atualizados...</p>
            </div>
        );
    }

    if (error) {
         return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-slate-900 text-red-600 dark:text-red-400 p-4 text-center">
                <XCircleIcon className="h-16 w-16" />
                <p className="mt-4 text-lg font-semibold">Ocorreu um erro:</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200 font-sans">
            {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
            <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-1 w-full">
                <div className="flex flex-col gap-8">
                    {/* Chart Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <ChartIcon className="w-6 h-6 mr-3 text-blue-500" />
                            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100">Indicações por Categoria</h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Clique em uma barra para filtrar a lista.</p>
                        <div className="h-[400px]">
                           <CategoryChart data={categoryCounts} onSelectCategory={handleSelectCategory} selectedCategory={selectedCategory} />
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                        <div className="flex items-baseline justify-between flex-wrap gap-y-4 mb-4">
                             <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                                <div className="flex items-center">
                                    <ListIcon className="w-6 h-6 mr-3 text-blue-500" />
                                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100">
                                        {selectedCategory === 'Todas' ? 'Todas as Indicações' : `Indicações de ${selectedCategory}`}
                                    </h2>
                                </div>
                                {selectedCategory !== 'Todas' && (
                                     <button onClick={() => setSelectedCategory('Todas')} className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                         <XCircleIcon className="w-4 h-4 mr-1"/>
                                         Limpar filtro
                                     </button>
                                )}
                            </div>
                            <div className="flex items-center gap-x-4">
                                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-semibold px-3 py-1 rounded-full">
                                    {filteredAndSortedData.length} Encontradas
                                </span>
                                <div className="flex items-center gap-x-2 text-xs text-gray-500 dark:text-gray-400">
                                    {lastUpdated && (
                                        <span className="shrink-0">
                                            Atualizado: {lastUpdated}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="relative flex-grow">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <SearchIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar por ID, ementa, local..."
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-sm text-gray-900 transition focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            <div className="flex-shrink-0">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'date' | 'id')}
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 transition focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400"
                                    aria-label="Ordenar por"
                                >
                                    <option value="id">ID da Indicação</option>
                                    <option value="date">Mais Recentes</option>
                                </select>
                            </div>
                         </div>
                        <IndicationsList indications={filteredAndSortedData} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
