/**
 * Created by yangyang on 2017/1/18.
 */
import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  Platform,
  TouchableOpacity,
  ScrollView,
  ListView,
} from 'react-native'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {Actions} from 'react-native-router-flux'
import Header from '../common/Header'
import {em, normalizeW, normalizeH, normalizeBorder} from '../../util/Responsive'
import Expander from '../common/Expander'
import ShopInfoCell from './ShopInfoCell'
import * as msgActionTypes from '../../constants/messageActionTypes'
import {getNoticeListByType} from '../../selector/notifySelector'
import * as authSelector from '../../selector/authSelector'
import KeyboardAwareToolBar from '../common/KeyboardAwareToolBar'
import ToolBarContent from '../shop/ShopCommentReply/ToolBarContent'
import dismissKeyboard from 'react-native-dismiss-keyboard'
import * as Toast from '../common/Toast'
import {reply} from '../../action/shopAction'
import {enterTypedNotify} from '../../action/messageAction'

const PAGE_WIDTH=Dimensions.get('window').width
const PAGE_HEIGHT=Dimensions.get('window').height

class ShopNotifyView extends Component {
  constructor(props) {
    super(props)

    this.state = {
      shopId: '',
      replyId : '',
      replyUserId: '',
      replyUserNickName : '',
      replyShopCommentId: '',
      replyShopCommentUserId: '',
    }
  }

  componentDidMount() {
    this.props.enterTypedNotify({type: msgActionTypes.SHOP_TYPE})
  }

  sendReply(content) {
    if(!this.props.isUserLogined) {
      Actions.LOGIN()
      return
    }
    this.props.reply({
      shopId: this.state.shopId,
      replyShopCommentId : this.state.replyShopCommentId,
      replyId : this.state.replyId,
      replyUserId : this.state.replyUserId,
      replyShopCommentUserId : this.state.replyShopCommentUserId,
      replyContent : content,
      from: 'SHOP_NOTIFY',
      success: (result) => {
        dismissKeyboard()
        Toast.show('回复成功', {duration: 1500})
      },
      error: (err) => {
        Toast.show(err.message, {duration: 1500})
      }
    })
  }

  openReplyBox(notice) {
    if(this.replyInput) {
      this.replyInput.focus()
    }
    // console.log('openReplyBox.notice===', notice)
    this.setState({
      shopId: notice.shopId,
      replyShopCommentId: notice.commentId,
      replyId: notice.replyId,
      replyUserId: notice.userId,
      replyUserNickName: notice.nickname,
      replyShopCommentUserId: notice.userId
    })
  }

  renderReplyBtn(notice) {
    if (notice.msgType === msgActionTypes.MSG_SHOP_COMMENT) {
      return (
        <View style={{paddingRight: 15}}>
          <TouchableOpacity onPress={()=>{this.openReplyBox(notice)}}>
            <View style={{borderWidth: 1, width: 54, height: 25, borderColor: '#E9E9E9', borderRadius: 3, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{fontSize: em(14), color: '#50E3C2'}}>回 复</Text>
            </View>
          </TouchableOpacity>
        </View>
      )
    }
    return <View/>
  }

  renderMsgContent(notice) {
    if (notice.msgType === msgActionTypes.MSG_SHOP_COMMENT) {
      return (
        <View style={styles.msgViewStyle}>
          <Expander
            showLines={3}
            textStyle={{fontSize: em(17), color: '#4a4a4a', lineHeight: em(24),}}
            content={notice.commentContent}
          />
        </View>
      )
    } else {
      return (
        <View style={styles.msgViewStyle}>
          <Expander showLines={3} textStyle={{fontSize: em(17), color: '#4a4a4a', lineHeight: em(24),}} content={notice.text}/>
        </View>
      )
    }
  }

  renderNoticeItem(notice) {
    return (
      <View style={styles.itemView}>
        <View style={styles.personView}>
          <TouchableOpacity onPress={() => Actions.PERSONAL_HOMEPAGE({userId: notice.userId})}>
            <View style={styles.avtarView}>
              <Image style={styles.avtarStyle}
                     source={notice.avatar ? {uri: notice.avatar} : require("../../assets/images/default_portrait.png")}>
              </Image>
            </View>
          </TouchableOpacity>
          <View style={{marginLeft: 10, justifyContent: 'center'}}>
            <View>
              <Text style={styles.userNameStyle}>{notice.nickname ? notice.nickname : '未命名'}</Text>
            </View>
            <View style={{flexDirection: 'row', paddingTop: 2}}>
              <Text style={{fontSize: em(12), color: '#B6B6B6', width: 76}}>{notice.timestamp}</Text>
              <Image style={{width: 10, height: 13, marginLeft: 18}} source={require("../../assets/images/writer_loaction.png")}/>
              <Text style={{fontSize: em(12), color: '#B6B6B6', paddingLeft: 2}}>长沙</Text>
            </View>
          </View>
          <View style={{flex: 1}}/>
          {this.renderReplyBtn(notice)}
        </View>
        {this.renderMsgContent(notice)}
        <ShopInfoCell shopId={notice.shopId}/>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          leftType="icon"
          leftIconName="ios-arrow-back"
          leftPress={() => Actions.pop()}
          title="店铺消息"
        />
        <View style={styles.itemContainer}>
          <ScrollView style={{height: PAGE_HEIGHT}}>
            <ListView
              dataSource={this.props.dataSource}
              renderRow={(notice) => this.renderNoticeItem(notice)}
            />
          </ScrollView>
        </View>

        <KeyboardAwareToolBar
            initKeyboardHeight={-50}
          >
            <ToolBarContent
              replyInputRefCallBack={(input)=>{this.replyInput = input}}
              onSend={(content) => {this.sendReply(content)}}
              placeholder={this.state.replyUserNickName ? '回复' + this.state.replyUserNickName + ':' : '回复:'}
            />
          </KeyboardAwareToolBar>
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  let newProps = {}
  let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
  let noticeList = getNoticeListByType(state, msgActionTypes.SHOP_TYPE)
  newProps.dataSource = ds.cloneWithRows(noticeList)
  const isUserLogined = authSelector.isUserLogined(state)
  newProps.isUserLogined = isUserLogined
  return newProps
}
const mapDispatchToProps = (dispatch) => bindActionCreators({
  reply,
  enterTypedNotify,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(ShopNotifyView)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  itemContainer: {
    width: PAGE_WIDTH,
    ...Platform.select({
      ios: {
        marginTop: normalizeH(65),
      },
      android: {
        marginTop: normalizeH(45)
      }
    }),
  },
  itemView: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF'
  },
  personView: {
    flexDirection: 'row',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 12,
  },
  avtarView: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden'
  },
  avtarStyle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden'
  },
  userNameStyle: {
    fontSize: em(15),
    color: '#50E3C2'
  },
  msgViewStyle: {
    marginTop: 21,
    marginBottom: 15,
    justifyContent: 'center',
    paddingLeft: 18,
    paddingRight: 18,
  },
})