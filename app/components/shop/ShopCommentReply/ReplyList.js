/**
 * Created by zachary on 2017/1/3.
 */
import React, {Component} from 'react'
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ScrollView,
  ListView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Platform,
  InteractionManager
} from 'react-native'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {Actions} from 'react-native-router-flux'

import Triangle from '../../common/Triangle'
import {em, normalizeW, normalizeH, normalizeBorder} from '../../../util/Responsive'
import THEME from '../../../constants/themes/theme1'
const PAGE_WIDTH = Dimensions.get('window').width
const PAGE_HEIGHT = Dimensions.get('window').height

class ReplyList extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    InteractionManager.runAfterInteractions(()=>{

    })
  }

  componentWillReceiveProps(nextProps) {

  }
  
  reply(replyId, replyUserNickName, replyUserId) {
    if(this.props.onReplyClick) {
      this.props.onReplyClick(this.props.shopCommentId, this.props.shopCommentUserId, replyId, replyUserNickName, replyUserId)
    }
  }

  renderReplys() {
    if(this.props.replys && this.props.replys.length) {
      return this.props.replys.map((item, index)=> {
        return (
          <View key={"reply_" + item.id + "_" + index} style={styles.replyContainer}>
            <View style={styles.replyInnerContainer}>
              <View style={styles.replyTitleWrap}>
                <TouchableOpacity style={styles.replyUserBox} onPress={()=>{Actions.PERSONAL_HOMEPAGE({userId: item.user.id})}}>
                  <Text style={styles.replyUser}>{item.user.nickname}</Text>
                </TouchableOpacity>
                <Text style={styles.replyWord}>回复</Text>
                {item.parentReply && item.parentReply.user
                  ? <TouchableOpacity style={styles.replyUserBox} onPress={()=>{Actions.PERSONAL_HOMEPAGE({userId: item.parentReply.user.id})}}>
                      <Text style={styles.replyUser}>{item.parentReply.user.nickname}</Text>
                    </TouchableOpacity>
                  : null
                }
                <Text style={styles.replyWord}>:</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.replyContentWrap} onPress={()=>{this.reply(item.id, item.user.nickname, item.user.id)}}>
              <Text style={styles.replyContent}>{item.content}</Text>
            </TouchableOpacity>
          </View>
        )
      })
    }
  }

  renderUps() {
    if(this.props.ups && this.props.ups.length) {
      return this.props.ups.map((item, index)=> {
        if(item.status) {
          return (
            <TouchableOpacity key={"up_" + item.id + "_" + index} style={styles.upUserBox}>
              {this.props.ups.length-1 == index
                ? <Text style={styles.upUser}>{item.user.nickname}</Text>
                : <Text style={styles.upUser}>{item.user.nickname},</Text>
              }
            </TouchableOpacity>
          )
        }
      })
    }
  }

  render() {
    if( (this.props.replys && this.props.replys.length) ||
        (this.props.ups && this.props.ups.length)
      ) {
      return (
        <View style={styles.replyWrap}>
          <Triangle width={8} height={5} color="rgba(0,0,0,0.05)" style={[styles.triangle]} direction="up"/>
          <View style={styles.upReplyContainer}>
            <View style={styles.upUsersContainer}>
              <Image style={{width:15,height:12,marginRight:5,marginBottom:3}} source={require('../../../assets/images/artical_like_unselect.png')}/>
              {this.renderUps()}
            </View>
            {this.renderReplys()}
          </View>
        </View>
      )
    }
    return null
  }
}

const mapStateToProps = (state, ownProps) => {
  return {

  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({

}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(ReplyList)

const styles = StyleSheet.create({
  replyWrap: {
    backgroundColor: '#fff'
  },
  upReplyContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  triangle: {
    marginLeft:6
  },
  upUsersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding:5,
    borderBottomWidth: normalizeBorder(),
    borderBottomColor: THEME.colors.lighterA
  },
  upUserBox: {
    marginRight:3,
    marginBottom:3
  },
  upUser: {
    fontSize: em(12),
    color: THEME.colors.lessDark,
  },
  replyTitleWrap: {
    flex:1,
    flexDirection: 'row',
  },
  replyContainer: {
    padding:5,
    paddingBottom: 0,
  },
  replyInnerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  replyUserBox: {

  },
  replyUser: {
    fontSize: em(12),
    color: THEME.colors.green,
  },
  replyWord: {
    fontSize: em(12),
    color: '#8f8e94',
  },
  replyTime: {
    fontSize: em(12),
    color: '#8f8e94',
  },
  replyContentWrap: {
    flex: 1,
    marginTop: 5,
    marginBottom: 5,
  },
  replyContent: {
    fontSize: em(15),
    color: THEME.colors.lessDark,
  }

})