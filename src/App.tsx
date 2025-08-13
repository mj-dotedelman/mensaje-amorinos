import React, { useEffect, useMemo, useRef, useState } from "react";
import { Heart, Star, Sun, Music, Camera, UploadCloud, Image as ImageIcon, Trash2, Search, Calendar, Filter, Download, SendHorizontal, Lock, Unlock, ChevronLeft, ChevronRight } from "lucide-react";

// App para MJ & Luis — "Mensaje amoriños en cualquier momento del día"
// Actualización: Perfiles (MJ/Luis), portadas con galería de fotos, y PIN (1309).

const APP_KEY = "amorinhos_diario_v2";
const GALLERY_KEY = "amorinhos_galeria_v1";
const PIN_KEY = "amorinhos_pin_ok";
const APP_PIN = "1309"; // solicitado por MJ

const CATEGORIES = [
  { id: "carinitos", label: "Cariñitos", color: "bg-pink-200 text-pink-900" },
  { id: "favores", label: "Favores", color: "bg-amber-200 text-amber-900" },
  { id: "reminders", label: "Friendly reminders", color: "bg-lime-200 text-lime-900" },
  { id: "recuerdos", label: "Recuerdos bonitos", color: "bg-sky-200 text-sky-900" },
] as const;

type CategoryId = typeof CATEGORIES[number]["id"];

const PROFILES = [
  { id: "mj", name: "MJ", color: "from-pink-400 to-rose-400", badge: "bg-rose-200 text-rose-900", emoji: "🌞" },
  { id: "luis", name: "Luis", color: "from-amber-400 to-yellow-400", badge: "bg-amber-200 text-amber-900", emoji: "🎵" },
] as const;

type ProfileId = typeof PROFILES[number]["id"];

type Msg = {
  id: string;
  texto: string;
  categoria: CategoryId;
  fecha: string; // ISO
  fotoDataUrl?: string | null;
  reacciones: Record<string, number>;
  autor: ProfileId;
};

const REACTIONS = [
  { key: "heart", emoji: "❤️", label: "Amor" },
  { key: "star", emoji: "⭐️", label: "Estrella" },
  { key: "sun", emoji: "☀️", label: "Sol" },
  { key: "music", emoji: "🎵", label: "Música" },
] as const;

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

