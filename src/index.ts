import './style/index.scss'
import Player, { Timbre } from './core/Player'
import Track from './core/Track'

const player = new Player()

const playPauseButton = document.getElementById('play-pause')
const stopButton = document.getElementById('stop')
const addTrackButton = document.getElementById('add-track')
const tracksContainer = document.getElementById('tracks')
const adsrContainer = document.getElementById('adsr')
const bpmInput = document.getElementById('bpm') as HTMLInputElement
const timbreSelect = document.getElementById('timbre')
const timelineInput = document.getElementById('timeline') as HTMLInputElement

adjustControls()
adjustTracks()
adjustAdsr()
adjustBpm()
adjustTimbreSelect()

function adjustControls() {
  let timerId: any
  playPauseButton.addEventListener('click', () => {
    clearInterval(timerId)
    const initialStatus = player.status

    if (initialStatus === 'playing') return player.pause()

    player.play()
    const maxLength = String(player.getLength())
    if (maxLength === '0') return tracksContainer.querySelector('input')?.focus()

    timelineInput.max = maxLength
    timelineInput.value = String(player.currentTime)

    timerId = setInterval(() => {
      if (player.currentTime) {
        timelineInput.value = String(player.currentTime)
      } else {
        timelineInput.value = maxLength
        clearInterval(timerId)
        timerId = setTimeout(() => (timelineInput.value = '0'), 500)
      }
    }, 500)
  })
  stopButton.addEventListener('click', () => {
    clearInterval(timerId)
    timelineInput.value = '0'
    player.stop()
  })
  player
    .on('play', () => (playPauseButton.innerText = 'Pause'))
    .on('pause', () => (playPauseButton.innerText = 'Play'))
    .on('stop', () => (playPauseButton.innerText = 'Play'))
}

function adjustTracks() {
  tracksContainer.querySelectorAll('input').forEach(bindTrack)
  addTrackButton.addEventListener('click', addTack)

  function addTack() {
    const index = tracksContainer.children.length + 1
    const template = `
    <div class="flex align-center track m-b-1">
      <label for="track${index}" class="m-r-1">#${index}</label>
      <input id="track${index}" class="grow-1" type="text" placeholder='E4/4 E4/4 E4/4' />
    </div>
`
    tracksContainer.insertAdjacentHTML('beforeend', template)
    bindTrack(document.getElementById(`track${index}`) as HTMLInputElement)
    document.getElementById(`track${index}`)?.focus()
  }

  function bindTrack(input: HTMLInputElement) {
    const track = Track.create()
    if (input.value) {
      try {
        track.addSequence(input.value)
      } catch (e) {
        alert(e.message)
      }
    }
    player.addTrack(input.id, track)
    input.addEventListener('blur', (e) => {
      let value = (<HTMLInputElement>e.currentTarget).value
      if (!value) return
      ;(<HTMLInputElement>e.currentTarget).value = value = value.toUpperCase()
      try {
        track.replaceSequences(value)
      } catch (e) {
        alert(e.message)
      }
    })
  }
}

function adjustAdsr() {
  adsrContainer.querySelectorAll('input').forEach((input) => {
    const param = input.id as keyof typeof player.adsr
    input.value = String(player.adsr[param])
    input.addEventListener('change', (e) => {
      player.setAdsr({
        [param]: Number((<HTMLInputElement>e.currentTarget).value),
      })
    })
  })
}

function adjustBpm() {
  bpmInput.value = String(Track.defaultBpm)
  bpmInput.addEventListener('blur', (e) => player.setBpm(Number((<HTMLInputElement>e.currentTarget).value)))
}

function adjustTimbreSelect() {
  Object.keys(player.getSupportedTimbres()).forEach((key) => {
    const option = document.createElement('option')
    option.innerText = key.slice(0, 1).toUpperCase().concat(key.slice(1))
    option.value = key
    if (key === player.timbreName) option.selected = true
    timbreSelect.appendChild(option)
  })

  timbreSelect.addEventListener('change', function (this: HTMLSelectElement) {
    player.setTimbre(this.value as Timbre)
  })
}
