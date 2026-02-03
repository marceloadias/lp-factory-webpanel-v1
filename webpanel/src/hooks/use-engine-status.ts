"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api/client";
import { appStore } from "@/lib/store";

export function useEngineStatus() {
    const [isOnline, setIsOnline] = useState<boolean>(appStore.getIsOnline());
    const [loading, setLoading] = useState(false);

    const checkSystem = useCallback(async () => {
        setLoading(true);
        await appStore.checkHealth();
        setLoading(false);
    }, []);

    useEffect(() => {
        const unsubscribe = appStore.subscribe((state) => {
            setIsOnline(state.isOnline);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return { isOnline, checkSystem, loading };
}