function Badge({ categoria }: { categoria: CategoryId }) {
  const cat = CATEGORIES.find((c) => c.id === categoria)!;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${cat.color}`}>
      {cat.label}
    </span>
  );
}

function ProfilePill({ id, active, onClick }:{ id: ProfileId; active: boolean; onClick: ()=>void }){
  const p = PROFILES.find(p=>p.id===id)!;
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm border ${active?"border-black/10 bg-white/80 shadow":"border-amber-200 bg-white/60"}`}>
      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${p.color}`}>{p.emoji}</span>
      <span className="font-semibold">{p.name}</span>
    </button>
  );
}

function Header({ gallery, onPrev, onNext }:{ gallery: string[]; onPrev: ()=>void; onNext: ()=>void }) {
  return (
    <header className="relative overflow-hidden rounded-[22px] border-4 border-black/20 shadow-[8px_8px_0_rgba(0,0,0,.25)] paper">
      {gallery[0] && <img src={gallery[0]} alt="portada" className="absolute inset-0 h-full w-full object-cover opacity-30" />}
      <div className="relative p-6">
        <TitleCutout text="Mensaje amoriños en cualquier momento del día" />
        <div className="mt-3 flex flex-wrap gap-2">
          <Sticker>✨ muy dosmilero ✨</Sticker>
          <Sticker><Sun className="w-4 h-4"/> soles</Sticker>
          <Sticker><Music className="w-4 h-4"/> música</Sticker>
        </div>
        {gallery.length>1 && (
          <div className="mt-4 flex items-center gap-2">
            <button onClick={onPrev} className="btn-y2k rounded-full px-3 py-2"><ChevronLeft className="w-4 h-4"/></button>
            <div className="flex gap-2 overflow-x-auto p-1">
              {gallery.slice(0,6).map((g,i)=>(
                <img key={i} src={g} className="h-16 w-16 rounded-xl object-cover border-2 border-black/30 shadow-[3px_3px_0_rgba(0,0,0,.25)]"/>
              ))}
            </div>
            <button onClick={onNext} className="btn-y2k rounded-full px-3 py-2"><ChevronRight className="w-4 h-4"/></button>
          </div>
        )}
      </div>
    </header>
  );
}

function NuevaNota({ current, onAdd }: { current: ProfileId; onAdd: (m: Msg) => void }) {
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState<CategoryId>("carinitos");
  const [fotoDataUrl, setFotoDataUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setFotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() && !fotoDataUrl) return;
    const newMsg: Msg = {
      id: crypto.randomUUID(),
      texto: texto.trim(),
      categoria,
      fecha: new Date().toISOString(),
      fotoDataUrl: fotoDataUrl || undefined,
      reacciones: Object.fromEntries(REACTIONS.map(r => [r.key, 0])),
      autor: current,
    };
    onAdd(newMsg);
    setTexto("");
    setCategoria("carinitos");
    setFotoDataUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border bg-white/70 backdrop-blur p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-amber-900">Escribe un mensaje</label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Hoy me he acordado de ti porque..."
          className="min-h-[90px] w-full resize-y rounded-2xl border border-amber-200 bg-white/80 p-3 outline-none focus:ring-2 focus:ring-amber-300"
        />
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-amber-900">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoryId)}
              className="rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="foto" className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-sm cursor-pointer hover:bg-amber-50">
              <Camera className="w-4 h-4"/> Añadir foto
            </label>
            <input id="foto" ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e)=>{
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}/>
            {fotoDataUrl && (
              <span className="text-xs text-amber-800/80 inline-flex items-center gap-2">
                <ImageIcon className="w-4 h-4"/> Foto cargada
                <button type="button" onClick={()=>setFotoDataUrl(null)} className="ml-1 text-pink-700 hover:underline">Quitar</button>
              </span>
            )}
          </div>

          <button type="submit" className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-pink-400 px-4 py-2 text-amber-950 font-semibold shadow hover:brightness-110 active:scale-[0.99]">
            <SendHorizontal className="w-4 h-4"/> Publicar
          </button>
        </div>
        {fotoDataUrl && (<img src={fotoDataUrl} alt="Vista previa" className="mt-1 max-h-56 w-auto rounded-2xl border object-cover"/>) }
      </div>
    </form>
  );
}

function ReaccionBar({ msg, onReact }: { msg: Msg; onReact: (id: string, key: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {REACTIONS.map((r) => (
        <button key={r.key} onClick={() => onReact(msg.id, r.key)}
          className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-sm hover:bg-amber-50">
          <span aria-hidden>{r.emoji}</span>
          <span className="tabular-nums">{msg.reacciones[r.key] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

function NotaCard({ msg, onDelete, onReact }: { msg: Msg; onDelete: (id: string)=>void; onReact: (id:string, key:string)=>void }) {
  const fechaBonita = new Date(msg.fecha).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  const autor = PROFILES.find(p=>p.id===msg.autor)!;
  return (
    <article className="rounded-3xl border bg-white/80 backdrop-blur p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs bg-gradient-to-br ${autor.color} text-amber-950`}> {autor.emoji} {autor.name}</span>
        <Badge categoria={msg.categoria} />
        <span className="ml-auto text-xs text-amber-800/70 flex items-center gap-1"><Calendar className="w-3 h-3"/>{fechaBonita}</span>
      </div>
      {msg.texto && <p className="mt-3 whitespace-pre-wrap text-amber-950">{msg.texto}</p>}
      {msg.fotoDataUrl && (<img src={msg.fotoDataUrl} alt="foto" className="mt-3 w-full max-h-[420px] object-cover rounded-2xl border" />)}
      <div className="mt-3 flex items-center gap-3">
        <ReaccionBar msg={msg} onReact={onReact} />
        <button onClick={()=>onDelete(msg.id)} className="ml-auto inline-flex items-center gap-1 rounded-xl border border-red-200 bg-white/70 px-3 py-1 text-sm text-red-700 hover:bg-red-50">
          <Trash2 className="w-4 h-4"/> Borrar
        </button>
      </div>
    </article>
  );
}

function Gallery({ items, setItems }:{ items: string[]; setItems: (v:string[])=>void }){
  const fileRef = useRef<HTMLInputElement|null>(null);
  const onFile = (f: File) => {
    const r = new FileReader();
    r.onload = () => setItems([r.result as string, ...items].slice(0,20));
    r.readAsDataURL(f);
  };
  return (
    <div className="rounded-3xl border bg-white/70 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Vuestras fotos</h3>
        <label className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-sm hover:bg-amber-50 cursor-pointer">
          <Camera className="w-4 h-4"/> Añadir portada
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if(f) onFile(f); }}/>
        </label>
      </div>
      {items.length===0 ? (
        <p className="mt-2 text-sm text-amber-800/70">Subid aquí vuestras 4 fotos favoritas para la cabecera. También podéis añadir más.</p>
      ) : (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map((src, i)=> (
            <img key={i} src={src} className="h-28 w-full object-cover rounded-xl border"/>
          ))}
        </div>
      )}
    </div>
  );
}

