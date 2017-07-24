/**
 * Early Childhood Development App
 * @copyright 2016 Global Consent Ltd
 * Civvals, 50 Seymour Street, London, England, W1H 7JG
 * @author Werner Roets <werner@io.co.za>
 */

import React from 'react'
import IMPComponent from '../Impulse/IMPComponent'
import IMPLog from '../Impulse/IMPLog'
import AndroidBackButton from 'react-native-android-back-button'
import {
  View,
  Alert,
  ToastAndroid,
  InteractionManager
} from 'react-native'
import buffer from 'buffer/'
const Buffer = buffer.Buffer

import Api from '../Api'
import Config from '../Config'
import Sentry from '../Sentry'
import Crypto from '../Crypto'
import Session from '../Session'
import { Colours } from '../GlobalStyles'

import {
  NavBar,
  Button,
  ScrollableWaitableView,
  FormHeading,
  SceneHeading,
  Checkbox
} from '../Components'

const createBulkAttendanceClaim = (samples, singleClaims, location, digitalIds) => {
  return new Promise((resolve, reject) => {
    const date = new Date().toISOString()
    // JSON.parse(JSON.stringify()) is a tmp workaround for a tedious object reference issue
    const attendeeSample = JSON.parse(JSON.stringify(samples.attendeeSample)),
          claimObjectSample = JSON.parse(JSON.stringify(samples.attendenceObject)),
          verifiableClaimSample = JSON.parse(JSON.stringify(samples.verifiableClaim))

    let claimObject = Object.assign({}, claimObjectSample)
    claimObject.id = digitalIds.practitioner
    claimObject.deliveredService.practitioner = digitalIds.practitioner
    claimObject.deliveredService.geo.latitude = location.coords.latitude
    claimObject.deliveredService.geo.longitude = location.coords.longitude
    claimObject.deliveredService.attendees = singleClaims

    Crypto.sign(new Buffer(JSON.stringify(claimObject))).then(signature => {
      let verifiableClaim = verifiableClaimSample
      verifiableClaim.issuer = digitalIds.centre
      verifiableClaim.issued = date
      verifiableClaim.claim = claimObject
      verifiableClaim.signature.created = date
      verifiableClaim.signature.signatureValue = signature

      resolve(verifiableClaim)
    }).catch(e => {
      reject(e)
    })
  })
}

/**
 * A scene allowing the user to submit attendance for the chosen class
 * @extends IMPComponent
 * */
export default class AttendanceScene extends IMPComponent {

  constructor(props) {
    super(props)

    this.state = {
      classData: [],
      attendanceData: [],
      initialised: false,
      loaded: false
    }
  }

  componentDidMount() {
    this._fetchData()
  }

  _goBack() {
    this.navigator.pop()
      this.setState({loaded: false})
  }

  _hardwareBackHandler () {
    this._goBack()
    return true
  }

  /**
   * Fetch data for this scene from the server
   * @memberof AttendanceScene
   * @returns {undefined}
   */
  _fetchData() {
    const sessionState = Session.getState()

    Api.fetchClass(
      this.props.route.classId,
      sessionState.userData._token
    )

    .then((data) => {

      // If server reports error
      if(data.error){
        if(Config.debug) {
          IMPLog.error(data.error,this._fileName)
        } else {
          alert(data.error)
        }
        this._goBack()
      }

      // Data fetched
      Session.update({classData: data})
      this.setState({
        loaded: true,
        attendanceData: this.initAttendance(data)
      })
    })

    .catch((error) => {
      if(Config.debug) {
        IMPLog.error(error.toString(), this._fileName)
      } else {
        Sentry.captureEvent(error.stack, this._fileName)
      }

      Alert.alert(
        Config.errorMessage.network.title,
        Config.errorMessage.network.message,
        [{text: "Okay"}]
      )
      this._goBack()
    })
  }

  /**
   * Initialise the attendanceData based on the classData
   * received from the server
   */
  initAttendance (classData) {
    return classData.map( x =>
      ({ id: x.id, givenName: x.given_name, familyName: x.family_name, checked: true })
    )
  }

  /**
   * Press a checkbox and change the checked value
   */
  pressCheckbox (id, attendanceData ) {
    return attendanceData.map( (x) =>
      x.id === id ?({ ...x, checked: !x.checked }) : x
    )
  }

  /**
   * Select all checkboxes
   */
  selectAll (attendanceData) {
    setState({
      attendanceData: attendanceData.map(x =>
        x.checked = true
    )})
  }

  /**
   * Count number of children not selected
   */
  countAbsent = attendanceData =>
    attendanceData.reduce( (a, x) =>
      x.checked ? a : a + 1 ,0)

  /**
   * Generate a summary for comfirmation
   */
  summary = attendanceData =>
    "Are you sure you want to submit attendance with " +
    ( attendanceData.length - this.countAbsent(attendanceData) ) +
    " of " +
    attendanceData.length +
    " children present?"


  /**
   * Make the checkboxes based on attendanceData
   */
  makeCheckboxes = attendanceData =>
    attendanceData.map((x, i) =>
      (<Checkbox
        style={'switch'}
        key={i}
        width={300}
        text={x.givenName + ' ' + x.familyName}
        onPress={ () => this.setState({ attendanceData: this.pressCheckbox(x.id, attendanceData)}) }
        checked={x.checked}
      />)
    )

