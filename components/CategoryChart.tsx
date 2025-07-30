

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { CategoryData, Category } from '../types';

interface CategoryChartProps {
    data: CategoryData[];
    onSelectCategory: (category: Category | 'Todas') => void;
    selectedCategory: Category | 'Todas';
}

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-700 p-2 border border-gray-200 dark:border-slate-600 rounded shadow-lg">
                <p className="font-bold">{`${label}`}</p>
                <p className="text-blue-500">{`Total: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const CategoryChart: React.FC<CategoryChartProps> = ({ data, onSelectCategory, selectedCategory }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    tick={{ fill: '#9ca3af', fontSize: 11, width: 100 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}/>
                <Bar dataKey="value" barSize={20} onClick={(d) => onSelectCategory(d.name as Category)}>
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            opacity={selectedCategory === 'Todas' || selectedCategory === entry.name ? 1 : 0.4}
                            className="cursor-pointer transition-opacity duration-300"
                        />
                    ))}
                    <LabelList 
                        dataKey="value" 
                        position="right" 
                        offset={5} 
                        className="fill-gray-700 dark:fill-gray-300"
                        fontSize={12}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default CategoryChart;