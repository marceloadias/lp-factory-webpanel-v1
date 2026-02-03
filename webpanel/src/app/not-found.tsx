import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function NotFound() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground space-y-6 p-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 text-destructive mb-4">
                <AlertCircle className="h-10 w-10" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight">Página Não Encontrada</h2>
            <p className="text-muted-foreground text-center max-w-md">
                Não conseguimos encontrar a página que você estava procurando. Ela pode ter sido movida ou não existe.
            </p>
            <div className="flex gap-4">
                <Button asChild variant="outline">
                    <Link href="/overview">Ir para Visão Geral</Link>
                </Button>
                <Button asChild>
                    <Link href="/">Voltar ao Início</Link>
                </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-12 bg-muted/50 px-4 py-2 rounded font-mono">
                Erro 404 • Factory
            </div>
        </div>
    )
}
