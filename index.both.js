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

  // _navigate( navigator, route, params = []) {
  //   // We're going to pass through this method instead of navigator
  //   // So that we can also pass any variables into the Scene
  //   navigator.push({...route, param: 'val'})
  // }

  render() {
    return (

        <Navigator
          initialRoute={Routes.login}
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});