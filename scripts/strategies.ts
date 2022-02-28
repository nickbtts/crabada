import { SETTINGS } from './constants'
import { attackMine } from './run'

//Test all mines for looting
//Returns true if looted, else false
export async function chooseStrat(result): Promise<Boolean> {
  if (SETTINGS.STRATEGY_WAIT_LOTS_OF_MINES) {
    if (await waitForLotsMinesStrat(result)) return true
  } else if (SETTINGS.STRATEGY_YOLO) {
    if (await yoloStrat(result)) return true
  }
  return false
}

//Counts all mines, if it finds more than `LOTS_OF_MINES`, it will try to attack the middle ones
export async function waitForLotsMinesStrat(result): Promise<Boolean> {
  const mine_count: number = result.data.length - 1
  const half_mine_count: number = Math.floor(mine_count / 2)
  console.log('-----\nMines found:', mine_count + 1)
  if (mine_count >= SETTINGS.LOTS_OF_MINES) {
    console.log('Checking mine:', half_mine_count)
    if (SETTINGS.FACTION_ADVANTAGES.includes(result.data[half_mine_count].faction)) {
      console.log('Launching attack on mine', half_mine_count, '...')
      if (await attackMine(result.data[half_mine_count].game_id)) return true
      else return false
    }
    let i = 1
    while (i <= mine_count / 8)
    {
      console.log('Checking mine:', half_mine_count + i)
      if (SETTINGS.FACTION_ADVANTAGES.includes(result.data[half_mine_count + i].faction)) {
        console.log('Launching attack on mine', result.data[half_mine_count + i].game_id, '...')
        if (await attackMine(result.data[half_mine_count + i].game_id)) return true
      }
      console.log('Checking mine:', half_mine_count - i)
      if (SETTINGS.FACTION_ADVANTAGES.includes(result.data[half_mine_count - i].faction)) {
        console.log('Launching attack on mine', result.data[half_mine_count - i].game_id, '...')
        if (await attackMine(result.data[half_mine_count - i].game_id)) return true
      }
      ++i
    }
  }
  return false
}

//Loop all mines starting from the last one. If it finds
export async function yoloStrat(result): Promise<Boolean> {
  let mine_count: number = result.data.length - 1
  if (mine_count >= 0) console.log('-----\nChecking', mine_count + 1, 'mines...')
  while (mine_count >= 0) {
    if (SETTINGS.FACTION_ADVANTAGES.includes(result.data[mine_count].faction)) {
      console.log('Launching attack on mine', result.data[mine_count].game_id, '...')
      if (await attackMine(result.data[mine_count].game_id)) return true
      else return false
    }
    --mine_count
  }
  return false
}
