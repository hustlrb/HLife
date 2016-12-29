/**
 * Created by yangyang on 2016/12/27.
 */
import React, {Component} from 'react'
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  InteractionManager
} from 'react-native'
import {Actions} from 'react-native-router-flux'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {em, normalizeW, normalizeH, normalizeBorder} from '../../util/Responsive'
import Header from '../common/Header'
import {getDocterList} from '../../action/doctorAction'
import {activeUserId, isUserLogined} from '../../selector/authSelector'
import {getDoctorList} from '../../selector/doctorSelector'

const PAGE_WIDTH=Dimensions.get('window').width
const PAGE_HEIGHT=Dimensions.get('window').height

class DocterFinder extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.props.getDocterList({})
    })
  }

  consult(doctor) {
    if (!this.props.isLogin) {
      Actions.LOGIN()
    } else {
      let payload = {
        name: doctor.phone,
        members: [this.props.currentUser, doctor.id]
      }
      Actions.CHATROOM(payload)
    }
  }

  renderDocs() {
    return (
      this.props.doctors.map((value, key) => {
        return (
          <View key={key} style={{borderBottomWidth: 1, borderColor: '#F7F7F7'}}>
            <TouchableOpacity style={styles.selectItem} onPress={() => this.consult(value)}>
              <Image source={require('../../assets/images/mine_collection.png')}></Image>
              <Text style={[styles.textStyle, {marginLeft: normalizeW(20)}]}>{value.nickname ? value.nickname : value.phone}</Text>
            </TouchableOpacity>
          </View>
        )
      })
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          leftType="icon"
          leftIconName="ios-arrow-back"
          leftPress={() => Actions.pop()}
          title="找名医"
        />
        <View style={styles.itemContainer}>
          {this.renderDocs()}
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  let doctors = getDoctorList(state)
  return {
    doctors,
    currentUser: activeUserId(state),
    isLogin: isUserLogined(state)
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  getDocterList,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(DocterFinder)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF'
  },
  itemContainer: {
    width: PAGE_WIDTH,
    ...Platform.select({
      ios: {
        paddingTop: normalizeH(65),
      },
      android: {
        paddingTop: normalizeH(45)
      }
    }),
  },
  selectItem: {
    flexDirection: 'row',
    height: normalizeH(45),
    paddingLeft: normalizeW(25),
    alignItems: 'center',
    marginBottom: normalizeH(2),
    marginTop: normalizeH(5),
  },
  textStyle: {
    fontSize: 17,
    color: '#4A4A4A',
    letterSpacing: 0.43,
  }
})