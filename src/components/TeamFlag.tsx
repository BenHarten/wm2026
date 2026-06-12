import { useState } from 'react'

export function TeamFlag({ src, alt, className = 'h-4 w-6' }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <span
        aria-hidden
        className={`${className} inline-block shrink-0 rounded-[2px] bg-pitch-700`}
      />
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} shrink-0 rounded-[2px] object-cover ring-1 ring-white/10`}
    />
  )
}
