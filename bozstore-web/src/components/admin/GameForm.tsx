'use client'

import { useActionState, useEffect, useId, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Image as ImageIcon, Link2, Loader2, Upload, X } from 'lucide-react'
import type { Game } from '@/types/game'
import type { ActionState } from '@/app/actions/games'
import { createClient } from '@/lib/supabase/client'

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>
type ImgMode = 'url' | 'file'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

// Sube la imagen a través del API (clave de servicio → ignora políticas RLS).
async function uploadToStorage(file: File, folder: string): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const dataUrl = await readAsDataUrl(file)
    const res = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ file: dataUrl, filename: file.name, folder }),
    })
    if (!res.ok) return null
    const json = (await res.json()) as { data?: { url?: string } }
    return json?.data?.url ?? null
  } catch {
    return null
  }
}

// ─── Single image field (toggle URL ↔ archivo) ───────────────────────────────

function ImageUploadField({
  name,
  label,
  hint,
  defaultValue,
  folder,
  previewClass,
  error,
}: {
  name: string
  label: string
  hint: string
  defaultValue?: string
  folder: string
  previewClass: string
  error?: string
}) {
  const fileId = useId()
  const [mode, setMode]         = useState<ImgMode>('url')
  const [url, setUrl]           = useState(defaultValue ?? '')
  const [uploading, setUploading] = useState(false)
  const [upErr, setUpErr]       = useState('')

  async function handleFile(file: File) {
    setUpErr('')
    setUploading(true)
    const result = await uploadToStorage(file, folder)
    if (result) {
      setUrl(result)
      setMode('url')
    } else {
      setUpErr('No se pudo subir la imagen. Revisa que el API esté corriendo e intenta de nuevo.')
    }
    setUploading(false)
  }

  return (
    <div>
      {/* Label + mode toggle */}
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="font-inter text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/40">
          {label}
          <span className="ml-1.5 normal-case tracking-normal text-zinc-300 dark:text-white/20">{hint}</span>
        </span>
        <div className="flex shrink-0 overflow-hidden border border-zinc-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1 px-2.5 py-1 font-inter text-[9px] uppercase tracking-wider transition-colors ${
              mode === 'url' ? 'bg-white/10 text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-white/30 hover:text-zinc-500 dark:text-white/50'
            }`}
          >
            <Link2 className="h-2.5 w-2.5" />
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`flex items-center gap-1 border-l border-zinc-200 dark:border-white/10 px-2.5 py-1 font-inter text-[9px] uppercase tracking-wider transition-colors ${
              mode === 'file' ? 'bg-white/10 text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-white/30 hover:text-zinc-500 dark:text-white/50'
            }`}
          >
            <Upload className="h-2.5 w-2.5" />
            Archivo
          </button>
        </div>
      </div>

      {/* Hidden input — always carries the URL */}
      <input type="hidden" name={name} value={url} />

      {mode === 'url' ? (
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className={`w-full border bg-zinc-200 dark:bg-zinc-800 px-4 py-2.5 font-inter text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 outline-none transition-colors focus:border-red-500/40 ${
            error ? 'border-red-500/50' : 'border-zinc-200 dark:border-white/10'
          }`}
        />
      ) : (
        <>
          <input
            id={fileId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          <label
            htmlFor={fileId}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 py-10 transition-colors hover:border-white/25 hover:bg-zinc-200 dark:bg-zinc-800"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400 dark:text-white/30" />
                <span className="font-inter text-[10px] text-zinc-400 dark:text-white/30">Subiendo imagen…</span>
              </>
            ) : (
              <>
                <ImageIcon className="h-7 w-7 text-white/10" />
                <span className="font-inter text-xs text-zinc-500 dark:text-white/40">
                  Haz clic para elegir imagen
                </span>
                <span className="font-inter text-[10px] text-zinc-300 dark:text-white/20">
                  JPG · PNG · WebP · max 5 MB
                </span>
              </>
            )}
          </label>
        </>
      )}

      {upErr  && <p className="mt-1 font-inter text-[10px] text-red-400">{upErr}</p>}
      {error  && <p className="mt-1 font-inter text-[10px] text-red-400">{error}</p>}

      {/* Preview */}
      {url && (
        <div className="mt-3 flex items-start gap-3">
          <div className={`relative ${previewClass} overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-200 dark:bg-zinc-800`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <button
            type="button"
            onClick={() => setUrl('')}
            className="mt-1 flex items-center gap-1 font-inter text-[10px] text-zinc-300 dark:text-white/20 transition-colors hover:text-red-400"
          >
            <X className="h-3 w-3" /> Quitar
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Screenshots field ────────────────────────────────────────────────────────

function ScreenshotsField({ defaultValue }: { defaultValue?: string[] }) {
  const fileId = useId()
  const [lines, setLines]         = useState<string[]>(defaultValue ?? [])
  const [uploading, setUploading] = useState(false)
  const [upErr, setUpErr]         = useState('')

  async function handleFiles(files: FileList) {
    setUpErr('')
    setUploading(true)
    const added: string[] = []
    for (const file of Array.from(files)) {
      const url = await uploadToStorage(file, 'screenshots')
      if (url) added.push(url)
    }
    if (added.length) setLines((p) => [...p, ...added])
    else setUpErr('No se pudieron subir las imágenes.')
    setUploading(false)
  }

  return (
    <div>
      {/* Label + upload button */}
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="font-inter text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/40">
          Capturas de pantalla
          <span className="ml-1.5 normal-case tracking-normal text-zinc-300 dark:text-white/20">
            · URL por línea o sube archivos
          </span>
        </span>
        <>
          <input
            id={fileId}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files) }}
          />
          <label
            htmlFor={fileId}
            className={`flex shrink-0 cursor-pointer items-center gap-1.5 border border-zinc-200 dark:border-white/10 px-2.5 py-1 font-inter text-[9px] uppercase tracking-wider transition-colors ${
              uploading ? 'text-zinc-300 dark:text-white/20' : 'text-zinc-400 dark:text-white/35 hover:border-white/25 hover:text-zinc-700 dark:hover:text-zinc-500 dark:text-white/60'
            }`}
          >
            {uploading
              ? <Loader2 className="h-2.5 w-2.5 animate-spin" />
              : <Upload className="h-2.5 w-2.5" />
            }
            {uploading ? 'Subiendo…' : 'Subir archivos'}
          </label>
        </>
      </div>

      <textarea
        name="screenshots"
        value={lines.join('\n')}
        onChange={(e) => setLines(e.target.value.split('\n'))}
        rows={4}
        placeholder={'https://ejemplo.com/img1.jpg\nhttps://ejemplo.com/img2.jpg'}
        className="w-full resize-none border border-zinc-200 dark:border-white/10 bg-zinc-200 dark:bg-zinc-800 px-4 py-2.5 font-inter text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 outline-none transition-colors focus:border-red-500/40"
      />

      {upErr && <p className="mt-1 font-inter text-[10px] text-red-400">{upErr}</p>}

      {/* Preview grid */}
      {lines.filter(Boolean).length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {lines.filter(Boolean).map((url, i) => (
            <div key={i} className="group relative aspect-video overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-200 dark:bg-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setLines((p) => p.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center bg-black/70 text-zinc-600 dark:text-white/70 transition-colors hover:bg-red-600/80 hover:text-zinc-900 dark:text-white group-hover:flex"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Text field helper ────────────────────────────────────────────────────────

function Field({
  label, name, defaultValue, error, type = 'text', required, placeholder, step, min,
}: {
  label: string; name: string; defaultValue?: string | number; error?: string
  type?: string; required?: boolean; placeholder?: string; step?: string; min?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block font-inter text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/40">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={type} name={name} defaultValue={defaultValue} required={required}
        placeholder={placeholder} step={step} min={min}
        className={`w-full border bg-zinc-200 dark:bg-zinc-800 px-4 py-2.5 font-inter text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 outline-none transition-colors focus:border-red-500/40 ${
          error ? 'border-red-500/50' : 'border-zinc-200 dark:border-white/10'
        }`}
      />
      {error && <p className="mt-1 font-inter text-[10px] text-red-400">{error}</p>}
    </div>
  )
}

// ─── Submit button ────────────────────────────────────────────────────────────

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit" disabled={pending}
      className="bg-red-600 px-8 py-3 font-inter text-xs uppercase tracking-widest text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Guardando…' : label}
    </button>
  )
}

// ─── Slugify ──────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function GameForm({
  action,
  game,
  submitLabel = 'Guardar',
}: {
  action: Action
  game?: Game
  submitLabel?: string
}) {
  const [state, formAction] = useActionState(action, null)
  const titleRef = useRef<HTMLInputElement>(null)
  const slugRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (game) return
    const title = titleRef.current
    const slug  = slugRef.current
    if (!title || !slug) return
    const handler = () => { slug.value = slugify(title.value) }
    title.addEventListener('input', handler)
    return () => title.removeEventListener('input', handler)
  }, [game])

  return (
    <form action={formAction} className="space-y-8">
      {state?.message && (
        <div className="border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="font-inter text-xs text-red-500">{state.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

        {/* ── Columna izquierda — datos del juego ── */}
        <div className="space-y-5">

          {/* Título */}
          <div>
            <label className="mb-1.5 block font-inter text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/40">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleRef} type="text" name="title" defaultValue={game?.title}
              required placeholder="Ej: Cyberpunk 2077"
              className={`w-full border bg-zinc-200 dark:bg-zinc-800 px-4 py-2.5 font-inter text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 outline-none transition-colors focus:border-red-500/40 ${
                state?.errors?.title ? 'border-red-500/50' : 'border-zinc-200 dark:border-white/10'
              }`}
            />
            {state?.errors?.title && (
              <p className="mt-1 font-inter text-[10px] text-red-400">{state.errors.title}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block font-inter text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/40">
              Slug <span className="text-red-500">*</span>
              {!game && <span className="ml-2 normal-case tracking-normal text-zinc-300 dark:text-white/20">· auto</span>}
            </label>
            <input
              ref={slugRef} type="text" name="slug" defaultValue={game?.slug}
              required pattern={"[a-z0-9\\-]+"} placeholder="ej: cyberpunk-2077"
              className={`w-full border bg-zinc-200 dark:bg-zinc-800 px-4 py-2.5 font-inter text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 outline-none transition-colors focus:border-red-500/40 ${
                state?.errors?.slug ? 'border-red-500/50' : 'border-zinc-200 dark:border-white/10'
              }`}
            />
            {state?.errors?.slug && (
              <p className="mt-1 font-inter text-[10px] text-red-400">{state.errors.slug}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="mb-1.5 block font-inter text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/40">
              Descripción
            </label>
            <textarea
              name="description" defaultValue={game?.description} rows={5}
              placeholder="Descripción del juego…"
              className="w-full resize-none border border-zinc-200 dark:border-white/10 bg-zinc-200 dark:bg-zinc-800 px-4 py-2.5 font-inter text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/20 outline-none transition-colors focus:border-red-500/40"
            />
          </div>

          {/* Precio + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio (USD)" name="price" type="number" defaultValue={game?.price} required step="0.01" min="0.01" placeholder="29.99" error={state?.errors?.price} />
            <Field label="Stock" name="stock" type="number" defaultValue={game?.stock ?? 0} required min="0" placeholder="0" error={state?.errors?.stock} />
          </div>

          {/* Descuento + Desarrollador */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Descuento (%)" name="discount_percent" type="number" defaultValue={game?.discount_percent ?? 0} min="0" placeholder="0" error={state?.errors?.discount_percent} />
            <Field label="Desarrollador" name="developer" defaultValue={game?.developer} placeholder="Ej: CD Projekt Red" error={state?.errors?.developer} />
          </div>

          {/* Género + Plataforma */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Género" name="genre" defaultValue={game?.genre} placeholder="Ej: RPG, FPS" error={state?.errors?.genre} />
            <Field label="Plataforma" name="platform" defaultValue={game?.platform} placeholder="Ej: PC, PS5, Xbox" error={state?.errors?.platform} />
          </div>

          {/* Fecha + Tráiler */}
          <Field label="Fecha de lanzamiento" name="release_date" type="date" defaultValue={game?.release_date?.slice(0, 10)} error={state?.errors?.release_date} />
          <Field label="URL del tráiler (YouTube)" name="trailer_url" type="url" defaultValue={game?.trailer_url} placeholder="https://youtube.com/watch?v=..." error={state?.errors?.trailer_url} />
        </div>

        {/* ── Columna derecha — imágenes ── */}
        <div className="space-y-7">

          <ImageUploadField
            name="cover_url"
            label="Portada"
            hint="· vertical 3:4"
            defaultValue={game?.cover_url}
            folder="covers"
            previewClass="w-24 aspect-[3/4]"
            error={state?.errors?.cover_url}
          />

          <ImageUploadField
            name="banner_url"
            label="Banner"
            hint="· horizontal 16:9"
            defaultValue={game?.banner_url}
            folder="banners"
            previewClass="w-48 aspect-video"
            error={state?.errors?.banner_url}
          />

          <ScreenshotsField defaultValue={game?.screenshots} />

        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-5 border-t border-zinc-200 dark:border-white/10 pt-6">
        <SubmitButton label={submitLabel} />
        <a
          href="/admin/games"
          className="font-inter text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/40 transition-colors hover:text-zinc-700 dark:hover:text-zinc-500 dark:text-white/60"
        >
          Cancelar
        </a>
      </div>
    </form>
  )
}
