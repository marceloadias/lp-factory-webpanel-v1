"use client"

import * as React from "react"
import { Send, Paperclip, AlertTriangle, User, Bot, HelpCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { apiClient } from "@/lib/api/client"

interface AssistantSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AssistantSheet({ open, onOpenChange }: AssistantSheetProps) {
    const pathname = usePathname()
    const [input, setInput] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [messages, setMessages] = React.useState([
        { role: "assistant", content: "Olá! Como posso ajudar com sua frota de clusters hoje?" }
    ])

    const handleSend = () => {
        if (!input.trim() || isLoading) return
        const newMsg = { role: "user", content: input }
        setMessages(prev => [...prev, newMsg])
        const userText = input.toLowerCase()
        setInput("")
        setIsLoading(true)

        // Simulate AI response
        setTimeout(() => {
            let response = "Estou processando seu pedido de contexto. O Engine Engine está operacional."

            // Out of scope rule
            const isLPFactoryRelated =
                userText.includes('lp') ||
                userText.includes('factory') ||
                userText.includes('cluster') ||
                userText.includes('job') ||
                userText.includes('cache') ||
                userText.includes('engine') ||
                userText.includes('audit') ||
                userText.includes('status') ||
                userText.includes('provid') ||
                userText.includes('setting') ||
                userText.includes('config')

            if (!isLPFactoryRelated) {
                response = "Desculpe, eu só trabalho na FACTORY."
            }

            setMessages(prev => [...prev, { role: "assistant", content: response }])
            setIsLoading(false)
        }, 800)
    }

    const attachContext = () => {
        const contextMsg = `Estou analisando a página: ${pathname}. Como posso ajudar com os dados deste contexto?`
        setMessages(prev => [...prev, { role: "assistant", content: contextMsg }])
        toast.success("Contexto da página anexado")
    }

    const sendToAudit = async () => {
        setIsLoading(true)
        try {
            await apiClient.post('/jobs', {
                type: 'audit_request',
                project_id: 'global',
                cluster_id: 'system',
                payload: {
                    reason: 'Solicitação via Chat Assistant',
                    path: pathname,
                    timestamp: new Date().toISOString()
                }
            })

            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Ticket de auditoria criado com sucesso no Engine. Você pode acompanhar o progresso na página de Auditoria."
            }])
            toast.success("Solicitação enviada para Auditoria")
        } catch (error) {
            console.error("Audit error:", error)
            toast.error("Erro ao enviar para Auditoria")
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Desculpe, não consegui criar o ticket no Engine agora. Verifique a conexão com o Motor."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md flex flex-col p-0 glass border-l border-border shadow-2xl">
                <SheetHeader className="p-6 border-b border-white/10 bg-primary text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                            <Bot className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <SheetTitle className="text-white text-lg font-black tracking-tight">Factory Assistant</SheetTitle>
                            <div className="flex items-center gap-1.5 opacity-80 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Engine Model 4-O
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                        {messages.map((m, i) => (
                            <div key={i} className={cn(
                                "flex gap-3 max-w-[90%]",
                                m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                            )}>
                                <div className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                    m.role === 'user' ? "bg-primary text-white" : "bg-muted text-primary border border-border"
                                )}>
                                    {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className={cn(
                                    "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                                    m.role === 'user'
                                        ? "bg-primary text-white rounded-tr-none"
                                        : "bg-muted text-foreground rounded-tl-none border border-border"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 animate-pulse">
                                <div className="w-8 h-8 rounded-xl bg-muted" />
                                <div className="rounded-2xl px-4 py-3 bg-muted w-24 h-10" />
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-border space-y-4 bg-background/50 backdrop-blur-sm">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={attachContext}
                            disabled={isLoading}
                            className="text-[10px] gap-1.5 h-8 rounded-full bg-muted/50 border-border hover:bg-muted font-bold uppercase tracking-tight"
                        >
                            <Paperclip className="h-3 w-3" />
                            Contexto
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={sendToAudit}
                            disabled={isLoading}
                            className="text-[10px] gap-1.5 h-8 rounded-full bg-muted/50 border-border hover:bg-muted font-bold uppercase tracking-tight"
                        >
                            <AlertTriangle className="h-3 w-3" />
                            Auditoria
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder="Pergunte qualquer coisa..."
                            className="h-11 text-sm focus-visible:ring-primary rounded-2xl bg-muted/50 border-border"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isLoading}
                        />
                        <Button
                            size="icon"
                            className="h-11 w-11 shrink-0 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                            onClick={handleSend}
                            disabled={isLoading}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <SheetFooter className="p-4 pt-0">
                    <div className="w-full flex justify-center items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-50">
                        Powered by Engine IA
                        <HelpCircle className="h-3 w-3" />
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
