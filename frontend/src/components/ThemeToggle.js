import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative w-16 h-8 rounded-full p-1 transition-colors ${
                isDark 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
                    : 'bg-gradient-to-r from-yellow-400 to-orange-400'
            }`}
        >
            {/* Switch animado */}
            <motion.div
                animate={{ x: isDark ? 32 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
            >
                {isDark ? (
                    <Moon size={14} className="text-indigo-600" />
                ) : (
                    <Sun size={14} className="text-orange-500" />
                )}
            </motion.div>

            {/* Iconos de fondo */}
            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                <Sun size={14} className={`${isDark ? 'text-purple-300' : 'text-white'}`} />
                <Moon size={14} className={`${isDark ? 'text-white' : 'text-orange-300'}`} />
            </div>
        </motion.button>
    );
};

export default ThemeToggle;