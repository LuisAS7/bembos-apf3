import { Beef, CupSoda, Droplet, Hamburger, Sandwich, Utensils } from 'lucide-react'
import { useState } from 'react'
import type { ProductOption } from '../../domain/models.ts'

// Photographs only where the official resource matches. Other options use pictograms.
export function OptionVisual({ groupId, option }: { groupId: string; option: ProductOption }) {
  const [failed, setFailed] = useState(false)
  const photos: Record<string, string> = { 'bebida.cola': 'cola', 'bebida.agua': 'agua', 'salsas.aji': 'aji', 'papas.medianas': 'papas', 'acompanamiento.papas': 'papas', 'extras.papas-compartir': 'papas' }
  const main: Record<string, string> = { Cheese: 'cheese', Royal: 'royal', 'Clásica': 'clasica', BBQ: 'bbq' }
  const photo = photos[`${groupId}.${option.id}`] ?? (groupId === 'principal' ? main[option.label] : undefined)
  if (groupId === 'ingredientes') return null
  const Icon = groupId === 'variant' ? Hamburger : groupId === 'bebida' ? CupSoda : groupId === 'salsas' ? Droplet : option.id === 'tocino' ? Beef : option.id === 'queso' ? Sandwich : Utensils
  return <span className={`option-visual option-visual--${option.id}`} aria-hidden="true">
    {photo && !failed ? <img src={`/images/official/${photo}.jpg`} width={56} height={56} alt="" onError={() => setFailed(true)} />
      : groupId === 'papas' ? <svg width="48" height="48" viewBox="0 0 48 48"><title>Representación ilustrativa</title>{option.id === 'grandes'
        ? <g fill="#e9b83b" stroke="#6b4a19" strokeWidth="2"><path d="M10 21V7h6v16m3 0V4h6v19m3 0V9h6v14m3 0V6h5v18" /><path d="M8 21h34l-5 23H13z" fill="#a22a24" /></g>
        : <g fill="#dca947" stroke="#6b4a19" strokeWidth="2"><path d="M5 34 21 9q7 7 3 12L12 41zM23 38 34 12q9 4 7 11L32 43z" /></g>}</svg>
      : <Icon size={option.id === 'grande' ? 38 : 28} />}
  </span>
}
