import { Database, UploadCloud, Cpu, ShieldAlert } from 'lucide-react'

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">Configuración</h1>
        <p className="text-text-muted text-sm mt-1">
          Gestiona integraciones y administración de datos estelares
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Configuration */}
        <div className="bg-background-card border border-border-subtle rounded-xl overflow-hidden glass-card">
          <div className="p-6 border-b border-border-subtle flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue">
              <Cpu size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Asistente IA</h2>
              <p className="text-xs text-text-muted">Configurado via variable de entorno</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-status-warning/5 border border-status-warning/30">
              <ShieldAlert size={18} className="text-status-warning shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs text-text-secondary">
                <p className="font-medium text-text-primary">API key vive en el servidor.</p>
                <p>
                  La clave de OpenRouter se configura como secret de Supabase:
                  <br />
                  <code className="font-mono text-accent-blue">supabase secrets set OPENROUTER_API_KEY=tu_key</code>
                </p>
                <p>
                  La edge function <code className="font-mono text-accent-blue">ai-transaction</code> la usa para llamar al modelo.
                  Deploy: <code className="font-mono text-accent-blue">supabase functions deploy ai-transaction</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-background-card border border-border-subtle rounded-xl overflow-hidden glass-card">
          <div className="p-6 border-b border-border-subtle flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-gold/10 flex items-center justify-center text-accent-gold">
              <Database size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Administrador de Datos</h2>
              <p className="text-xs text-text-muted">Importa o exporta respaldos en lote (JSON)</p>
            </div>
          </div>

          <div className="p-6 flex flex-col items-center justify-center h-48 border-2 border-dashed border-border-subtle rounded-xl bg-bg-secondary/30 mt-4 mx-4">
              <UploadCloud size={32} className="text-text-muted mb-3" />
              <p className="text-text-secondary text-sm font-medium">Arrastra tu archivo JSON aquí</p>
              <p className="text-text-muted text-xs mt-1 text-center max-w-[200px]">
                O haz clic para explorar. Modulo en desarrollo.
              </p>
          </div>
        </div>
      </div>
    </div>
  )
}
