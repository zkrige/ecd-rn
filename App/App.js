import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  View
} from 'react-native'
import WaitModal from './Components/WaitModal'
import * as appActions from './Actions/App'

class App extends Component {

  constructor(props) {
    super(props)
  }

  render() {

    const {
      modalVisible,
      modalMode,
      modalText,
      modalOnPositive,
      modalOnNegative,
      modalPositiveText,
      modalNegativeText
    } = this.props.state.App

    return (
      <View style={{flex: 1}}>

       <WaitModal
          dispatch={this.props.dispatch}
          mode={ modalMode }
          visible={ modalVisible }
          onPositive={ modalOnPositive }
          onNegative={ modalOnNegative }
          positiveText={ modalPositiveText }
          negativeText= { modalNegativeText }
          text={ modalText }
          ref="waitmodal"
        />

        <View style={{flex: 1}}>
          {this.props.children}
        </View>

      </View>
    )
  }
}

export default connect(
  (state) => ({
    state: state
  }),
  (dispatch) => ({
    actions: bindActionCreators(appActions, dispatch)
  })
)(App)