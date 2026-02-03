"use client"

import * as React from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { appStore, AppState } from "@/lib/store"
import { apiClient } from "@/lib/api/client"
import { Globe, Key, Save, RefreshCcw, ShieldCheck, Monitor, Palette, Wifi, CheckCircle2, XCircle, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { I18N } from "@/lib/i18n/pt-BR"

const defaultColors = {
    background: "#FCFEFF",
    foreground: "#0F172A",
    card: "#FFFFFF",
    cardForeground: "#0F172A",
    mutedForeground: "#64748B",
    header: "#FFFFFF",
    border: "#E2E8F0",
    primary: "#0057ff",
}

export default function SettingsPage() {
    const { theme } = useTheme()
    const [state, setState] = React.useState<AppState>(appStore.getState())
    const [baseUrl, setBaseUrl] = React.useState(state.baseUrl)
    const [apiKey, setApiKey] = React.useState(state.apiKey)
    const [loading, setLoading] = React.useState(false)
    const [healthResult, setHealthResult] = React.useState<any>(null)
    const [whoamiResult, setWhoamiResult] = React.useState<any>(null)
    const [testingConnection, setTestingConnection] = React.useState(false)
    const [customColors, setCustomColors] = React.useState(defaultColors)
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    React.useEffect(() => {
        const unsub = appStore.subscribe((newState) => {
            setState({ ...newState })
        })
        return () => { unsub(); }
    }, [])

    React.useEffect(() => {
        // Load custom colors from localStorage
        const saved = localStorage.getItem("lp-factory-theme-colors")
        if (saved) {
            try {
                setCustomColors({ ...defaultColors, ...JSON.parse(saved) })
            } catch (e) {
                console.error("Failed to load custom colors", e)
            }
        }
    }, [])

    const handleColorChange = (colorKey: keyof typeof defaultColors, value: string) => {
        const newColors = { ...customColors, [colorKey]: value }
        setCustomColors(newColors)
        localStorage.setItem("lp-factory-theme-colors", JSON.stringify(newColors))
        window.dispatchEvent(new Event('lp-theme-update'))
    }

    const resetColors = () => {
        setCustomColors(defaultColors)
        localStorage.setItem("lp-factory-theme-colors", JSON.stringify(defaultColors))
        window.dispatchEvent(new Event('lp-theme-update'))
        toast.success("Cores restauradas para o padrão!")
    }

    const sanitizeBaseUrl = (url: string) => {
        let sanitized = url.trim();

        // Garante que tenha protocolo
        if (sanitized && !sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
            sanitized = 'http://' + sanitized;
        }

        if (sanitized.endsWith('/')) {
            sanitized = sanitized.slice(0, -1);
        }
        return sanitized;
    }

    const handleStateChange = (key: keyof AppState, value: any) => {
        const newState = { ...state, [key]: value };
        setState(newState);
        // Não salvamos na store global ainda, apenas no estado local para permitir "Descartar" se desejado, 
        // ou salvamos se for uma mudança imediata como o toggle.
        if (key === 'mockMode') {
            appStore.setState({ [key]: value });
        }
    }

    const handleSave = () => {
        setLoading(true)
        const finalState = {
            ...state,
            baseUrl: sanitizeBaseUrl(baseUrl),
            apiKey: apiKey.trim()
        }
        appStore.setState(finalState);
        setState(finalState); // Sync local state
        setTimeout(() => {
            setLoading(false)
            toast.success("Configurações salvas com sucesso!")
        }, 800)
    }

    const runHealthTest = async () => {
        setTestingConnection(true)
        setHealthResult(null)
        const start = Date.now()

        try {
            const res = await apiClient.health()
            setHealthResult({
                status: 'success',
                latency: Date.now() - start,
                data: res.data
            })
        } catch (e: any) {
            setHealthResult({
                status: 'error',
                latency: Date.now() - start,
                error: e.message
            })
        } finally {
            setTestingConnection(false)
        }
    }

    const runWhoamiTest = async () => {
        setTestingConnection(true)
        setWhoamiResult(null)
        const start = Date.now()

        try {
            const res = await apiClient.whoami()
            setWhoamiResult({
                status: 'success',
                latency: Date.now() - start,
                data: res.data
            })
        } catch (e: any) {
            setWhoamiResult({
                status: 'error',
                latency: Date.now() - start,
                error: e.message
            })
        } finally {
            setTestingConnection(false)
        }
    }

    return (
        <div className="space-y-8 pb-12">
            <PageHeader
                title={I18N.SETTINGS.TITLE}
                description={I18N.SETTINGS.SUBTITLE}
            >
                <Button onClick={handleSave} className="rounded-full gap-2 px-8 shadow-large" disabled={loading}>
                    {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {I18N.COMMON.SAVE_CHANGES}
                </Button>
            </PageHeader>

            <Tabs defaultValue="engine" className="w-full">
                <TabsList className="bg-card w-full md:w-auto p-1 rounded-full border mb-8 flex-wrap h-auto">
                    <TabsTrigger value="engine" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white gap-2 px-6">
                        <ShieldCheck className="h-4 w-4" />
                        {I18N.SETTINGS.ENGINE_TAB}
                    </TabsTrigger>
                    <TabsTrigger value="connection" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white gap-2 px-6">
                        <Wifi className="h-4 w-4" />
                        {I18N.SETTINGS.TEST_TAB}
                    </TabsTrigger>
                    <TabsTrigger value="ui" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white gap-2 px-6">
                        <Palette className="h-4 w-4" />
                        {I18N.SETTINGS.UI_TAB}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="engine" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="glass-card border-none rounded-3xl overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black uppercase tracking-tighter">Motor de Execução (Engine)</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase opacity-40">Configure a conexão com o backend do projeto.</CardDescription>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-3 bg-muted/50 p-1.5 px-4 rounded-full border border-border/50">
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Real Mode (Dev Test)</span>
                                        {isMounted ? (
                                            <Switch
                                                checked={!state.mockMode}
                                                onCheckedChange={(checked) => handleStateChange('mockMode', !checked)}
                                            />
                                        ) : (
                                            <div className="h-5 w-9 bg-muted rounded-full animate-pulse" />
                                        )}
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isMounted && state.mockMode ? 'text-amber-500' : isMounted ? 'text-emerald-500 animate-pulse' : 'text-muted-foreground opacity-20'}`}>
                                        Status: {isMounted ? (state.mockMode ? I18N.COMMON.MOCK_MODE : I18N.COMMON.REAL_MODE) : '...'}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">Endpoint URL</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <Globe className="h-4 w-4" />
                                        </div>
                                        <Input
                                            className="pl-11 h-14 bg-muted/30 border-none rounded-2xl font-mono text-sm group-hover:bg-muted/50 transition-all focus:ring-2 focus:ring-primary/20"
                                            placeholder="http://127.0.0.1:8010"
                                            value={baseUrl}
                                            onChange={(e) => setBaseUrl(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">X-API-KEY</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                                            <Key className="h-4 w-4" />
                                        </div>
                                        <Input
                                            type="password"
                                            className="pl-11 h-14 bg-muted/30 border-none rounded-2xl font-mono text-sm group-hover:bg-muted/50 transition-all focus:ring-2 focus:ring-primary/20"
                                            placeholder="••••••••••••••••"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-muted/20 rounded-2xl border border-border/50  flex items-center justify-between group">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">{I18N.COMMON.CONFIGURING} Ativa</p>
                                    <p className="text-xs font-mono opacity-60">{isMounted ? (state.baseUrl || 'Nenhuma URL configurada') : '...'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={runHealthTest}
                                        variant="outline"
                                        disabled={testingConnection || (isMounted && state.mockMode)}
                                        className="rounded-full gap-2 border-border/50 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30"
                                    >
                                        {testingConnection ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
                                        Test /health
                                    </Button>
                                    <Button
                                        onClick={runWhoamiTest}
                                        variant="outline"
                                        disabled={testingConnection || (isMounted && state.mockMode)}
                                        className="rounded-full gap-2 border-border/50 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-30"
                                    >
                                        {testingConnection ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                        Test /whoami
                                    </Button>
                                </div>
                            </div>

                            {isMounted && state.mockMode && (
                                <p className="text-[10px] font-bold text-amber-500/80 uppercase text-center bg-amber-500/5 py-2 rounded-lg">
                                    ⚠️ Testes de conexão desabilitados em {I18N.COMMON.MOCK_MODE}. Ative o "{I18N.COMMON.REAL_MODE}" para testar o Engine.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="connection" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="glass-card border-none overflow-hidden">
                        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-black uppercase tracking-tight">Teste de Conexão</CardTitle>
                                <CardDescription className="text-xs font-bold uppercase opacity-40">Valide a conectividade com o Engine configurado.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={runHealthTest} variant="outline" disabled={testingConnection || (isMounted && state.mockMode)} className="rounded-full gap-2">
                                    {testingConnection ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Wifi className="h-4 w-4" />}
                                    Test /health
                                </Button>
                                <Button onClick={runWhoamiTest} variant="outline" disabled={testingConnection || (isMounted && state.mockMode)} className="rounded-full gap-2">
                                    {testingConnection ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                    Test /whoami
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {isMounted && state.mockMode && (
                                <div className="col-span-full text-[10px] font-bold text-amber-500/80 uppercase text-center bg-amber-500/5 py-2 rounded-lg">
                                    ⚠️ Testes de conexão desabilitados em {I18N.COMMON.MOCK_MODE}. Ative o "{I18N.COMMON.REAL_MODE}" na aba "{I18N.SETTINGS.ENGINE_TAB}" para testar o Engine.
                                </div>
                            )}
                            {/* HEALTH CHECK */}
                            <div className="p-6 rounded-3xl bg-card border border-border/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm uppercase">/health</h4>
                                    {healthResult && (
                                        <Badge variant={healthResult.status === 'success' ? 'default' : 'destructive'} className="uppercase text-[10px]">
                                            {healthResult.status === 'success' ? 'OK' : 'Falha'}
                                        </Badge>
                                    )}
                                </div>
                                {healthResult ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs">
                                            {healthResult.status === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                                            <span className="font-mono">{healthResult.latency}ms</span>
                                        </div>
                                        <div className="bg-black/20 p-3 rounded-xl overflow-hidden">
                                            <pre className="text-[10px] font-mono text-muted-foreground overflow-x-auto">
                                                {JSON.stringify(healthResult.data || healthResult.error, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground opacity-50 py-4 italic">Aguardando teste...</p>
                                )}
                            </div>

                            {/* WHOAMI CHECK */}
                            <div className="p-6 rounded-3xl bg-card border border-border/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm uppercase">/whoami</h4>
                                    {whoamiResult && (
                                        <Badge variant={whoamiResult.status === 'success' ? 'default' : 'destructive'} className="uppercase text-[10px]">
                                            {whoamiResult.status === 'success' ? 'OK' : 'Falha'}
                                        </Badge>
                                    )}
                                </div>
                                {whoamiResult ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs">
                                            {whoamiResult.status === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                                            <span className="font-mono">{whoamiResult.latency}ms</span>
                                        </div>
                                        <div className="bg-black/20 p-3 rounded-xl overflow-hidden">
                                            <pre className="text-[10px] font-mono text-muted-foreground overflow-x-auto">
                                                {JSON.stringify(whoamiResult.data || whoamiResult.error, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground opacity-50 py-4 italic">Aguardando teste...</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="ui" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="glass-card border-none p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                    <Monitor className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight">Preferências de Interface</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">Personalize sua experiência de uso.</p>
                                    <Badge variant="outline" className="mt-2">Tema atual: {theme || 'carregando...'}</Badge>
                                </div>
                            </div>
                            <Button onClick={resetColors} variant="outline" className="rounded-full gap-2" size="sm">
                                <RotateCcw className="h-4 w-4" />
                                {I18N.COMMON.RESTORE_DEFAULT}
                            </Button>
                        </div>
                        <Separator className="mb-8 opacity-10" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Espaço para futuras preferências de interface */}
                            <div className="text-xs text-muted-foreground opacity-50 italic">
                                Mais opções de interface em breve...
                            </div>
                        </div>

                        {/* Painel de Cores - Sempre visível para debug */}
                        <Separator className="my-8 opacity-10" />
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Palette className="h-5 w-5 text-primary" />
                                <h4 className="text-lg font-black uppercase tracking-tight">Cores Personalizadas</h4>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Personalize as cores da interface. As mudanças são aplicadas em tempo real.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Cor Primária */}
                                <div className="space-y-3 p-6 bg-card rounded-3xl border border-border/5">
                                    <Label htmlFor="color-primary" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        🎨 Cor Primária
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="color-primary"
                                            type="color"
                                            value={customColors.primary}
                                            onChange={(e) => handleColorChange('primary', e.target.value)}
                                            className="h-12 w-16 rounded-xl cursor-pointer border-2 border-border"
                                        />
                                        <Input
                                            value={customColors.primary}
                                            onChange={(e) => handleColorChange('primary', e.target.value)}
                                            className="h-12 bg-muted/50 border-border rounded-2xl font-mono"
                                            placeholder="#0057ff"
                                        />
                                    </div>
                                </div>

                                {/* Cor de Fundo */}
                                <div className="space-y-3 p-6 bg-card rounded-3xl border border-border/5">
                                    <Label htmlFor="color-background" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        🖼️ Fundo
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="color-background"
                                            type="color"
                                            value={customColors.background}
                                            onChange={(e) => handleColorChange('background', e.target.value)}
                                            className="h-12 w-16 rounded-xl cursor-pointer border-2 border-border"
                                        />
                                        <Input
                                            value={customColors.background}
                                            onChange={(e) => handleColorChange('background', e.target.value)}
                                            className="h-12 bg-muted/50 border-border rounded-2xl font-mono"
                                            placeholder="#FCFEFF"
                                        />
                                    </div>
                                </div>

                                {/* Texto Principal */}
                                <div className="space-y-3 p-6 bg-card rounded-3xl border border-border/5">
                                    <Label htmlFor="color-foreground" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        📝 Texto Principal
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="color-foreground"
                                            type="color"
                                            value={customColors.foreground}
                                            onChange={(e) => handleColorChange('foreground', e.target.value)}
                                            className="h-12 w-16 rounded-xl cursor-pointer border-2 border-border"
                                        />
                                        <Input
                                            value={customColors.foreground}
                                            onChange={(e) => handleColorChange('foreground', e.target.value)}
                                            className="h-12 bg-muted/50 border-border rounded-2xl font-mono"
                                            placeholder="#0F172A"
                                        />
                                    </div>
                                </div>

                                {/* Card */}
                                <div className="space-y-3 p-6 bg-card rounded-3xl border border-border/5">
                                    <Label htmlFor="color-card" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        🃏 Card
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="color-card"
                                            type="color"
                                            value={customColors.card}
                                            onChange={(e) => handleColorChange('card', e.target.value)}
                                            className="h-12 w-16 rounded-xl cursor-pointer border-2 border-border"
                                        />
                                        <Input
                                            value={customColors.card}
                                            onChange={(e) => handleColorChange('card', e.target.value)}
                                            className="h-12 bg-muted/50 border-border rounded-2xl font-mono"
                                            placeholder="#FFFFFF"
                                        />
                                    </div>
                                </div>

                                {/* Borda */}
                                <div className="space-y-3 p-6 bg-card rounded-3xl border border-border/5">
                                    <Label htmlFor="color-border" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        🔲 Borda
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="color-border"
                                            type="color"
                                            value={customColors.border}
                                            onChange={(e) => handleColorChange('border', e.target.value)}
                                            className="h-12 w-16 rounded-xl cursor-pointer border-2 border-border"
                                        />
                                        <Input
                                            value={customColors.border}
                                            onChange={(e) => handleColorChange('border', e.target.value)}
                                            className="h-12 bg-muted/50 border-border rounded-2xl font-mono"
                                            placeholder="#E2E8F0"
                                        />
                                    </div>
                                </div>

                                {/* Header */}
                                <div className="space-y-3 p-6 bg-card rounded-3xl border border-border/5">
                                    <Label htmlFor="color-header" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        📋 Header
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="color-header"
                                            type="color"
                                            value={customColors.header}
                                            onChange={(e) => handleColorChange('header', e.target.value)}
                                            className="h-12 w-16 rounded-xl cursor-pointer border-2 border-border"
                                        />
                                        <Input
                                            value={customColors.header}
                                            onChange={(e) => handleColorChange('header', e.target.value)}
                                            className="h-12 bg-muted/50 border-border rounded-2xl font-mono"
                                            placeholder="#FFFFFF"
                                        />
                                    </div>
                                </div>

                                {/* Texto Secundário */}
                                <div className="space-y-3 p-6 bg-card rounded-3xl border border-border/5">
                                    <Label htmlFor="color-muted" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        💬 Texto Secundário
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="color-muted"
                                            type="color"
                                            value={customColors.mutedForeground}
                                            onChange={(e) => handleColorChange('mutedForeground', e.target.value)}
                                            className="h-12 w-16 rounded-xl cursor-pointer border-2 border-border"
                                        />
                                        <Input
                                            value={customColors.mutedForeground}
                                            onChange={(e) => handleColorChange('mutedForeground', e.target.value)}
                                            className="h-12 bg-muted/50 border-border rounded-2xl font-mono"
                                            placeholder="#64748B"
                                        />
                                    </div>
                                </div>

                                {/* Texto do Card */}
                                <div className="space-y-3 p-6 bg-card rounded-3xl border border-border/5">
                                    <Label htmlFor="color-card-foreground" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        🔤 Texto do Card
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            id="color-card-foreground"
                                            type="color"
                                            value={customColors.cardForeground}
                                            onChange={(e) => handleColorChange('cardForeground', e.target.value)}
                                            className="h-12 w-16 rounded-xl cursor-pointer border-2 border-border"
                                        />
                                        <Input
                                            value={customColors.cardForeground}
                                            onChange={(e) => handleColorChange('cardForeground', e.target.value)}
                                            className="h-12 bg-muted/50 border-border rounded-2xl font-mono"
                                            placeholder="#0F172A"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
