import React from 'react';
import { FLOWER_THEMES, TRANSLATIONS } from '../constants';
import { AppState } from '../types';

interface SidebarProps {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, setState, isOpen }) => {
    const t = TRANSLATIONS[state.language];
    const currentTheme = FLOWER_THEMES[state.theme];

    const updateKey = (provider: keyof AppState['apiKeys'], value: string) => {
        setState(prev => ({
            ...prev,
            apiKeys: { ...prev.apiKeys, [provider]: value }
        }));
    };

    if (!isOpen) return null;

    return (
        <div 
            className={`fixed left-0 top-0 h-full w-80 ${state.darkMode ? 'bg-gray-900/95 text-white border-r border-white/10' : 'bg-white/95 text-gray-800 border-r border-pink-100'} backdrop-blur-xl z-50 transition-transform duration-300 shadow-2xl overflow-y-auto p-6`}
        >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: currentTheme.accent }}>
                <span>⚙️</span> {t.theme_selector}
            </h2>

            <div className="space-y-4 mb-8">
                {Object.values(FLOWER_THEMES).map((theme) => (
                    <button
                        key={theme.name}
                        onClick={() => setState(prev => ({ ...prev, theme: theme.name }))}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${state.theme === theme.name ? 'ring-2 ring-offset-2' : 'hover:bg-black/5'}`}
                        style={{ 
                            background: state.theme === theme.name ? `${theme.primary}20` : 'transparent',
                            borderColor: theme.accent,
                            ringColor: theme.accent
                        }}
                    >
                        <span className="text-2xl">{theme.icon}</span>
                        <span className="font-medium">{theme.name}</span>
                    </button>
                ))}
            </div>

            <div className="h-px w-full bg-current opacity-10 mb-6"></div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <span className="font-medium">{t.dark_mode}</span>
                    <button 
                        onClick={() => setState(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                        className={`w-12 h-6 rounded-full transition-colors duration-300 flex items-center px-1 ${state.darkMode ? 'bg-purple-600' : 'bg-gray-300'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${state.darkMode ? 'translate-x-6' : ''}`}></div>
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <span className="font-medium">{t.language}</span>
                    <select 
                        value={state.language}
                        onChange={(e) => setState(prev => ({ ...prev, language: e.target.value as 'zh_TW' | 'en' }))}
                        className={`px-3 py-1 rounded-lg border ${state.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    >
                        <option value="zh_TW">繁體中文</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>

            <div className="h-px w-full bg-current opacity-10 my-6"></div>

            <h3 className="font-bold mb-4">API Keys</h3>
            <div className="space-y-3">
                {['openai', 'gemini', 'grok', 'anthropic'].map(provider => (
                    <div key={provider} className="space-y-1">
                        <div className="flex justify-between text-xs opacity-70">
                            <span className="capitalize">{provider}</span>
                            <span className={state.apiKeys[provider as keyof typeof state.apiKeys] ? 'text-green-500' : 'text-red-400'}>
                                {state.apiKeys[provider as keyof typeof state.apiKeys] ? t.connected : t.not_connected}
                            </span>
                        </div>
                        <input 
                            type="password"
                            placeholder={`Enter ${provider} key`}
                            value={state.apiKeys[provider as keyof typeof state.apiKeys]}
                            onChange={(e) => updateKey(provider as keyof AppState['apiKeys'], e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg text-sm border transition-all focus:ring-2 focus:outline-none ${state.darkMode ? 'bg-gray-800 border-gray-700 focus:ring-purple-500' : 'bg-white border-gray-200 focus:ring-pink-300'}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};