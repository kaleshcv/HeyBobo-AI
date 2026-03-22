import React, { useRef } from 'react'
import ReactPlayer from 'react-player'
import { Maximize2, Play } from 'lucide-react'

interface VideoPlayerProps {
  url: string
  thumbnail?: string
  onProgress?: (progress: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void
  onDuration?: (duration: number) => void
  onEnded?: () => void
  className?: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  thumbnail,
  onProgress,
  onDuration,
  onEnded,
  className = '',
}) => {
  const playerRef = useRef<ReactPlayer>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen()
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full bg-black rounded-lg overflow-hidden ${className}`}>
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        controls
        progressInterval={1000}
        onProgress={onProgress}
        onDuration={onDuration}
        onEnded={onEnded}
        playing={false}
        light={thumbnail}
        playIcon={<Play size={48} className="text-white" fill="white" />}
      />
      <button
        onClick={handleFullscreen}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        title="Fullscreen"
      >
        <Maximize2 size={24} />
      </button>
    </div>
  )
}
