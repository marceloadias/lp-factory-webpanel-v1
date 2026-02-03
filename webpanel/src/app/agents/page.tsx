"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Archive, User, Bot, Loader2, UserCheck, Clock } from "lucide-react";
import { I18N } from "@/lib/i18n/pt-BR";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Agent, AgentSuggestion } from "@/lib/types/agents";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAgents = useCallback(async () => {
    setLoadingAgents(true);
    try {
      const res = await apiClient.getAgents();
      if (!res.success) throw new Error(res.error?.message || "Erro ao carregar agentes");

      const data = res.data || [];
      setAgents(data);
      if (data.length > 0 && !selectedAgent) {
        setSelectedAgent(data[0]);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao carregar agentes");
    } finally {
      setLoadingAgents(false);
    }
  }, [selectedAgent]);

  const fetchSuggestions = useCallback(async (agentId: string) => {
    setLoadingSuggestions(true);
    try {
      const res = await apiClient.getAgentSuggestions(agentId);
      if (!res.success) throw new Error(res.error?.message || "Erro ao carregar sugestões");
      setSuggestions(res.data || []);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao carregar sugestões");
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    if (selectedAgent) {
      fetchSuggestions(selectedAgent.id);
    }
  }, [selectedAgent, fetchSuggestions]);

  const handleSaveSuggestion = async () => {
    if (!selectedAgent || !newSuggestion.trim()) return;
    setSaving(true);
    try {
      const res = await apiClient.createAgentSuggestion(selectedAgent.id, {
        scope: "user",
        text: newSuggestion,
        author: "Admin"
      });

      if (!res.success) throw new Error(res.error?.message || "Erro ao salvar sugestão");

      toast.success("Sugestão salva com sucesso");
      setNewSuggestion("");
      fetchSuggestions(selectedAgent.id);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao salvar sugestão");
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveSuggestion = async (id: string) => {
    try {
      const res = await apiClient.archiveAgentSuggestion(id);
      if (!res.success) throw new Error(res.error?.message || "Erro ao arquivar");

      toast.success("Sugestão arquivada");
      if (selectedAgent) fetchSuggestions(selectedAgent.id);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao arquivar sugestão");
    }
  };

  const userSuggestions = suggestions.filter(s => s.scope === "user" && s.status === "active");
  const systemRules = suggestions.filter(s => s.scope === "system" && s.status === "active");

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title={I18N.COMMON.AGENTS}
        description={I18N.AGENTS.SUBTITLE}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Agent Selector Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">Agentes Disponíveis</h3>
          <div className="space-y-2">
            {loadingAgents ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : (
              agents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl transition-all border border-transparent",
                    selectedAgent?.id === agent.id
                      ? "bg-primary/10 border-primary/20"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex flex-col">
                    <span className={cn("font-bold text-sm", selectedAgent?.id === agent.id ? "text-primary" : "text-foreground")}>
                      {agent.name}
                    </span>
                    <span className="text-[10px] opacity-50 uppercase font-bold truncate">
                      {agent.id}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {selectedAgent ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Left: Editor */}
              <div className="space-y-6">
                <Card className="glass-card p-6 border-none">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Plus className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-black uppercase">{I18N.AGENTS.NEW_SUGGESTION}</h3>
                  </div>
                  <Textarea
                    placeholder="Descreva a melhoria ou regra para este agente..."
                    className="min-h-[200px] mb-4 bg-muted/30 border-none rounded-2xl focus-visible:ring-1 ring-primary/20"
                    value={newSuggestion}
                    onChange={(e) => setNewSuggestion(e.target.value)}
                  />
                  <Button
                    className="w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest"
                    disabled={saving || !newSuggestion.trim()}
                    onClick={handleSaveSuggestion}
                  >
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {I18N.AGENTS.SAVE_SUGGESTION}
                  </Button>
                </Card>

                <Card className="glass-card p-6 border-none bg-muted/20">
                  <h4 className="text-[10px] font-black uppercase opacity-30 mb-2">Sobre o Agente</h4>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    {selectedAgent.description}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Badge variant="outline" className="text-[9px] uppercase font-black py-1 px-2 border-primary/20 text-primary">
                      {selectedAgent.provider_binding?.model_id || "Auto"}
                    </Badge>
                  </div>
                </Card>
              </div>

              {/* Right: Lists with Tabs */}
              <div className="space-y-6">
                <Tabs defaultValue="user" className="w-full">
                  <TabsList className="w-full p-1 bg-muted/30 rounded-2xl h-14 border border-white/5 overflow-y-hidden scrollbar-hide">
                    <TabsTrigger value="user" className="flex-1 rounded-xl h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-lg">
                      {I18N.AGENTS.USER_SUGGESTIONS}
                    </TabsTrigger>
                    <TabsTrigger value="system" className="flex-1 rounded-xl h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-lg">
                      {I18N.AGENTS.SYSTEM_RULES}
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-6 min-h-[400px]">
                    {loadingSuggestions ? (
                      <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                    ) : (
                      <>
                        <TabsContent value="user" className="space-y-4 m-0 border-none focus-visible:ring-0">
                          {userSuggestions.length === 0 ? (
                            <div className="text-center p-12 opacity-30 font-bold uppercase text-[10px]">{I18N.AGENTS.NO_SUGGESTIONS}</div>
                          ) : (
                            userSuggestions.map(s => <SuggestionCard key={s.id} suggestion={s} onArchive={() => handleArchiveSuggestion(s.id)} />)
                          )}
                        </TabsContent>
                        <TabsContent value="system" className="space-y-4 m-0 border-none focus-visible:ring-0">
                          {systemRules.length === 0 ? (
                            <div className="text-center p-12 opacity-30 font-bold uppercase text-[10px]">Nenhuma regra de sistema definida.</div>
                          ) : (
                            systemRules.map(s => <SuggestionCard key={s.id} suggestion={s} />)
                          )}
                        </TabsContent>
                      </>
                    )}
                  </div>
                </Tabs>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 opacity-30 italic">
              Selecione um agente para começar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SuggestionCard({ suggestion, onArchive }: { suggestion: AgentSuggestion, onArchive?: () => void }) {
  const isUser = suggestion.scope === "user";

  return (
    <Card className="glass-card p-5 border-none group hover:bg-muted/30 transition-all flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-lg",
            isUser ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
          )}>
            {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[8px] font-black uppercase border-none bg-muted/50 py-0.5">
            {isUser ? I18N.AGENTS.SCOPE_USER : I18N.AGENTS.SCOPE_SYSTEM}
          </Badge>
          {onArchive && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
              onClick={onArchive}
            >
              <Archive className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs font-medium leading-relaxed text-foreground/80">
        {suggestion.text}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5 opacity-50">
          <UserCheck className="h-3 w-3" />
          <span className="text-[9px] font-bold uppercase tracking-tight">{suggestion.author}</span>
        </div>
        <div className="flex items-center gap-1.5 opacity-50">
          <Clock className="h-3 w-3" />
          <span className="text-[9px] font-black uppercase tracking-tight">
            {formatDistanceToNow(new Date(suggestion.created_at), { addSuffix: true, locale: ptBR })}
          </span>
        </div>
      </div>
    </Card>
  );
}