import React from 'react';
import formStyles from "../../styles/Form.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string | undefined;
    description?: string;
    rightElement?: React.ReactNode;
}

export function Input({ label, error, description, rightElement, className = "", ...props }: InputProps) {
    return (
        <div className={formStyles.formGroup}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <label className={formStyles.label}>{label}</label>
            </div>
            <div style={{ position: 'relative' }}>
                <input
                    className={`${formStyles.input} ${error ? formStyles.inputError : ''} ${className}`}
                    {...props}
                />
                {rightElement && (
                    <div style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        {rightElement}
                    </div>
                )}
            </div>
            {description && !error && (
                <p className={formStyles.description}>{description}</p>
            )}
            {error && (
                <p className={formStyles.errorMessage}>{error}</p>
            )}
        </div>
    );
}