  /**
   * Get the GPS location from android and run
   * a function if successful
   */
  getLocation = onSuccess =>
    navigator.geolocation.getCurrentPosition(
      location =>
        onSuccess(location)
      ,
      error => {
        Alert.alert(
          'Location unavailable',
          'Your location could not be determined. Please ensure location is enabled.'
        )
        this.setModal({visible: false})
      }
    )

  /**
   * Upload the attendance data to the server
   */
  uploadData = (location, attendanceData) => {
    this.setModal({visible: true})
    const sessionState = Session.getState()

    Api.submitAttendance(
      location,
      this.props.route.centreId,
      this.props.route.classId,
      attendanceData,
      sessionState.userData._token
    ).then((json) => {
      // We're done, fill in and sign attendance claim
      try {
        if (json.success) {
          
          const samples = json.data,
                digitalIds = {
                  centre: Session.getState().userData.user.centre.did,
                  practitioner: Session.getState().userData.user.did
                }

          const promises = attendanceData.map(childData => {
            const date = new Date().toISOString()
            return new Promise((resolve, reject) => {
              // JSON.parse(JSON.stringify()) is a tmp workaround for a tedious object reference issue
              const attendeeSample = JSON.parse(JSON.stringify(samples.attendeeSample)),
                    claimObjectSample = JSON.parse(JSON.stringify(samples.attendenceObject)),
                    verifiableClaimSample = JSON.parse(JSON.stringify(samples.verifiableClaim))
              
              let claimObject = claimObjectSample
              claimObject.id = digitalIds.practitioner
              claimObject.deliveredService.practitioner = digitalIds.practitioner
              claimObject.deliveredService.geo.latitude = location.coords.latitude
              claimObject.deliveredService.geo.longitude = location.coords.longitude
              claimObject.deliveredService.attendees[0] = {
                id: childData.id,
                date,
                attended: childData.checked || false,
              }

              Crypto.sign(new Buffer(JSON.stringify(claimObject))).then(signature => {
                let verifiableClaim = verifiableClaimSample
                verifiableClaim.issuer = digitalIds.centre
                verifiableClaim.issued = date
                verifiableClaim.claim = JSON.parse(JSON.stringify(claimObject))
                verifiableClaim.signature.created = date
                verifiableClaim.signature.signatureValue = signature

                resolve(JSON.parse(JSON.stringify(verifiableClaim)))
              }).catch(e => {
                reject(e)
              })
            })
          })

          Promise.all(promises).then(singleClaims => {
            createBulkAttendanceClaim(samples, singleClaims, location, digitalIds).then((bulkAttendanceClaim) => {
              const centreId = sessionState.userData.user.centre_id,
                    token = sessionState.userData._token
              Api.submitAttendanceClaim(centreId, bulkAttendanceClaim, singleClaims, token).then((attendanceClaimResponse) => {
                if (attendanceClaimResponse.success)
                  this.clearAndGoBack()
                else
                  this.clearAndGoBack(attendanceClaimResponse.message)
              })
            })
          })
        } else {
          this.clearAndGoBack('Could not get Attendance schema, verifiable claim not created')
          console.log('[ALERT] Could not get Attendance schema from server: ' + response.message)
        }
      } catch (e) {
        this.clearAndGoBack('Could not get Attendance schema, verifiable claim not created')
        console.log(e)
      }
    })

    .catch((error) => {

      this.setModal({visible: false})

      if(Config.debug) {
        alert(this._fileName + " " + error.toString())
        console.log(this._fileName + " " + error.stack)
      } else {
        Sentry.captureEvent(error.stack,this._fileName)
        Alert.alert(
          'Unknown Error',
          'An unknown error has occured',
          [{text: 'Okay'}]
        )
      }
    })
  }

  /**
   * Submit the attendance.
   * Get the location and upload the data if successful
   */
  submit = attendanceData => {

    Alert.alert(
      'Submit attendance?',
      this.summary(attendanceData),
      [
        {
          text: 'Yes',
          onPress: () => {
            this.setModal({visible: true})
            this.getLocation((location) => this.uploadData(location, attendanceData) )
          }
        },
        {text: 'No'}
      ]
    )
  }

  clearAndGoBack = (error) => {
    this.setModal({visible: false})
    this._goBack()
    ToastAndroid.show(error ? error : 'Upload complete', ToastAndroid.SHORT)
  }

  render() {
    super.render()

    const CheckBoxes = this.makeCheckboxes(this.state.attendanceData) || null

    return (

      <View style={{flex: 1, backgroundColor: Colours.sceneBackgroundColour}}>
        <AndroidBackButton onPress={ () => this._hardwareBackHandler()}/>

        <NavBar
          navigator={ this.props.navigator }
          leftButtonAction={ () => this._goBack() }
        />

        <ScrollableWaitableView loaded={this.state.loaded}>

          <SceneHeading text="Attendance"/>

          <FormHeading text={this.props.route.className}/>

          <View style={{flex: 1, flexDirection: 'column'}}>

            {CheckBoxes}

            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 10 }}>
              <Button text="Submit" onPress={ () => this.submit(this.state.attendanceData) }/>
            </View>

          </View>

        </ScrollableWaitableView>

      </View>
    )
  }
}
