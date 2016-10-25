import React, { Component } from 'react'
import {
    Text,
    View,
    Navigator,
    StyleSheet,
    BackAndroid
} from 'react-native'
import Routes from './App/Routes'

export default class Both extends Component {

  constructor(props) {
    super(props)
    this.state = { ...props }

  }

  createScene(route, navigator) {
    return React.createElement(
      route.component,
      {route, navigator}
    )
  }

  createDrawer(route, navigator) {
    return React.createElement(
      route.drawer,
      {route, navigator}
    )
  }

  componentWillUnmout() {
    BackAndroid.removeEventListener('hardwareBackPress', () => {
      if(this.refs.navigator.getCurrentRoutes() > 1) {
        this.navigator.pop()
        return true
      } else {
        return false
      }
    })
  }

  render() {

    return (
        <Navigator
          initialRoute={{...Routes.class, className: 'Smith', classId: 2}}
          // initialRoute={Routes.login}
          ref='navigator'
          renderScene={ (route, navigator) => {
          BackAndroid.addEventListener('hardwareBackPress', () => {
            // This is triggered, but not preventing default
            console.log("Back button pressed")
            if(navigator.getCurrentRoutes() > 1) {
              navigator.pop()
              return true
            } else {
              return false
            }
          })
            if(route.drawer !== null) {
              return React.createElement(
                route.drawer,
                {route, navigator}
              )
            } else {
              return React.createElement(
                route.scene,
                {route, navigator}
              )
            }
          }}
          configureScene={ (route, routeStack) =>
            Navigator.SceneConfigs.FadeAndroid
          }
          />
    );
  }

}
