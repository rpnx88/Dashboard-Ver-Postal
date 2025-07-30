
import React from 'react';
import { LegislativeMatter } from '../types';
import IndicationCard from './IndicationCard';

interface IndicationsListProps {
    indications: LegislativeMatter[];
}

const IndicationsList: React.FC<IndicationsListProps> = ({ indications }) => {
    if (indications.length === 0) {
        return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhuma indicação encontrada para a categoria selecionada.</div>
    }
    
    return (
        <div className="space-y-4">
            {indications.map((indication) => (
                <IndicationCard key={indication.id} indication={indication} />
            ))}
        </div>
    );
};

export default IndicationsList;
