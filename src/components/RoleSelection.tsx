'use client';

import { UserCircle, ShieldCheck, ChevronRight } from 'lucide-react';

interface RoleSelectionProps {
  onSelect: (role: 'admin' | 'waiter') => void;
}

export default function RoleSelection({ onSelect }: RoleSelectionProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-floating"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-floating" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 w-full max-w-4xl px-6 text-center">
        <div className="mb-12 animate-fade-down">
          <h1 className="text-6xl font-black tracking-tighter mb-4 bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
            BIENVENIDO A <span className="text-primary">RESTO POS</span>
          </h1>
          <p className="text-muted font-medium text-lg tracking-widest uppercase">Selecciona tu perfil para continuar</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Admin Role Card */}
          <button 
            onClick={() => onSelect('admin')}
            className="group relative p-10 glass rounded-[2.5rem] text-left hover:scale-[1.02] transition-all border-white/5 hover:border-primary/40 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-20 transition-opacity">
                <ShieldCheck size={120} className="text-primary" />
            </div>
            
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all shadow-lg group-hover:shadow-primary/20">
              <ShieldCheck size={32} />
            </div>
            
            <h2 className="text-3xl font-black mb-3">Administrador</h2>
            <p className="text-muted leading-relaxed mb-8">Gestión total: menú, analíticas detalladas, control de inventario y configuración del sistema.</p>
            
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm">
              Ingresar como panel master <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Waiter Role Card */}
          <button 
            onClick={() => onSelect('waiter')}
            className="group relative p-10 glass rounded-[2.5rem] text-left hover:scale-[1.02] transition-all border-white/5 hover:border-success/40 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-20 transition-opacity">
                <UserCircle size={120} className="text-success" />
            </div>

            <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center text-success mb-8 group-hover:bg-success group-hover:text-white transition-all shadow-lg group-hover:shadow-success/20">
              <UserCircle size={32} />
            </div>
            
            <h2 className="text-3xl font-black mb-3">Mesero</h2>
            <p className="text-muted leading-relaxed mb-8">Optimizado para el servicio: toma de pedidos rápida, mapa de mesas en tiempo real y facturación directa.</p>
            
            <div className="flex items-center gap-2 text-success font-bold uppercase tracking-widest text-sm">
              Comenzar servicio <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <div className="mt-20 text-muted/30 font-bold uppercase tracking-[0.5em] text-xs">
          Premium Management System v2.0
        </div>
      </div>
    </div>
  );
}
