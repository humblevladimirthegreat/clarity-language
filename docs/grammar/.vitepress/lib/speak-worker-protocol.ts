export type SpeakWorkerInit = {
  type: 'init'
  wasmPaths: string
  onnxUrl: string
  voicesUrl: string
}

export type SpeakWorkerRun = {
  type: 'run'
  id: number
  chunks: number[][]
}

export type SpeakWorkerCancel = {
  type: 'cancel'
}

export type SpeakWorkerRequest = SpeakWorkerInit | SpeakWorkerRun | SpeakWorkerCancel

export type SpeakWorkerReady = {
  type: 'ready'
}

export type SpeakWorkerAudio = {
  type: 'audio'
  id: number
  samples: Float32Array
}

export type SpeakWorkerError = {
  type: 'error'
  id?: number
  message: string
}

export type SpeakWorkerResponse = SpeakWorkerReady | SpeakWorkerAudio | SpeakWorkerError
