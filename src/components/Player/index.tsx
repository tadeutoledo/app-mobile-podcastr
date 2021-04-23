import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Slider from 'rc-slider';

import { usePlayer } from "../../contexts/PlayerContext";
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

import 'rc-slider/assets/index.css';
import styles from "./styles.module.scss"

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!audioRef.current)
      return;

    if (isPlaying) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  });

  function setUpProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    console.log(hasNext);
    if (hasNext) {
      playNext();
    }
    else {
      clearPlayState();
    }
  }

  const {
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    isLooping,
    isShuffling,
    hasNext,
    hasPrevious,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    playNext,
    playPrevious,
    clearPlayState
  } = usePlayer();
  const episode = episodeList[currentEpisodeIndex];

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora"></img>
        <strong>Tocando agora</strong>
      </header>

      { episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit="cover" />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Seleciona um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>

            {episode ? (
              <Slider
                max={episode?.duration ?? 0}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}

          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {episode && (
          <audio src={episode.url}
            ref={audioRef}
            autoPlay={true}
            onEnded={handleEpisodeEnded}
            loop={isLooping}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setUpProgressListener}
          />
        )}

        <div className={styles.buttons}>
          <button
            type="button"
            disabled={!episode || episodeList.length == 1}
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ''}
          >
            <img src="/shuffle.svg" alt="Embaralhar"></img>
          </button>
          <button type="button" disabled={!episode || !hasPrevious} onClick={playPrevious}>
            <img src="/play-previous.svg" alt="Anterior"></img>
          </button>
          <button type="button"
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {!isPlaying
              ? <img src="/play.svg" alt="Tocar" />
              : <img src="/pause.svg" alt="Pausar" />
            }
          </button>
          <button
            type="button"
            disabled={!episode || !hasNext}
            onClick={playNext}>
            <img src="/play-next.svg" alt="Próxima"></img>
          </button>
          <button
            type="button"
            disabled={!episode}
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ''}
          >
            <img src="/repeat.svg" alt="Repetir"></img>
          </button>
        </div>

      </footer>
    </div >
  )
}