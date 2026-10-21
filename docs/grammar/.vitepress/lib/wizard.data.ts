import { buildGameData } from '../../../../src/game/build.ts'
import type { EngineData } from '../../../../src/game/engine.ts'

/** The wizard sandbox's build-time data: gate positions from the docs, the Fix it error table, and the fixed lines spelled. */
declare const data: EngineData
export { data }

export default {
  load(): EngineData {
    return buildGameData()
  },
}