function PinGate({ onUnlock }:{ onUnlock: ()=>void }){
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const tryUnlock = () => {
    if(pin === APP_PIN){
      try { localStorage.setItem(PIN_KEY, JSON.stringify(true)); } catch {}
      onUnlock();
    } else {
      setErr("PIN incorrecto");
    }
  };
  useEffect(()=>{
    try {
      const ok = JSON.parse(localStorage.getItem(PIN_KEY) || "false");
      if(ok) onUnlock();
    } catch {}
  }, [onUnlock]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-50 via-rose-50 to-white">
      <div className="w-full max-w-sm rounded-3xl border bg-white/80 p-6 text-center">
        <div className="mx-auto mb-2 h-12 w-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-300 to-pink-300"><Lock className="w-6 h-6"/></div>
        <h2 className="text-xl font-semibold">Hola MJ & Luis</h2>
        <p className="text-sm text-amber-800/70">Introduce el PIN para entrar en vuestro diario</p>
        <input value={pin} onChange={(e)=>setPin(e.target.value)} placeholder="••••" className="mt-4 w-full rounded-xl border p-3 text-center tracking-widest"/>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
        <button onClick={tryUnlock} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-pink-400 px-4 py-2 text-amber-950 font-semibold shadow">
          <Unlock className="w-4 h-4"/> Entrar
        </button>
      </div>
    </div>
  );
}

// --- 2000s THEME HELPERS --- //
const cutColors = ["#FFB3D1","#FFF275","#AEE1FF","#C4F3A4","#FFBE76","#BFB2FF"];
const TitleCutout = ({text}:{text:string}) => (
  <div className="flex flex-wrap gap-2">
    {text.split(" ").map((w,i)=> (
      <span key={i} className="font-black text-xl sm:text-2xl md:text-3xl tracking-tight inline-block px-2 py-1 shadow-[2px_2px_0px_rgba(0,0,0,0.4)] rotate-[-1deg]" style={{background: cutColors[i%cutColors.length], transform:`rotate(${(i%2?1:-1)*3}deg) skew(${i%3?-1:1}deg)`, borderRadius:4, border:"2px solid rgba(0,0,0,.6)"}}>{w}</span>
    ))}
  </div>
);

const Sticker = ({children}:{children:React.ReactNode}) => (
  <span className="inline-flex items-center gap-1 rounded-full border-2 border-black/60 bg-white/70 px-3 py-1 shadow-[3px_3px_0_rgba(0,0,0,.35)]">
    {children}
  </span>
);

