import React, { useState, useRef, useEffect } from 'react';
import './MultiSelectField.css';

interface MultiSelectProps {
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

export const MultiSelectField = ({ label, options, selectedValues, onChange, placeholder }: MultiSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        const newValues = selectedValues.includes(option)
            ? selectedValues.filter(v => v !== option)
            : [...selectedValues, option];
        onChange(newValues);
    };

    return (
        <div className="form-group multi-select-group" ref={containerRef}>
            <label>{label}</label>
            <div className="multi-select-container">
                <div 
                    className={`selected-tags-box ${isOpen ? 'active-border' : ''}`} 
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {selectedValues.length > 0 ? (
                        selectedValues.map(val => (
                            <span key={val} className="tag-item">
                                {val} 
                                <span className="remove-tag" onClick={(e) => { e.stopPropagation(); toggleOption(val); }}>✕</span>
                            </span>
                        ))
                    ) : (
                        <span className="placeholder-text">{placeholder || 'Select...'}</span>
                    )}
                </div>
                
                {isOpen && (
                    <div className="options-dropdown">
                        {options.length > 0 ? (
                            options.map(opt => (
                                <div 
                                    key={opt} 
                                    className={`option-item ${selectedValues.includes(opt) ? 'selected' : ''}`}
                                    onClick={() => toggleOption(opt)}
                                >
                                    {opt}
                                    {selectedValues.includes(opt) && <span className="check-mark">✓</span>}
                                </div>
                            ))
                        ) : (
                            <div className="no-options">No options available</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};