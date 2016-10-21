import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableHighlight
} from 'react-native'

import { Colours, FontSizes } from '../GlobalStyles'
export default class Link extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
        <TouchableHighlight style={{padding: 5, margin: 2}} onPress={ this.props.onPress }>
          <Text style={{
            color: Colours.secondary,
            fontSize: FontSizes.p
          }}
        >
          {this.props.text}</Text>
        </TouchableHighlight>
    )
  }
}