/**
 * Early Childhood Development App
 * @copyright 2016 Global Consent Ltd
 * Civvals, 50 Seymour Street, London, England, W1H 7JG
 * @author Werner Roets <werner@io.co.za>
 */

import ClassScene from './Scenes/ClassScene'
import AttendanceScene from './Scenes/AttendanceScene'
import LoginScene from './Scenes/LoginScene'
import MainScene from './Scenes/MainScene'
import HistoryScene from './Scenes/HistoryScene'
import AddChildScene from './Scenes/AddChildScene'
import AssignChildScene from './Scenes/AssignChildScene'
import UnassignChildScene from './Scenes/UnassignChildScene'

/**
 * A list of available scenes to navigate to
 */
export default {
  addChild: {
    title: 'ECD APP',
    scene: AddChildScene
  },
  assignChild: {
    title: 'ECD APP',
    scene: AssignChildScene,
  },
  unassignChild: {
    title: 'ECD APP',
    scene: UnassignChildScene,
  },
  history: {
    title: 'ECD APP',
    scene: HistoryScene
  },
  main: {
    title: 'ECD APP',
    scene: MainScene
  },

  login: {
    title: 'ECD APP',
    scene: LoginScene
  },

  class: {
    title: 'ECD APP',
    scene: ClassScene
  },

  attendance: {
    title: 'ECD APP',
    scene: AttendanceScene
  }

}


