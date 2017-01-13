/**
 * Early Childhood Development App
 * @copyright 2016 Global Consent Ltd
 * Civvals, 50 Seymour Street, London, England, W1H 7JG
 * @author Werner Roets <werner@io.co.za>
 */

import React, { Component } from 'react'
import Config from './App/Config'
import {
  AppRegistry,
  Navigator,
  View,
  Platform
} from 'react-native'

import Routes from './App/Routes'
import EventEmitter from 'EventEmitter'
import {
  GoogleAnalyticsTracker,
  GoogleAnalyticsSettings
} from 'react-native-google-analytics-bridge'
import { Colours } from './App/GlobalStyles'
import IMPLog from './App/Impulse/IMPLog'
import * as Lifecycle from './App/Impulse/lib/Lifecycle'
import LoadingModal from './App/Components/LoadingModal'
console.log('Platform',Platform)
/**
 * The root component of Ecdrn
 * @extends React.Component
 */
export default class Ecdrn extends Component {

  /** The route navigator will be instantiated with */
  _initialRoute = null

  /** Navigation event emitter */
  _navigationEventEmitter = null

  /** Modal event emitter */
  _modalEventEmitter = null

  /** The name of the file of the current Scene */
  _fileName = null

  /** The name of the class of the current Scene*/
  _className = null

  /** An object to hold google analytics tracks */
  _gaTrackers = {}

  constructor(props) {
    super(props)
    this.state = {
      modal: {
        visible: false
      }
    }
    // Initialise values
    this._fileName = 'index.android.js'
    this._className = this.constructor.name
    this._navigationEventEmitter = new EventEmitter()
    this._modalEventEmitter = new EventEmitter()
    this._initAnalytics()
    this._initialRoute = Config.initialRoute

    this._modalEventEmitter.addListener('modal', this._setModal, this)

    if(Config.debug && Config.debugReact) {
      IMPLog.react(this._fileName, Lifecycle.CONSTRUCTOR)
    }
  }

  componentWillUnmount() {
    if(Config.debug && Config.debugReact) {
      IMPLog.react(this._fileName, Lifecycle.COMPONENT_WILL_MOUNT)
    }
  }

  componentDidMount() {
    if(Config.debug && Config.debugReact) {
      IMPLog.react(this._fileName, Lifecycle.COMPONENT_DID_MOUNT)
    }
  }

  componentWillReceiveProps(nextProps) {
    if(Config.debug && Config.debugReact) {
      IMPLog.react(this._fileName, Lifecycle.COMPONENT_WILL_RECEIEVE_PROPS)
    }
  }

  componentWillUpdate(nextProps, nextState) {
      if(Config.debug && Config.debugReact) {
        IMPLog.react(this._fileName, Lifecycle.COMPONENT_WILL_UPDATE)
      }
  }

  componentDidUpdate(nextProps, nextState) {
      if(Config.debug && Config.debugReact) {
        IMPLog.react(this._fileName, Lifecycle.COMPONENT_DID_UPDATE)
      }
  }

  componentWillUnmount() {
    if(Config.debug && Config.debugReact) {
        IMPLog.react(this._fileName, Lifecycle.COMPONENT_WILL_UNMOUNT)
    }
  }

  /**
   * Initialise google analytics
   * @returns {undefined}
   */
  _initAnalytics = () => {
    this._gaTrackers = {
      tracker1: new GoogleAnalyticsTracker(Config.googleAnalytics.trackers.tracker1)
    }
    this._gaTrackers.tracker1.setAppName(Config.appName + ' v' + Config.version)
    this._gaTrackers.tracker1.setAnonymizeIp(Config.googleAnalytics.anonymizeIp)
    this._gaTrackers.tracker1.setSamplingRate(Config.googleAnalytics.samplingRate)

    GoogleAnalyticsSettings.setDispatchInterval(Config.googleAnalytics.dispatchInterval)
    GoogleAnalyticsSettings.setDryRun(Config.debug)
    GoogleAnalyticsSettings.setOptOut(Config.googleAnalytics.optOut)

  }

  /** Relay the event on to the scene */
  _onWillFocus = route => {
    this._navigationEventEmitter.emit('onWillFocus'+route.scene.name)
  }

  /** Relay the event to the scene */
  _onDidFocus = route => {
    this._navigationEventEmitter.emit('onDidFocus'+route.scene.name)
  }

  /** Set the modal's state */
  _setModal = options => {
    this.setState({modal: options})
  }

  render() {
    if(Config.debug && Config.debugReact) {
      IMPLog.react(this._fileName, Lifecycle.RENDER)
    }
    return (
        <Navigator
          initialRoute={this._initialRoute}
          onWillFocus={this._onWillFocus}
          onDidFocus={this._onDidFocus}
          renderScene={ (route, navigator) => {
            if(Config.debug && Config.debugNavigator) {
              console.log("--- ROUTES STACK ---")
              console.log(navigator.getCurrentRoutes())
              console.log("--- END ROUTES STACK ---")
            }
            return (
              <View style={{flex: 1, backgroundColor: Colours.sceneBackgroundColour}}>
              <LoadingModal
                visible={this.state.modal.visible}
              />
                <View style={{flex: 1, backgroundColor: Colours.sceneBackgroundColour}}>
                  {React.createElement(
                    route.scene,
                    {
                      route,
                      navigator,
                      _gaTrackers: this._gaTrackers,  // Google Analytics
                      _navigationEventEmitter: this._navigationEventEmitter, // Navigator events
                      _modalEventEmitter: this._modalEventEmitter // LoadingModal events
                    }
                  )}
                </View>
              </View>
            )
          }}
          configureScene={ (route, routeStack ) =>
            ({
              ...Config.sceneConfig,
              gestures: {}} // Prevents the user from being able to swipe to go back
            )}
        />
    )
  }
}

AppRegistry.registerComponent('Ecdrn', () => Ecdrn)
