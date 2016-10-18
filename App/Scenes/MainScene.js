import React, { Component } from 'react'
import {
  Text,
  View,
  Dimensions,
  Image,
  StatusBar,
  ScrollView,
  TouchableHighlight
} from 'react-native'

import NavBar from '../Components/NavBar'
import Drawer from 'react-native-drawer'
import Config from '../Config'
import DrawerMenuItem from '../Components/DrawerMenuItem'
import MainDrawer from '../Components/MainDrawer'
import Routes from '../Routes'

export default class MainScene extends Component {

  constructor(props) {
      super(props)
  }

  render() {
    return (
        <View>
          <NavBar
            title="My Centre"
            navigator={ this.props.navigator }
            route={ this.props.route }
            leftButtonText="|||"
            leftButtonAction={ this.props.leftButtonAction }
          />

          <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 20}}>
            <Text style={{fontSize: 26}}>Happy Valley Preschool</Text>
          </View>

          <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 20}}>
            <Text style={{fontSize: 20}}>Whiteriver, Mpumulanga</Text>
          </View>

          <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 20}}>
          <Image source={require('../Images/preschool.jpg')}
            style={{width: 380, height: 380}} />
          </View>

          <TouchableHighlight onPress={ () => this.props.navigator.push(Routes.attendance) }>
            <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 20}}>
              <Text style={{fontSize: 26}}>Take Attendance</Text>
            </View>
          </TouchableHighlight>
        </View>
    )
  }
}

const styles = {


}