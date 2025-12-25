import { useEffect, useState, useRef } from 'react';

interface Size {
    width: number;
    height: number;
}

export function useResizeObserver<T extends HTMLElement>() {
    const [size, setSize] = useState<Size>({ width: 0, height: 0 });
    const ref = useRef<T>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new ResizeObserver((entries) => {
            if (!entries || entries.length === 0) return;
            const entry = entries[0];
            const { width, height } = entry.contentRect;
            setSize({ width, height });
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return { ref, width: size.width, height: size.height };
}
