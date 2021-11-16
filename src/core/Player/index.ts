import Track from '../Track'
import { assert } from '../../helpers/error'
import guitar from '../waves/guitar'
import piano from '../waves/piano'
import EventEmitter from '../EventEmitter'

const supportedTimbres = {
  sawtooth: {
    type: 'sawtooth',
  },
  sine: {
    type: 'sine',
  },
  square: {
    type: 'square',
  },
  triangle: {
    type: 'triangle',
  },
  piano: {
    type: 'custom',
    wave: piano,
  },
  guitar: {
    type: 'custom',
    wave: guitar,
  },
}

export type Timbre = keyof typeof supportedTimbres

export default class Player extends EventEmitter<{
  play: Player
  pause: Player
  stop: Player
}> {
  private _status: 'stopped' | 'paused' | 'playing' = 'stopped'
  private _adsr = {
    attack: 0.01,
    decay: 0.5,
    sustain: 0.15,
    release: 0.1,
  }

  private _timbre: Timbre = 'guitar'
  private _bpm = Track.defaultBpm

  protected tracks = new Map<string, Track>()

  getSupportedTimbres() {
    return supportedTimbres
  }

  get timbre() {
    return supportedTimbres[this._timbre]
  }

  get timbreName() {
    return this._timbre
  }

  setTimbre(timbre: Timbre) {
    this._timbre = timbre
  }

  get status() {
    return this._status
  }

  private setStatus(status: 'stopped' | 'paused' | 'playing') {
    this._status = status
  }

  get adsr() {
    return this._adsr
  }

  setAdsr(adsr: { attack?: number; decay?: number; sustain?: number; release?: number }) {
    this._adsr = {
      ...this._adsr,
      ...adsr,
    }
  }

  addTrack(name: string, track: Track) {
    assert(!this.tracks.has(name), `Track "${name}" already exists`)
    track.setBpm(this._bpm)
    this.tracks.set(name, track)
  }

  getTrack(name: string) {
    return this.tracks.get(name)
  }

  removeTrack(name: string) {
    return this.tracks.delete(name)
  }

  setBpm(value: number) {
    this._bpm = value
    for (const [, track] of this.tracks) {
      track.setBpm(this._bpm)
    }
  }

  getLength() {
    let maxLength = 0
    for (const [, track] of this.tracks) {
      maxLength = Math.max(maxLength, track.getLength())
    }

    return maxLength
  }

  get currentTime() {
    return this.ctx?.currentTime ?? 0
  }

  private ctx: AudioContext
  private volumes = new Map<Track, GainNode>()

  private updateContext() {
    this.ctx = new AudioContext()
    this.volumes = new Map<Track, GainNode>()
  }

  play() {
    if (!this.getLength()) return
    this.setStatus('playing')
    this.emit('play', this)

    if (this.ctx) {
      return this.turnVolumeOnAndResume(this.ctx)
    } else {
      return this.scheduleTracksNotes()
    }
  }

  pause() {
    this.setStatus('paused')
    this.emit('pause', this)
    if (this.ctx) this.turnVolumeOffAndSuspend(this.ctx)
  }

  stop() {
    this.setStatus('stopped')
    this.emit('stop', this)
    const ctx = this.ctx
    this.ctx = undefined
    if (ctx) this.turnVolumeOffAndSuspend(ctx)
  }

  private _volumeTimerId: any
  private turnVolumeOffAndSuspend(ctx: AudioContext) {
    for (const [, trackVolume] of this.volumes) {
      trackVolume.gain.cancelScheduledValues(ctx.currentTime)
      trackVolume.gain.setTargetAtTime(0, ctx.currentTime, 0.1)
    }
    this._volumeTimerId = setTimeout(() => ctx.suspend(), 200)
  }

  private turnVolumeOnAndResume(ctx: AudioContext) {
    clearTimeout(this._volumeTimerId)
    for (const [track, trackVolume] of this.volumes) {
      trackVolume.gain.cancelScheduledValues(ctx.currentTime)
      trackVolume.gain.setTargetAtTime(track.getVolume(), ctx.currentTime, 0.1)
    }
    return ctx.resume()
  }

  private scheduleTracksNotes() {
    this.updateContext()
    const now = this.ctx.currentTime
    let lastOscillator: OscillatorNode
    for (const [, track] of this.tracks) {
      const volumeGain = this.createVolumeGain(track)
      for (const { start, end, note } of track) {
        if (!note.getFrequency()) continue
        const startTime = now + start
        const releaseTime = now + end
        const stopTime = releaseTime + this.adsr.release

        const adsrGain = this.applyAdsr(startTime, end - start, releaseTime)

        const osc = this.ctx.createOscillator()
        this.applyTimbre(osc)
        osc.frequency.value = note.getFrequency()

        osc.start(startTime)
        osc.stop(stopTime)
        osc.connect(adsrGain).connect(volumeGain).connect(this.ctx.destination)
        lastOscillator = osc
      }
    }
    if (lastOscillator) lastOscillator.onended = () => this.stop()
  }

  private createVolumeGain(track: Track) {
    const volumeGain = this.ctx.createGain()
    this.volumes.set(track, volumeGain)
    volumeGain.gain.cancelScheduledValues(this.ctx.currentTime)
    volumeGain.gain.setValueAtTime(track.getVolume(), this.ctx.currentTime)
    return volumeGain
  }

  private applyAdsr(startTime: number, duration: number, releaseTime: number) {
    const { attack, decay, sustain, release } = this.adsr

    const adsrGain = this.ctx.createGain()
    adsrGain.gain.setValueAtTime(0, startTime)
    if (attack <= duration) {
      adsrGain.gain.linearRampToValueAtTime(1, startTime + attack)
    } else {
      adsrGain.gain.linearRampToValueAtTime(duration / attack, releaseTime)
    }
    if (attack < duration) {
      /** @see Choosing a good timeConstant https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime#choosing_a_good_timeconstant */
      adsrGain.gain.setTargetAtTime(sustain, startTime + attack, decay / 3)
    }
    adsrGain.gain.setTargetAtTime(0, releaseTime, release / 5)

    return adsrGain
  }

  private applyTimbre(osc: OscillatorNode) {
    const { type, wave } = this.timbre as { type: OscillatorType; wave?: typeof piano }
    if (wave) {
      osc.setPeriodicWave(this.ctx.createPeriodicWave(wave.real, wave.imag))
    } else {
      osc.type = type
    }
  }
}
