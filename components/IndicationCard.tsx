import React from 'react';
import { LegislativeMatter, Category } from '../types';
import { PinIcon, CalendarIcon, PdfIcon, TagIcon, UserIcon } from './icons';

interface IndicationCardProps {
    indication: LegislativeMatter;
}

const categoryColorMap: { [key in Category]: string } = {
    [Category.UrbanInfrastructure]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    [Category.EnvironmentAndSanitation]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    [Category.MobilityAndTransit]: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    [Category.PublicServices]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    [Category.PublicSafety]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    [Category.CommunitySpaces]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

const IndicationCard: React.FC<IndicationCardProps> = ({ indication }) => {
    return (
        <div className="bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1">
            <div className="flex justify-between items-start flex-wrap gap-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{indication.id}</h3>
                <span className={`text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full ${categoryColorMap[indication.category]} shrink-0`}>
                    {indication.category}
                </span>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{indication.summary}</p>
            
            <div className="mt-4 border-t border-gray-200 dark:border-slate-600 pt-3">
                 <div className="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <PinIcon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span>{indication.location.address}{indication.location.neighborhood ? `, ${indication.location.neighborhood}` : ''}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{indication.presentationDate}</span>
                    </div>
                    <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{indication.author}</span>
                    </div>
                    <div className="flex items-center">
                        <TagIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Protocolo: {indication.protocol}</span>
                    </div>
                    <a 
                        href={indication.pdfLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        <PdfIcon className="w-4 h-4 mr-2" />
                        <span>Ver PDF</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default IndicationCard;