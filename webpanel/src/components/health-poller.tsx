"use client";

import { useEffect } from "react";
import { appStore } from "@/lib/store";

export function HealthPoller() {
    useEffect(() => {
        // Primeira checada imediata
        appStore.checkHealth();

        // Polling loop adaptativo
        let intervalId: NodeJS.Timeout;

        const startPolling = () => {
            const isOnline = appStore.getState().isOnline;
            const delay = isOnline ? 15000 : 30000; // 15s se online, 30s se offline (MAIS CONSERVADOR)

            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(() => {
                appStore.checkHealth();
            }, delay);
        };

        // Inicia polling
        startPolling();

        // Re-ajusta se o estado mudar (para mudar o delay de offline/online)
        const unsub = appStore.subscribe((state) => {
            // Só reinicia se houver mudança de status que altere o delay
            // Mas para simplificar, o subscribe do useEngineStatus já resolve a UI.
            // Vamos deixar o intervalo fixo de 20s para simplificar e ser menos barulhento.
        });

        // Loop fixo de 20s para reduzir ruído nos logs
        const fixedInterval = setInterval(() => {
            appStore.checkHealth();
        }, 20000);

        return () => {
            clearInterval(fixedInterval);
            unsub();
        };
    }, []);

    return null;
}
