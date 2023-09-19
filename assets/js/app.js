import trackListData from '../data/data.js'

document.addEventListener('DOMContentLoaded', () => {
  const player = document.querySelector('.player'),
    cassetteCover = player.querySelector('.player__cassette-cover'),
    cassetteReels = player.querySelector('.player__cassette-reels'),
    controls = player.querySelector('.player__controls'),
    buttonPlay = player.querySelector('.player__controls-button--play'),
    trackName = player.querySelector('.player__title'),
    timeElapsed = player.querySelector('.player__time-elapsed'),
    timeTotal = player.querySelector('.player__time-total'),
    timeRange = player.querySelector('.player__time-range'),
    volumeMute = player.querySelector('.player__volume-mute'),
    volumeRange = player.querySelector('.player__volume-range'),
    volumeLevel = player.querySelector('.player__volume-level'),
    defaultLocationTracks = './assets/audio/',
    defaultLocationCovers = './assets/img/covers/',
    audio = new Audio(),
    { songs, covers } = trackListData

  const options = load() ?? {
    currentTrack: 0,
    currentCover: 0,
    isMute: false,
    volume: null,
    currentTime: null,
  }

  let isPlaying = false
  let isGrab = false

  function load() {
    return JSON.parse(localStorage.getItem('options'))
  }

  function save() {
    const getData = load()

    if (getData) {
      localStorage.setItem('options', JSON.stringify({ ...getData, ...options }))
    } else {
      localStorage.setItem('options', JSON.stringify({ ...options }))
    }
  }

  function updateTrackInfoHandler() {
    updateTrackHandler(options.currentTrack)
    updateCoverHandler(options.currentCover)
    audioPresenceHandler()
  }

  function updateTrackHandler(id) {
    audio.src = defaultLocationTracks + songs[id]
  }

  function updateCoverHandler(id) {
    cassetteCover.style.backgroundImage = `url(${defaultLocationCovers + covers[id]})`
  }

  function backButtonHandler() {
    options.currentTrack--
    options.currentCover--

    if (options.currentTrack < 0 || options.currentCover < 0) {
      options.currentTrack = songs.length - 1
      options.currentCover = covers.length - 1
    }
  }

  function playButtonHandler() {
    if (isPlaying) {
      audio.pause()
      cassetteReels.classList.add('player__cassette-reels--paused')
      buttonPlay.classList.remove('player__controls-button--pause')
    } else {
      audio.play()
      cassetteReels.classList.remove('player__cassette-reels--paused')
      buttonPlay.classList.add('player__controls-button--pause')
    }

    isPlaying = !isPlaying
  }

  function nextButtonHandler() {
    options.currentTrack++
    options.currentCover++

    if (options.currentTrack > songs.length - 1 || options.currentCover > covers.length - 1) {
      options.currentTrack = 0
      options.currentCover = 0
    }
  }

  function audioPresenceHandler() {
    if (isPlaying) {
      audio.play()
    }
  }

  function soundMuteHandler() {
    if (options.isMute) {
      volumeLevel.classList.add('player__volume-level--mute')
    } else {
      volumeLevel.classList.remove('player__volume-level--mute')
    }
  }

  function convertTime(time) {
    const sec = String(parseInt(`${time % 60}`, 10)).padStart(2, '0')
    const min = parseInt(`${(time / 60) % 60}`, 10)

    return `${min}:${sec}`
  }

  controls.addEventListener('click', (evt) => {
    const target = evt.target.dataset.text

    if (target === 'prev') {
      backButtonHandler()
      updateTrackInfoHandler()
    }

    if (target === 'play') {
      playButtonHandler()
    }

    if (target === 'next') {
      nextButtonHandler()
      updateTrackInfoHandler()
    }

    save()
  })

  audio.addEventListener('loadedmetadata', () => {
    trackName.textContent = songs[options.currentTrack].slice(0, -4)
    trackName.title = songs[options.currentTrack].slice(0, -4)

    if (options.currentTime && !isGrab) {
      audio.currentTime = options.currentTime
    }

    if (options.volume) {
      audio.volume = volumeRange.value = options.volume
    }

    timeElapsed.textContent = convertTime(audio.currentTime)
    timeTotal.textContent = convertTime(audio.duration)
    timeRange.max = audio.duration

    if (!options.isMute) {
      audio.volume = volumeRange.value
    } else {
      audio.volume = 0
    }

    save()
  })

  audio.addEventListener('timeupdate', () => {
    timeElapsed.textContent = convertTime(audio.currentTime)

    timeRange.addEventListener('mouseup', () => {
      isGrab = false
      timeRange.value = audio.currentTime = options.currentTime
    })

    if (!isGrab) {
      timeRange.value = options.currentTime = audio.currentTime

      save()
    }
  })

  audio.addEventListener('ended', () => {
    nextButtonHandler()
    updateTrackInfoHandler()
  })

  timeRange.addEventListener('input', () => {
    isGrab = true
    options.currentTime = +timeRange.value
  })

  volumeRange.addEventListener('input', () => {
    audio.volume = options.volume = volumeRange.value

    if (Number(volumeRange.value) === 0) {
      volumeLevel.classList.add('player__volume-level--mute')
      options.isMute = true
    } else {
      options.isMute = false
      volumeLevel.classList.remove('player__volume-level--mute')
    }

    if (Number(volumeRange.value) > 0.5) {
      volumeLevel.classList.add('player__volume-level--max')
    } else {
      volumeLevel.classList.remove('player__volume-level--max')
    }

    save()
  })

  volumeMute.addEventListener('click', () => {
    if (options.isMute) {
      audio.volume = volumeRange.value
      volumeLevel.classList.remove('player__volume-level--mute')
    } else {
      audio.volume = 0
      volumeLevel.classList.add('player__volume-level--mute')
    }

    options.isMute = !options.isMute

    save()
  })

  soundMuteHandler()
  updateTrackInfoHandler()
})