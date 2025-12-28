import { useState, useRef, useEffect } from 'react';
import styles from './EditableDropdown.module.css';
import formStyles from '../../styles/Form.module.css';
import { ChevronDown } from 'lucide-react';

interface EditableDropdownProps {
    value: number;
    options: number[];
    onChange: (value: number) => void;
    placeholder?: string;
    unit?: string;
}

export function EditableDropdown({ value, options, onChange, placeholder, unit }: EditableDropdownProps) {
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

    const handleSelect = (val: number) => {
        onChange(val);
        setIsOpen(false);
    };

    const formatDelay = (val: number) => {
        if (val === 0) return 'No delay';
        if (val >= 1000) {
            const seconds = val / 1000;
            return `${seconds} s`;
        }
        return `${val} ms`;
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <div className={styles.inputWrapper}>
                <input
                    type="number"
                    className={`${formStyles.input} ${styles.inputCustom}`}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                />
                <button
                    className={styles.dropdownButton}
                    onClick={() => setIsOpen(!isOpen)}
                    type="button"
                >
                    <ChevronDown size={16} className={isOpen ? styles.iconOpen : ''} />
                </button>
            </div>
            {unit && <span className={styles.unitText}>{unit}</span>}

            {isOpen && (
                <div className={styles.dropdown}>
                    {options.map((option) => (
                        <div
                            key={option}
                            className={`${styles.option} ${value === option ? styles.optionActive : ''}`}
                            onClick={() => handleSelect(option)}
                        >
                            <span className={styles.optionValue}>{formatDelay(option)}</span>
                            {option !== 0 && (
                                <span className={styles.optionLabel}>{option} ms</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
