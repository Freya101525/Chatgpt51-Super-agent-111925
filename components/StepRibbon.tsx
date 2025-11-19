import React from 'react';
import { TRANSLATIONS } from '../constants';
import { AppState, Theme } from '../types';

interface StepRibbonProps {
    currentStep: number;
    setStep: (step: number) => void;
    state: AppState;
    theme: Theme;
}

export const StepRibbon: React.FC<StepRibbonProps> = ({ currentStep, setStep, state, theme }) => {
    const t = TRANSLATIONS[state.language];
    const steps = [
        { id: 0, label: t.upload_tab, icon: "📂" },
        { id: 1, label: t.preview_tab, icon: "📝" },
        { id: 2, label: t.config_tab, icon: "⚙️" },
        { id: 3, label: t.execute_tab, icon: "🚀" },
        { id: 4, label: t.dashboard_tab, icon: "📊" },
        { id: 5, label: t.notes_tab, icon: "📓" },
    ];

    return (
        <div className={`w-full overflow-x-auto pb-2 mb-6`}>
            <div className={`inline-flex p-1 rounded-full backdrop-blur-md border ${state.darkMode ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/40 shadow-sm'}`}>
                {steps.map((step) => {
                    const isActive = currentStep === step.id;
                    return (
                        <button
                            key={step.id}
                            onClick={() => setStep(step.id)}
                            className={`
                                flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap
                                ${isActive ? 'shadow-lg transform scale-105' : 'hover:bg-black/5 opacity-70 hover:opacity-100'}
                            `}
                            style={{
                                background: isActive ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : 'transparent',
                                color: isActive ? 'white' : (state.darkMode ? 'white' : '#4b5563')
                            }}
                        >
                            <span className="text-lg">{step.icon}</span>
                            {step.label.split(') ')[1]} 
                        </button>
                    );
                })}
            </div>
        </div>
    );
};