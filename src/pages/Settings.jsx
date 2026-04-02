import { useState } from 'react'
import { Database, UploadCloud, Cpu, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Settings() {
  const { user } = useAuth()
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '')
  const [isSaved, setIsSaved] = useState(false)

  const handleSaveAIConfig = (e) => {
    e.preventDefault()
    localStorage.setItem('gemini_api_key', apiKey)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

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
              <h2 className="font-semibold text-text-primary">Asistente de Inteligencia Artificial</h2>
              <p className="text-xs text-text-muted">Conecta Gemini para importar datos automáticamente</p>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <form onSubmit={handleSaveAIConfig}>
              <div className="mb-4">
                <label className="block text-text-secondary text-sm mb-2">Google Gemini API Key</label>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-subtle rounded-lg pl-4 pr-11 py-3 text-text-primary font-mono focus:outline-none focus:border-accent-blue transition-all input-cosmic"
                    placeholder="AIzaSy..."
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/>
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  La API key se guardará localmente en tu navegador.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all"
                >
                  <Save size={16} />
                  <span>Guardar Configuración</span>
                </button>
                {isSaved && (
                  <span className="text-accent-teal text-sm flex items-center gap-1 animate-in fade-in">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    Guardado
                  </span>
                )}
              </div>
            </form>
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
                O haz clic para explorar. Modulo en desarrollo. (Los datos ya fueron incorporados remotamente).
              </p>
          </div>
        </div>
      </div>
    </div>
  )
}