export default function App() {
  const [mensajes, setMensajes] = useLocalStorage<Msg[]>(APP_KEY, []);
  const [gallery, setGallery] = useLocalStorage<string[]>(GALLERY_KEY, []);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"todas" | CategoryId>("todas");
  const [current, setCurrent] = useState<ProfileId>("mj");
  const [unlocked, setUnlocked] = useState(false);

  if(!unlocked){
    return <PinGate onUnlock={()=>setUnlocked(true)} />;
  }

  const addMsg = (m: Msg) => setMensajes((arr) => [m, ...arr]);
  const deleteMsg = (id: string) => setMensajes((arr) => arr.filter((m) => m.id !== id));
  const reactTo = (id: string, key: string) => setMensajes((arr) => arr.map((m) => m.id === id ? { ...m, reacciones: { ...m.reacciones, [key]: (m.reacciones[key] ?? 0) + 1 } } : m));

  const filtered = useMemo(() => {
    return mensajes.filter((m) => (cat === "todas" || m.categoria === cat) && (q.trim() === "" || m.texto?.toLowerCase().includes(q.toLowerCase())));
  }, [mensajes, cat, q]);

  const stats = useMemo(() => {
    const total = mensajes.length;
    const porCat = Object.fromEntries(CATEGORIES.map(c => [c.id, mensajes.filter(m => m.categoria === c.id).length]));
    const reaccTotal = mensajes.reduce((acc, m) => {
      for (const r of REACTIONS) acc += m.reacciones[r.key] ?? 0;
      return acc;
    }, 0);
    return { total, porCat, reaccTotal } as const;
  }, [mensajes]);

  // Carousel handlers
  const rotatePrev = () => setGallery(g => g.length? [g[g.length-1], ...g.slice(0, g.length-1)] : g);
  const rotateNext = () => setGallery(g => g.length? [...g.slice(1), g[0]] : g);

  return (
    <div className="min-h-screen text-amber-950" style={{
      backgroundImage:
        "radial-gradient(ellipse at top left, rgba(255,246,143,.5), transparent 40%),"+
        "radial-gradient(ellipse at bottom right, rgba(255,179,222,.45), transparent 40%),"+
        "linear-gradient(45deg, #fff, #fff)",
      backgroundAttachment: "fixed"
    }}>
      {/* Glitter layer */}
      <style>{`
        @keyframes sparkle { 0%{opacity:.2; transform: translateY(0) scale(1);} 50%{opacity:.6; transform: translateY(-4px) scale(1.1);} 100%{opacity:.2; transform: translateY(0) scale(1);} }
        .glitter { position: fixed; inset:0; pointer-events:none; background-image: radial-gradient(circle at 10% 20%, rgba(255,255,255,.7) 0 1px, transparent 2px), radial-gradient(circle at 80% 60%, rgba(255,255,255,.7) 0 1px, transparent 2px), radial-gradient(circle at 30% 80%, rgba(255,255,255,.7) 0 1px, transparent 2px); background-size: 200px 200px; animation: sparkle 3s ease-in-out infinite; }
        .paper { background: repeating-linear-gradient( -45deg, rgba(255,255,255,.85), rgba(255,255,255,.85) 10px, rgba(255,255,255,.92) 10px, rgba(255,255,255,.92) 20px ); border: 2px solid rgba(0,0,0,.1); box-shadow: 6px 6px 0 rgba(0,0,0,.15); border-radius: 22px; }
        .btn-y2k { border:2px solid #00000088; box-shadow: 3px 3px 0 rgba(0,0,0,.35); background-image: linear-gradient(#fff6, #fff0), radial-gradient(circle at top left, #ffe584, #ffb3d2); }
      `}</style>
      <div className="glitter" />

      <div className="mx-auto max-w-5xl p-4 sm:p-6 md:p-8 space-y-6">
        {/* Header con estilo recortes */}
        <Header gallery={gallery} onPrev={rotatePrev} onNext={rotateNext} />

        {/* Selector de perfil con pegatinas */}
        <div className="flex items-center gap-3">
          <span className="text-sm">¿Quién escribe?</span>
          {PROFILES.map(p => (
            <button key={p.id} onClick={()=>setCurrent(p.id)} className={`rounded-full px-4 py-2 text-sm btn-y2k ${current===p.id?"brightness-105":"opacity-90"}`}>
              {p.emoji} {p.name}
            </button>
          ))}
        </div>

        {/* Controles superiores */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex items-center gap-2 flex-1 rounded-2xl border-2 border-black/20 bg-white/80 p-2 shadow-[4px_4px_0_rgba(0,0,0,.25)]">
            <Search className="w-4 h-4"/>
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar mensajes..." className="w-full bg-transparent outline-none text-sm"/>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border-2 border-black/20 bg-white/80 p-2 shadow-[4px_4px_0_rgba(0,0,0,.25)]">
            <Filter className="w-4 h-4"/>
            <select value={cat} onChange={(e)=>setCat(e.target.value as any)} className="bg-transparent text-sm outline-none">
              <option value="todas">Todas las categorías</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <button onClick={()=>{
            const blob = new Blob([JSON.stringify(mensajes, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href=url; a.download="amorinhos_diario.json"; a.click(); URL.revokeObjectURL(url);
          }} className="rounded-2xl px-3 py-2 text-sm btn-y2k">💾 Exportar</button>
          <label className="rounded-2xl px-3 py-2 text-sm btn-y2k cursor-pointer">
            📂 Importar
            <input type="file" accept="application/json" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const data=JSON.parse(String(r.result)); if(Array.isArray(data)) setMensajes(data as Msg[]);}catch{}}; r.readAsText(f); }}/>
          </label>
        </div>

        {/* Galería/portada */}
        <Gallery items={gallery} setItems={setGallery} />

        {/* Formulario nueva nota */}
        <NuevaNota current={current} onAdd={addMsg} />

        {/* Estadísticas rápidas estilo sticker */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="paper p-4 text-center">
            <div className="text-2xl font-extrabold">{stats.total}</div>
            <div className="text-sm">mensajes totales</div>
          </div>
          <div className="paper p-4 text-center">
            <div className="text-2xl font-extrabold">{stats.reaccTotal}</div>
            <div className="text-sm">reacciones en total</div>
          </div>
          <div className="paper p-4 text-center">
            <div className="text-sm">por categoría</div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {CATEGORIES.map(c => (
                <span key={c.id} className={`text-xs px-2 py-1 rounded-full border-2 border-black/30 shadow-[2px_2px_0_rgba(0,0,0,.25)] ${c.color}`}>{c.label}: {stats.porCat[c.id]}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="space-y-3">
          {filtered.length === 0 && (
            <div className="paper p-6 text-center">
              Aún no hay mensajes aquí. ¡Escribid vuestro primer amoriño! 💛💗
            </div>
          )}
          {filtered.map(msg => (
            <NotaCard key={msg.id} msg={msg} onDelete={deleteMsg} onReact={reactTo} />
          ))}
        </section>

        <footer className="pt-8 pb-10 text-center text-xs opacity-80">
          2000s vibes • purpurina • recortes • hecho con ❤️ para MJ & Luis.
        </footer>
      </div>
    </div>
  );
}
