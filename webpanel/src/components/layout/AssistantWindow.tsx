"use client"

import * as React from "react"
import {
    Send,
    Paperclip,
    Image as ImageIcon,
    Mic,
    X,
    Maximize2,
    Minimize2,
    Bot,
    User,
    RefreshCw,
    Globe,
    Star,
    Clock,
    MoreHorizontal,
    LayoutGrid,
    Search,
    ChevronDown,
    Sparkles,
    ChevronLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface AssistantWindowProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const SUGGESTED_PROMPTS = [
    { id: 1, title: "Create an illustration for a supper shop", icon: "🍔" },
    { id: 2, title: "Revise my writing and fix my grammar", icon: "✍️" },
    { id: 3, title: "Solve the two sum problem in Python", icon: "🧠" },
    { id: 4, title: "Experience seoul like a local", icon: "🌇" }
]

const HISTORY = {
    saved: [
        { id: 1, title: "Today's Key News Upda..." },
        { id: 2, title: "React vs Tailwindui Over..." }
    ],
    recent: [
        { id: 3, title: "Beginner Resistance Tra..." },
        { id: 4, title: "Futuristic Cityscape Ima..." },
        { id: 5, title: "Creating Presentation Im..." },
        { id: 6, title: "UX Transition Plan Notio..." },
        { id: 7, title: "Hello World Interaction" },
        { id: 8, title: "Welcome Assistance Off..." },
        { id: 9, title: "Restore Action Alternati..." },
        { id: 10, title: "Merchant Management ..." },
        { id: 11, title: "Cash Flow Management..." },
        { id: 12, title: "Good Icon Review Temp..." },
        { id: 13, title: "Weather Data Preferenc..." },
        { id: 14, title: "AIAP Implementation im..." }
    ]
}

export function AssistantWindow({ open, onOpenChange }: AssistantWindowProps) {
    const pathname = usePathname()
    const [input, setInput] = React.useState("")
    const [messages, setMessages] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
    const scrollRef = React.useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when messages change
    React.useEffect(() => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (viewport) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
            }
        }
    }, [messages])

    const handleSend = (text: string = input) => {
        if (!text.trim() || isLoading) return

        const newMsg = { role: "user", content: text }
        setMessages(prev => [...prev, newMsg])
        setInput("")
        setIsLoading(true)

        // Simulate AI
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Olá! Como posso ajudar com sua frota de clusters hoje?"
            }])
            setIsLoading(false)
        }, 1000)
    }

    if (!open) return null

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 z-[55] bg-[#181818]/80 backdrop-blur-[2px]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                        exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={cn(
                            "fixed z-[60] left-1/2 top-1/2 flex bg-white rounded-[2rem] shadow-[0_20px_70px_rgba(0,0,0,0.3)] border border-zinc-100 text-zinc-900",
                            "h-[85vh] max-h-[700px] w-[95vw]",
                            isSidebarOpen ? "md:w-[950px]" : "md:w-[650px]"
                        )}
                    >
                        {/* Main Section */}
                        <div className="flex-1 flex flex-col min-w-0 bg-white relative rounded-[2rem] overflow-hidden">
                            {/* Header Minimalista (Só fechar) */}
                            <div className="flex items-center justify-end p-4 bg-white shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-full text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all"
                                    onClick={() => onOpenChange(false)}
                                >
                                    <X className="h-6 w-6 stroke-[3px]" />
                                </Button>
                            </div>

                            <div className="flex-1 flex flex-col min-h-0 relative">
                                {/* Messages Area */}
                                <ScrollArea ref={scrollRef} className="flex-1 px-6 md:px-12 py-2">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center opacity-0">
                                            {/* Espaço reservado */}
                                        </div>
                                    ) : (
                                        <div className="space-y-8 pb-10">
                                            {messages.map((m, i) => (
                                                <div key={i} className={cn(
                                                    "flex gap-4 max-w-[90%] md:max-w-[85%]",
                                                    m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                                )}>
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                                        m.role === 'user' ? "bg-blue-600 text-white" : "bg-zinc-50 text-blue-600 border border-zinc-100"
                                                    )}>
                                                        {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                                    </div>
                                                    <div className={cn(
                                                        "rounded-[1.5rem] px-5 py-3 text-sm leading-relaxed",
                                                        m.role === 'user'
                                                            ? "bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/20"
                                                            : "bg-white border border-zinc-100 text-zinc-800 rounded-tl-none shadow-sm"
                                                    )}>
                                                        {m.content}
                                                    </div>
                                                </div>
                                            ))}
                                            {isLoading && (
                                                <div className="flex gap-4 animate-pulse">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-50" />
                                                    <div className="rounded-[1.5rem] px-5 py-3 bg-zinc-50 w-24 h-10 border border-zinc-100" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </ScrollArea>

                                {/* Fixed Bottom Area */}
                                <div className="px-4 py-2 md:px-8 md:py-4 bg-gradient-to-t from-white via-white to-transparent shrink-0 border-t border-dashed border-blue-500/30">
                                    <div className="relative group w-full max-w-3xl mx-auto">
                                        <div className="bg-transparent rounded-[4px] p-2 md:p-3 transition-all">
                                            <div className="flex flex-col gap-4">
                                                <textarea
                                                    className="w-full bg-transparent border-none focus:ring-0 text-md placeholder:text-zinc-300 resize-none py-1 min-h-[60px]"
                                                    placeholder="Pergunte qualquer coisa..."
                                                    value={input}
                                                    onChange={(e) => setInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault()
                                                            handleSend()
                                                        }
                                                    }}
                                                />
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 md:gap-2">
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-zinc-400 hover:text-blue-600 hover:bg-blue-50">
                                                            <Mic className="h-5 w-5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-zinc-400 hover:text-blue-600 hover:bg-blue-50">
                                                            <Paperclip className="h-5 w-5" />
                                                        </Button>
                                                        <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-zinc-300 ml-2">Anexar conteúdo</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 md:gap-4">
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-zinc-300 hover:text-blue-500">
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            onClick={() => handleSend()}
                                                            className="h-12 w-12 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all"
                                                        >
                                                            <Send className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Historico (Retrátil) */}
                        <AnimatePresence mode="wait">
                            {isSidebarOpen ? (
                                <motion.div
                                    key="sidebar"
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 300, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ type: "spring", damping: 35, stiffness: 80, mass: 1.5 }}
                                    className="border-l border-zinc-100 bg-zinc-50/50 flex flex-col shrink-0 overflow-hidden relative shadow-inner rounded-r-[2rem]"
                                >
                                    <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-zinc-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Histórico</span>
                                        </div>
                                        <button
                                            onClick={() => setIsSidebarOpen(false)}
                                            className="p-2 rounded-full hover:bg-blue-50 text-blue-600 transition-all hover:scale-110 active:scale-90"
                                        >
                                            <X className="h-6 w-6 stroke-[3px]" />
                                        </button>
                                    </div>

                                    <ScrollArea className="flex-1">
                                        <div className="p-6 space-y-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tópicos Salvos</span>
                                                </div>
                                                <div className="space-y-1">
                                                    {HISTORY.saved.map(item => (
                                                        <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white border border-transparent hover:border-zinc-200 cursor-pointer group transition-all shadow-sm hover:shadow-md">
                                                            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                                            <span className="text-xs font-bold text-zinc-600 truncate">{item.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Recentes</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3 p-3 bg-blue-600 text-white rounded-[1.25rem] cursor-pointer shadow-lg shadow-blue-500/20 mb-4 transition-transform active:scale-95">
                                                        <LayoutGrid className="h-4 w-4" />
                                                        <span className="text-xs font-bold">Novo chat</span>
                                                    </div>
                                                    {HISTORY.recent.map(item => (
                                                        <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-zinc-100 cursor-pointer group transition-all">
                                                            <Star className="h-3.5 w-3.5 text-zinc-300 group-hover:text-amber-400" />
                                                            <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-800 truncate">{item.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </motion.div>
                            ) : (
                                /* Toggle Guide UI (External) */
                                <motion.div
                                    key="guide"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="absolute left-[calc(100%+1px)] top-[100px] flex items-center"
                                >
                                    <button
                                        onClick={() => setIsSidebarOpen(true)}
                                        className="h-20 w-8 bg-blue-600 border border-l-0 border-blue-500 rounded-r-2xl flex items-center justify-center text-white hover:w-10 transition-all group shadow-[10px_0_30px_rgba(37,99,235,0.2)]"
                                    >
                                        <ChevronLeft className="h-5 w-5 rotate-180 group-hover:scale-125 transition-transform" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
