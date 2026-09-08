import { Participant } from '@/types'
import { getInitials } from '@/lib/utils'

interface ParticipantGridProps {
  participants: Participant[]
  hostId: string
}

const MIN_SLOTS = 10

export default function ParticipantGrid({ participants, hostId }: ParticipantGridProps) {
  const totalSlots = Math.max(MIN_SLOTS, Math.ceil(participants.length / 5) * 5)
  const placeholderCount = totalSlots - participants.length

  return (
    <div className="grid w-full grid-cols-3 gap-4 sm:grid-cols-5">
      {participants.map((p) => {
        const isHost = p.user_id === hostId
        return (
          <div key={p.id} className="flex animate-fade-in flex-col items-center gap-2">
            <div className="relative">
              <div
                className={
                  'flex h-16 w-16 items-center justify-center rounded-full border-2 bg-surface-1 type-mono text-sm font-semibold text-text-primary ' +
                  (isHost ? 'border-accent' : 'border-border-1')
                }
              >
                {getInitials(p.display_name)}
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-canvas bg-signal-green" />
            </div>
            <p className="max-w-[80px] truncate text-center text-sm font-medium text-text-primary">
              {p.display_name}
            </p>
            {isHost && <p className="type-label text-text-dim">Admin</p>}
          </div>
        )
      })}

      {Array.from({ length: placeholderCount }).map((_, i) => (
        <div key={`invite-${i}`} className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border-1 text-2xl text-text-dim">
            +
          </div>
          <p className="text-sm text-text-dim">Invite</p>
        </div>
      ))}
    </div>
  )
}
