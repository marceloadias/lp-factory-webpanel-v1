"use client"

import * as React from "react"
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Cpu,
  Sparkles,
  AlertCircle,
  UserCircle,
  Save,
  X,
  Database,
  Globe,
  Lock,
  Undo2,
  Activity,
  Info,
  Calendar,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PremiumDataTable } from "@/components/datatable/PremiumDataTable"
import { ColumnDef } from "@tanstack/react-table"
import { Provider } from "@/lib/types/providers"
import { AgentSuggestion } from "@/lib/types/agents"
import { appStore } from "@/lib/store"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { I18N } from "@/lib/i18n/pt-BR"
import { cn } from "@/lib/utils"

export default function APIsAndAgentsPage() {
  const [state, setState] = React.useState(appStore.getState())
  const [isClient, setIsClient] = React.useState(false)

  // Engine State
  const [engineBaseUrl, setEngineBaseUrl] = React.useState(state.baseUrl)
  const [engineApiKey, setEngineApiKey] = React.useState(state.apiKey)
  const [engineMockMode, setEngineMockMode] = React.useState(state.mockMode)

  // Provider Form State
  const [editingProvider, setEditingProvider] = React.useState<Provider | null>(null)
  const [isProviderSheetOpen, setIsProviderSheetOpen] = React.useState(false)

  // Agent Suggestion Input State (map per agent)
  const [suggestionInputs, setSuggestionInputs] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    setIsClient(true)
    const unsub = appStore.subscribe((newState) => {
      setState(newState)
      setEngineBaseUrl(newState.baseUrl)
      setEngineApiKey(newState.apiKey)
      setEngineMockMode(newState.mockMode)
    })
    return () => { unsub() }
  }, [])

  if (!isClient) return null

  // Engine Handlers
  const handleSaveEngine = () => {
    appStore.setState({
      baseUrl: engineBaseUrl,
      apiKey: engineApiKey,
      mockMode: engineMockMode
    })
    toast.success(I18N.COMMON.SAVE_SUCCESS)
  }

  const handleRestoreDefaultEngine = () => {
    toast.info(I18N.ENGINE.RESTORING)
    const DEFAULT_URL = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8010"
    setEngineBaseUrl(DEFAULT_URL)
    setEngineApiKey("")
    setEngineMockMode(true)
  }

  const handleTestEndpoint = (endpoint: string) => {
    if (engineMockMode) {
      toast.info(I18N.ENGINE.MOCK_WARNING)
      return
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 900)),
      {
        loading: I18N.ENGINE.TESTING(endpoint),
        success: I18N.ENGINE.TEST_OK(endpoint),
        error: I18N.ENGINE.TEST_FAIL(endpoint),
      }
    )
  }

  // Provider Handlers
  const handleToggleProvider = (providerId: string, enabled: boolean) => {
    const nextProviders = state.providers.map(p =>
      p.id === providerId ? { ...p, enabled } : p
    )
    appStore.setState({ providers: nextProviders })

    const name = state.providers.find(p => p.id === providerId)?.display_name ?? providerId
    toast.success(I18N.PROVIDERS.TOGGLE_SUCCESS(name, enabled))
  }

  const handleSaveProvider = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProvider) return

    const existsIdx = state.providers.findIndex(p => p.id === editingProvider.id)
    let nextProviders: Provider[]

    if (existsIdx > -1) {
      nextProviders = [...state.providers]
      const existing = state.providers[existsIdx]
      nextProviders[existsIdx] = {
        ...editingProvider,
        api_key: editingProvider.api_key || existing.api_key
      }
    } else {
      nextProviders = [...state.providers, editingProvider]
    }

    appStore.setState({ providers: nextProviders })
    setIsProviderSheetOpen(false)
    setEditingProvider(null)
    toast.success(I18N.COMMON.SAVE_SUCCESS)
  }

  const handleRemoveProvider = (providerId: string) => {
    if (confirm(I18N.COMMON.REMOVE_CONFIRM)) {
      const nextProviders = state.providers.filter(p => p.id !== providerId)
      appStore.setState({ providers: nextProviders })
      toast.success(I18N.PROVIDERS.REMOVED_SUCCESS)
    }
  }

  // Agent Handlers
  const handleAgentSwitch = (agentId: string, enabled: boolean) => {
    const nextAgents = state.agents.map(a => a.id === agentId ? { ...a, enabled } : a)
    appStore.setState({ agents: nextAgents })
  }

  const handleAgentBinding = (agentId: string, providerId: string) => {
    // Se "auto", não força provider/model — deixa o engine decidir
    if (providerId === "auto") {
      const nextAgents = state.agents.map(a => a.id === agentId ? {
        ...a,
        provider_binding: { provider_id: "auto", model_id: "" }
      } : a)
      appStore.setState({ agents: nextAgents })
      toast.success(I18N.AGENTS.BIND_SUCCESS(agentId, I18N.PROVIDERS.AUTO))
      return
    }

    const provider = state.providers.find(p => p.id === providerId)
    const nextAgents = state.agents.map(a => a.id === agentId ? {
      ...a,
      provider_binding: {
        provider_id: providerId,
        model_id: provider?.default_model || ""
      }
    } : a)
    appStore.setState({ agents: nextAgents })
    toast.success(I18N.AGENTS.BIND_SUCCESS(agentId, provider?.display_name ?? "um provider"))
  }

  const handleAgentModel = (agentId: string, modelId: string) => {
    const nextAgents = state.agents.map(a => a.id === agentId ? {
      ...a,
      provider_binding: {
        provider_id: a.provider_binding?.provider_id || "auto",
        model_id: modelId
      }
    } : a)
    appStore.setState({ agents: nextAgents })
  }

  const handleSaveSuggestion = (agentId: string) => {
    const text = suggestionInputs[agentId]
    if (!text || !text.trim()) return

    const suggestion: AgentSuggestion = {
      id: Math.random().toString(36).substr(2, 9),
      agent_id: agentId,
      text,
      scope: "user",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: "Admin Local",
      last_editor: "Admin Local"
    }

    appStore.setState({
      agentSuggestions: [suggestion, ...state.agentSuggestions]
    })
    setSuggestionInputs(prev => ({ ...prev, [agentId]: "" }))
    toast.success(I18N.COMMON.SAVE_SUCCESS)
  }

  const handleRemoveSuggestion = (suggestionId: string) => {
    const nextSuggestions = state.agentSuggestions.filter(s => s.id !== suggestionId)
    appStore.setState({ agentSuggestions: nextSuggestions })
    toast.success(I18N.AGENTS.SUGGESTION_REMOVED)
  }

  // Table Columns Definition
  const providerColumns: ColumnDef<Provider>[] = [
    {
      accessorKey: "display_name",
      header: I18N.PROVIDERS.NAME,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Cpu className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight">{row.original.display_name}</span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase opacity-70">{row.original.id}</span>
          </div>
        </div>
      )
    },
    {
      id: "health",
      header: I18N.PROVIDERS.HEALTH,
      cell: () => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Ativo</span>
        </div>
      )
    },
    {
      accessorKey: "enabled",
      header: I18N.PROVIDERS.ACTIVE,
      cell: ({ row }) => (
        <Switch
          checked={row.original.enabled}
          onCheckedChange={(val) => handleToggleProvider(row.original.id, val)}
        />
      )
    },
    {
      accessorKey: "models",
      header: I18N.PROVIDERS.MODELS_TITLE,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.original.models && row.original.models.length > 0 ? (
            row.original.models.slice(0, 2).map((m: any) => (
              <Badge key={m.id} variant="outline" className="text-[9px] font-mono border-none bg-muted/50 px-1.5 py-0 h-4">
                {m.id}
              </Badge>
            ))
          ) : (
            <span className="text-[10px] text-muted-foreground italic">N/A</span>
          )}
          {row.original.models && row.original.models.length > 2 && (
            <Badge variant="outline" className="text-[9px] font-mono border-none bg-primary/10 text-primary px-1.5 py-0 h-4">
              +{row.original.models.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    {
      id: "actions",
      header: () => <div className="text-center">{I18N.COMMON.ACTIONS}</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
            onClick={() => {
              setEditingProvider(row.original)
              setIsProviderSheetOpen(true)
            }}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all"
            onClick={() => handleRemoveProvider(row.original.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 max-w-full overflow-hidden pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-foreground">{I18N.COMMON.API_AGENTS}</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">{I18N.PROVIDERS.SUBTITLE}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-sm">
            <Activity className="mr-2 h-3 w-3" />
            {I18N.PROVIDERS.ACTIVE_LOCAL}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="engine" className="w-full">
        <TabsList className="bg-muted/50 p-1.5 h-14 rounded-2xl gap-2 overflow-x-auto overflow-y-hidden flex shadow-inner border border-white/5 scrollbar-hide">
          <TabsTrigger value="engine" className="rounded-xl px-10 h-11 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest transition-all">
            <Database className="mr-2 h-4 w-4" />
            {I18N.COMMON.ENGINE}
          </TabsTrigger>
          <TabsTrigger value="apis" className="rounded-xl px-10 h-11 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest transition-all">
            <Cpu className="mr-2 h-4 w-4" />
            {I18N.COMMON.APIS}
          </TabsTrigger>
          <TabsTrigger value="agents" className="rounded-xl px-10 h-11 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest transition-all">
            <Sparkles className="mr-2 h-4 w-4" />
            {I18N.COMMON.AGENTS}
          </TabsTrigger>
        </TabsList>

        {/* ENGINE */}
        <TabsContent value="engine" className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className={cn(
            "border-none shadow-premium backdrop-blur-md overflow-hidden rounded-2xl transition-all duration-300",
            "bg-[#F4F7F9]/90 border border-white/40",
            "dark:bg-[#080909]/80 dark:border-white/5"
          )}>
            <CardHeader className="border-b border-border/10 pb-8 pt-8">
              <CardTitle className="text-xl font-black uppercase">{I18N.ENGINE.TITLE}</CardTitle>
              <CardDescription className="text-sm font-medium opacity-70">{I18N.ENGINE.SUBTITLE}</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Globe className="h-3 w-3 text-primary" />
                    {I18N.ENGINE.BASE_URL}
                  </Label>
                  <Input
                    placeholder="http://localhost:8010"
                    value={engineBaseUrl}
                    onChange={(e) => setEngineBaseUrl(e.target.value)}
                    className="h-14 rounded-2xl bg-white/50 dark:bg-black/20 border-border/40 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                    <Lock className="h-3 w-3 text-primary" />
                    {I18N.ENGINE.API_KEY}
                  </Label>
                  <Input
                    type="password"
                    placeholder="sk-••••••••••••••••"
                    value={engineApiKey}
                    onChange={(e) => setEngineApiKey(e.target.value)}
                    className="h-14 rounded-2xl bg-white/50 dark:bg-black/20 border-border/40 focus:ring-primary/20 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-muted/30 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1.5 text-center sm:text-left">
                  <p className="text-sm font-bold tracking-tight">{I18N.ENGINE.MOCK_MODE}</p>
                  <p className="text-xs text-muted-foreground font-medium opacity-80">{I18N.ENGINE.MOCK_DESCRIPTION}</p>
                </div>
                <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-2xl border border-white/5">
                  <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all", !engineMockMode ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground opacity-50")}>{I18N.COMMON.REAL}</span>
                  <Switch
                    checked={engineMockMode}
                    onCheckedChange={setEngineMockMode}
                    className="data-[state=checked]:bg-primary/20"
                  />
                  <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all", engineMockMode ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground opacity-50")}>{I18N.COMMON.MOCK}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/10">
                <Button
                  variant="ghost"
                  onClick={handleRestoreDefaultEngine}
                  className="w-full sm:w-auto h-12 rounded-xl px-8 font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-muted/50 transition-all"
                >
                  <Undo2 className="h-4 w-4" />
                  {I18N.COMMON.RESTORE_DEFAULT}
                </Button>
                <Button
                  onClick={handleSaveEngine}
                  className="w-full sm:w-auto h-12 rounded-xl px-16 bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {I18N.COMMON.SAVE}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* TESTE */}
          <Card className={cn(
            "border-none shadow-premium backdrop-blur-md overflow-hidden rounded-2xl transition-all duration-500",
            "bg-[#F4F7F9]/90 border border-white/40",
            "dark:bg-[#080909]/80 dark:border-white/5",
            engineMockMode && "opacity-50 grayscale-[0.8]"
          )}>
            <CardHeader className="border-b border-border/10 pb-6 pt-6 bg-muted/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <CardTitle className="text-base font-black uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    {I18N.ENGINE.TEST_CONNECTION}
                  </CardTitle>
                  <CardDescription className="text-xs font-medium">{I18N.ENGINE.SUBTITLE}</CardDescription>
                </div>
                {engineMockMode && (
                  <Badge variant="outline" className="text-rose-500 bg-rose-500/10 border-rose-500/20 text-[9px] font-black uppercase py-2 px-4 rounded-full flex gap-2 animate-pulse">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {I18N.ENGINE.MOCK_WARNING}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-8 pb-8 flex flex-wrap justify-center sm:justify-start gap-4">
              <Button
                disabled={engineMockMode}
                onClick={() => handleTestEndpoint("/health")}
                className="h-12 rounded-xl px-10 bg-white dark:bg-black/40 border border-border/40 text-foreground hover:bg-primary hover:text-white hover:border-primary font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
              >
                <Activity className="mr-2 h-4 w-4" />
                {I18N.ENGINE.TEST_HEALTH}
              </Button>
              <Button
                disabled={engineMockMode}
                onClick={() => handleTestEndpoint("/whoami")}
                className="h-12 rounded-xl px-10 bg-white dark:bg-black/40 border border-border/40 text-foreground hover:bg-primary hover:text-white hover:border-primary font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
              >
                <UserCircle className="mr-2 h-4 w-4" />
                {I18N.ENGINE.TEST_WHOAMI}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* APIS */}
        <TabsContent value="apis" className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className={cn(
            "border-none shadow-premium backdrop-blur-md overflow-hidden rounded-2xl transition-all duration-300",
            "bg-[#F4F7F9]/90 border border-white/40",
            "dark:bg-[#080909]/80 dark:border-white/5"
          )}>
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between border-b border-border/10 pb-8 pt-8 gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <CardTitle className="text-xl font-black uppercase">{I18N.PROVIDERS.TITLE}</CardTitle>
                <CardDescription className="text-sm font-medium opacity-70">{I18N.PROVIDERS.SUBTITLE}</CardDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingProvider({ id: "", display_name: "", enabled: true, models: [] })
                  setIsProviderSheetOpen(true)
                }}
                className="h-12 rounded-xl px-10 bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Plus className="mr-2 h-5 w-5" />
                {I18N.PROVIDERS.ADD_NEW}
              </Button>
            </CardHeader>
            <CardContent className="pt-8">
              <PremiumDataTable
                title={""}
                data={state.providers}
                columns={providerColumns}
                searchColumn="display_name"
                enableDateRange={false}
                enableFilters={false}
              />

              <div className="mt-12 p-6 rounded-3xl bg-primary/5 border border-primary/10 flex gap-5 items-start">
                <div className="h-12 w-12 rounded-2xl bg-white dark:bg-black/20 flex items-center justify-center shadow-sm border border-primary/20 shrink-0">
                  <ShieldCheck className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-black text-primary tracking-tight uppercase">{I18N.PROVIDERS.PRIVACY_TITLE}</p>
                  <p className="text-[13px] text-muted-foreground font-medium leading-relaxed max-w-4xl">
                    {I18N.PROVIDERS.PRIVACY_DESC}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AGENTES */}
        <TabsContent value="agents" className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
            {state.agents.map((agent) => (
              <Card key={agent.id} className={cn(
                "group border shadow-premium transition-all duration-500 rounded-3xl overflow-hidden flex flex-col",
                "bg-[#F4F7F9]/90 border-slate-200/40 dark:bg-[#080909]/80 dark:border-white/5 dark:backdrop-blur-md",
                !agent.enabled && "opacity-40 grayscale-[0.5]"
              )}>
                <CardHeader className="pb-4 pt-7 px-7">
                  <div className="flex justify-between items-center bg-muted/20 rounded-2xl p-2 pl-4 border border-white/5">
                    <Badge variant="outline" className="text-[10px] font-black uppercase text-primary border-none bg-transparent px-0">
                      {I18N.COMMON.AGENTS.slice(0, -1)} {agent.id}
                    </Badge>
                    <Switch
                      checked={agent.enabled}
                      onCheckedChange={(val) => handleAgentSwitch(agent.id, val)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <CardTitle className="text-2xl mt-5 font-black tracking-tighter uppercase leading-none text-foreground group-hover:text-primary transition-colors">
                    {agent.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs font-medium leading-[1.6] mt-3 min-h-[3rem] opacity-70">
                    {agent.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-7 pb-4">
                  <div className="grid grid-cols-2 gap-3 mb-6 bg-muted/10 p-3 rounded-2xl border border-white/5">
                    <div className="space-y-1.5">
                      <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {I18N.PROVIDERS.PROVIDER_LABEL}
                      </Label>
                      <Select
                        value={agent.provider_binding?.provider_id || "auto"}
                        onValueChange={(val) => handleAgentBinding(agent.id, val)}
                      >
                        <SelectTrigger className="h-9 rounded-xl text-[10px] font-bold border-none bg-white dark:bg-black/40 shadow-sm">
                          <SelectValue placeholder={I18N.PROVIDERS.AUTO} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-2xl">
                          <SelectItem value="auto" className="text-[10px] font-bold uppercase">
                            {I18N.PROVIDERS.AUTO_SELECT}
                          </SelectItem>
                          {state.providers.map(p => (
                            <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold uppercase">
                              {p.display_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {I18N.PROVIDERS.MODEL_LABEL}
                      </Label>
                      <Input
                        value={agent.provider_binding?.model_id || ""}
                        onChange={(e) => handleAgentModel(agent.id, e.target.value)}
                        placeholder={I18N.PROVIDERS.MODEL_ID_PLACEHOLDER}
                        className="h-9 rounded-xl text-[10px] font-bold border-none bg-white dark:bg-black/40 shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/5">
                    <div className="flex items-center justify-between">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" />
                        {I18N.AGENTS.SUGGESTIONS}
                      </Label>
                      <Badge variant="outline" className="text-[7px] font-black uppercase opacity-40 border-none bg-transparent">
                        {I18N.AGENTS.LOCAL_ONLY}
                      </Badge>
                    </div>

                    <div className="relative group">
                      <Textarea
                        placeholder={I18N.AGENTS.NEW_SUGGESTION}
                        value={suggestionInputs[agent.id] || ""}
                        onChange={(e) => setSuggestionInputs(prev => ({ ...prev, [agent.id]: e.target.value }))}
                        className="min-h-[80px] text-xs font-medium rounded-2xl bg-muted/40 border-none resize-none focus:bg-muted/60 transition-all pr-12"
                      />
                      <Button
                        size="icon"
                        disabled={!suggestionInputs[agent.id]?.trim()}
                        onClick={() => handleSaveSuggestion(agent.id)}
                        className="absolute bottom-2 right-2 h-8 w-8 rounded-xl bg-primary shadow-lg shadow-primary/20 scale-90 group-focus-within:scale-100 transition-all"
                      >
                        <ChevronRight className="h-4 w-4 text-white" />
                      </Button>
                    </div>

                    <div className="space-y-2 mt-4 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                      {state.agentSuggestions
                        .filter(s => s.agent_id === agent.id)
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map(suggestion => (
                          <div key={suggestion.id} className="p-3 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/5 space-y-1.5 relative group/item">
                            <div className="flex items-center justify-between opacity-50">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-2.5 w-2.5" />
                                <span className="text-[8px] font-bold">
                                  {new Date(suggestion.created_at).toLocaleDateString()}{" "}
                                  {new Date(suggestion.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            </div>
                            <p className="text-[10px] font-medium leading-relaxed italic opacity-80">
                              "{suggestion.text}"
                            </p>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveSuggestion(suggestion.id)}
                              className="absolute top-1 right-1 h-5 w-5 rounded-full opacity-0 group-hover/item:opacity-100 text-rose-500 hover:bg-rose-500/10 transition-all"
                            >
                              <X className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        ))}

                      {state.agentSuggestions.filter(s => s.agent_id === agent.id).length === 0 && (
                        <div className="py-6 text-center opacity-20 flex flex-col items-center gap-2">
                          <Info className="h-5 w-5" />
                          <p className="text-[8px] font-black uppercase tracking-widest">{I18N.AGENTS.NO_SUGGESTIONS}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* DRAWER PROVIDER */}
      <Sheet open={isProviderSheetOpen} onOpenChange={setIsProviderSheetOpen}>
        <SheetContent className="sm:max-w-xl rounded-l-[3rem] border-none shadow-2xl bg-background/90 backdrop-blur-2xl p-0 overflow-hidden">
          <form onSubmit={handleSaveProvider} className="h-full flex flex-col">
            <div className="p-10 pt-14 flex-1 space-y-10 overflow-y-auto custom-scrollbar">
              <SheetHeader className="space-y-3">
                <div className="h-16 w-16 rounded-[2rem] bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-inner">
                  <Cpu className="h-8 w-8 text-primary" />
                </div>
                <SheetTitle className="text-3xl font-black uppercase tracking-tighter pt-4">
                  {editingProvider?.id ? I18N.PROVIDERS.EDIT : I18N.PROVIDERS.ADD_NEW}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">{I18N.PROVIDERS.ID}</Label>
                    <Input
                      placeholder="ex: openai"
                      value={editingProvider?.id || ""}
                      onChange={e => setEditingProvider(p => p ? { ...p, id: e.target.value.toLowerCase() } : null)}
                      className="h-12 rounded-2xl bg-muted/50 border-white/5 font-bold"
                      required
                      disabled={!!editingProvider?.id && state.providers.some(p => p.id === editingProvider.id)}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">{I18N.PROVIDERS.NAME}</Label>
                    <Input
                      placeholder="ex: OpenAI"
                      value={editingProvider?.display_name || ""}
                      onChange={e => setEditingProvider(p => p ? { ...p, display_name: e.target.value } : null)}
                      className="h-12 rounded-2xl bg-muted/50 border-white/5 font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">{I18N.PROVIDERS.BASE_URL}</Label>
                  <Input
                    placeholder="https://api.openai.com/v1"
                    value={editingProvider?.base_url || ""}
                    onChange={e => setEditingProvider(p => p ? { ...p, base_url: e.target.value } : null)}
                    className="h-12 rounded-2xl bg-muted/50 border-white/5"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">{I18N.ENGINE.API_KEY}</Label>
                  <div className="relative group/key">
                    <Input
                      type="password"
                      placeholder="••••••••••••••••"
                      value={editingProvider?.api_key || ""}
                      onChange={e => setEditingProvider(p => p ? { ...p, api_key: e.target.value } : null)}
                      className="h-14 rounded-2xl bg-muted/50 border-white/5 font-mono"
                      autoComplete="off"
                    />
                    {editingProvider?.api_key && state.providers.some(p => p.id === editingProvider.id) && (
                      <div className="absolute inset-0 bg-background/90 backdrop-blur-[4px] rounded-2xl flex items-center px-6 pointer-events-none border border-primary/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                          <Lock className="h-4 w-4" />
                          {I18N.PROVIDERS.SECRET_KEY_NOTICE}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">{I18N.PROVIDERS.DEFAULT_MODEL}</Label>
                    <Input
                      placeholder="ex: gpt-4o"
                      value={editingProvider?.default_model || ""}
                      onChange={e => setEditingProvider(p => p ? { ...p, default_model: e.target.value } : null)}
                      className="h-12 rounded-2xl bg-muted/50 border-white/5 font-bold"
                    />
                  </div>
                  <div className="flex flex-col space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">{I18N.PROVIDERS.ACTIVE}</Label>
                    <div className="h-12 rounded-2xl bg-muted/50 border-white/5 flex items-center px-4 justify-between border">
                      <Badge variant="outline" className={cn("text-[8px] font-black uppercase border-none", editingProvider?.enabled ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10")}>
                        {editingProvider?.enabled ? I18N.STATUS.ACTIVE : I18N.STATUS.OFFLINE}
                      </Badge>
                      <Switch
                        checked={editingProvider?.enabled}
                        onCheckedChange={v => setEditingProvider(p => p ? { ...p, enabled: v } : null)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">{I18N.PROVIDERS.NOTES}</Label>
                  <Textarea
                    placeholder={I18N.PROVIDERS.NOTES}
                    value={editingProvider?.notes || ""}
                    onChange={e => setEditingProvider(p => p ? { ...p, notes: e.target.value } : null)}
                    className="min-h-[120px] rounded-2xl bg-muted/50 border-white/5 resize-none p-4 text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            <SheetFooter className="p-10 pt-6 border-t border-white/10 bg-muted/5">
              <Button type="button" variant="ghost" onClick={() => setIsProviderSheetOpen(false)} className="rounded-2xl h-14 px-10 font-black text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-all">
                {I18N.COMMON.CANCEL}
              </Button>
              <Button type="submit" className="rounded-2xl h-14 px-16 bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all">
                <Save className="mr-2 h-5 w-5" />
                {I18N.COMMON.SAVE}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}