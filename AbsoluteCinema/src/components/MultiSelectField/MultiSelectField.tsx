import React, { useState, useRef, useEffect } from 'react';
import './MultiSelectField.css';

interface MultiSelectProps {
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    onAddNew?: () => void;
    showAddButton?: boolean;
}

export const MultiSelectField = ({ label, options, selectedValues, onChange, placeholder, onAddNew, showAddButton }: MultiSelectProps) => {
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
            <div className="label-with-button">
                <label>{label}</label>
                {showAddButton && onAddNew && (
                    <button type="button" className="add-button" onClick={onAddNew} title={`Add new ${label}`}>
                        + Add New
                    </button>
                )}
            </div>
            <div className="multi-select-container">
                <div
                    className={`selected-tags-box ${isOpen ? 'active-border' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {selectedValues.length > 0 ? (
                        selectedValues.map((val, index) => (
                            <span key={`${val}-${index}`} className="tag-item">
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
                            options.map((opt, index) => {
                                const displayValue = typeof opt === 'object' ? (opt as any).personName : opt;
                                const isSelected = selectedValues.includes(displayValue);

                                return (
                                    <div
                                        key={typeof opt === 'object' ? (opt as any).personId : `${opt}-${index}`}
                                        className={`option-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleOption(displayValue)}
                                    >
                                        {displayValue}
                                        {isSelected && <span className="check-mark">✓</span>}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-options">No options available</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};