import React from 'react';
import { GovIcon, MoonIcon, SunIcon } from './icons';

interface HeaderProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
    return (
        <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                    <GovIcon className="h-10 w-10 text-blue-600 dark:text-blue-400 mr-4"/>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                            Dashboard Legislativo
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Câmara Municipal de Bento Gonçalves - Análise de Indicações
                        </p>
                    </div>
                </div>
                 <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-colors"
                    aria-label="Alternar modo claro/escuro"
                >
                    {isDarkMode ? (
                        <SunIcon className="w-6 h-6 text-yellow-400" />
                    ) : (
                        <MoonIcon className="w-6 h-6 text-slate-700" />
                    )}
                </button>
            </div>
        </header>
    );
};

export default Header;