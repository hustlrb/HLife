/**
 * Created by yangyang on 2017/3/8.
 */
import React, {Component} from 'react'
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
  InteractionManager,
  StatusBar,
} from 'react-native'
import {Actions} from 'react-native-router-flux'
import {em, normalizeW, normalizeH, normalizeBorder} from '../../util/Responsive'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import THEME from '../../constants/themes/theme1'
import * as Toast from '../common/Toast'
import LinearGradient from 'react-native-linear-gradient'
import {fetchUserFollowees} from '../../action/authActions'
import {selectUserOwnedShopInfo} from '../../selector/shopSelector'
import {fetchUserOwnedShopInfo} from '../../action/shopAction'
import {fetchUserPoint} from '../../action/pointActions'
import * as authSelector from '../../selector/authSelector'
import {IDENTITY_SHOPKEEPER, IDENTITY_PROMOTER} from '../../constants/appConfig'
import {getCurrentPromoter, getPromoterTenant, getShopTenant} from '../../action/promoterAction'
import {
  isPromoterPaid,
  activePromoter,
  getTenantFee,
  selectPromoterIdentity,
  getPromoterById
} from '../../selector/promoterSelector'
import {DEFAULT_SHARE_DOMAIN} from '../../util/global'
import {fetchShareDomain} from '../../action/configAction'
import {getShareDomain} from '../../selector/configSelector'

import TimerMixin from 'react-timer-mixin'


const PAGE_WIDTH=Dimensions.get('window').width
const PAGE_HEIGHT=Dimensions.get('window').height

class Mine extends Component {
  constructor(props) {
    super(props)
  }

  componentWillReceiveProps(nextProps) {
    // console.log('componentWillReceiveProps.this.props===', this.props)
    // console.log('componentWillReceiveProps.nextProps===', nextProps)
    // StatusBar.setBarStyle('light-content', true)
  }

  componentWillMount() {
    // console.log('componentWillMount=this.props====', this.props)
    InteractionManager.runAfterInteractions(()=>{
      if(this.props.isUserLogined) {
        // this.props.fetchUserPoint()
        this.props.fetchUserOwnedShopInfo()
        this.props.fetchUserFollowees()
        this.props.getCurrentPromoter({error: (err) => {
          //Toast.show(err.message)
        }})
        this.props.getPromoterTenant()
        this.props.fetchShareDomain()
      }
    })
  }

  shopManage() {
    // Actions.COMPLETE_SHOP_INFO()
    // Actions.SHOPR_EGISTER()
    // return
    if(!this.props.isUserLogined) {
      Actions.LOGIN()
    }else {
      // console.log('this.props.identity=====', this.props.identity)
      if (this.props.identity && this.props.identity.includes(IDENTITY_SHOPKEEPER)) {
        let userOwnedShopInfo = this.props.userOwnedShopInfo
        // console.log('this.props.userOwnedShopInfo==1==', userOwnedShopInfo)
        if(userOwnedShopInfo.status == 1) {
          if(userOwnedShopInfo.payment == 1) { //已注册，已支付
            if(!userOwnedShopInfo.coverUrl) {
              Actions.COMPLETE_SHOP_INFO()
            }else{
              Actions.MY_SHOP_INDEX()
            }
          }else{//已注册，未支付
            this.props.getShopTenant({
              province: userOwnedShopInfo.geoProvince,
              city: userOwnedShopInfo.geoCity,
              success: (tenant) =>{
                Actions.PAYMENT({
                  metadata: {'shopId':userOwnedShopInfo.id, 'tenant': tenant, 'user': this.props.userInfo.id},
                  price: tenant,
                  paySuccessJumpScene: 'SHOPR_EGISTER_SUCCESS',
                  paySuccessJumpSceneParams: {
                    shopId: userOwnedShopInfo.id,
                    tenant: tenant,
                  },
                  payErrorJumpScene: 'MINE',
                  payErrorJumpSceneParams: {}
                })
              },
              error: (error)=>{
                Toast.show('获取加盟费金额失败')
              }
            })
          }
        }else if(userOwnedShopInfo.status == 0) {
          Toast.show('您的店铺已被关闭，请与客服联系')
        }else{
          Toast.show('您的店铺目前处于异常状态，请联系客服')
        }
      }else {
        // console.log('this.props.identity==2===')
        Actions.SHOPR_EGISTER()
      }

    }
  }

  jumpToAdvise(){
    Actions.ADVISE_FEEDBACK()
  }

  shareToFriend() {
    let shareUrl = this.props.shareDomain + "appDownload/"

    console.log("shopShare url:", shareUrl)

    Actions.SHARE({
      title: "汇邻优店",
      url: shareUrl,
      author: this.props.userInfo.nickname || '邻家小二',
      abstract: "邻里互动，同城交易",
      cover: "https://simors.github.io/ljyd_blog/ic_launcher.png",
    })
  }

  promoterManage() {
    if (this.props.identity && this.props.identity.includes(IDENTITY_PROMOTER)) {
      if (this.props.isPaid) {
        if (this.props.promoterIdentity && this.props.promoterIdentity > 0 && this.props.promoter) {
          Actions.AGENT_PROMOTER({promoter: this.props.promoter})
        } else {
          Actions.PROMOTER_PERFORMANCE()
        }
      } else {
        Actions.PAYMENT({
          title: '支付推广员注册费',
          price: this.props.fee,
          metadata: {'promoterId': this.props.promoter.id, 'user': this.props.userInfo.id},
        })
      }
    } else {
      Actions.PROMOTER_AUTH()
    }
  }

  genPersonalQRCode() {
    let userInfo = {
      userId: this.props.userInfo.id,
    }
    Actions.GEN_PERSONALQR({data: userInfo, avatar: this.props.userInfo.avatar})
  }

  renderToolView() {
    return (
      <View style={styles.toolView}>
        {/*<View style={{marginRight: normalizeW(20)}}>*/}
          {/*<TouchableOpacity onPress={() => {*/}
            {/*Actions.QRCODEREADER({*/}
              {/*readQRSuccess: (QRData) => {*/}
                {/*// Actions.pop()*/}
                {/*if (QRData.startsWith('http') || QRData.startsWith('https')) {*/}
                  {/*Actions.COMMON_WEB_VIEW({url: QRData, showHeader:true, headerTitle: '网页'})*/}
                  {/*return*/}
                {/*}*/}
                {/*let data = JSON.parse(QRData)*/}
                {/*let userId = data.userId*/}
                {/*if (userId) {*/}
                  {/*Actions.PERSONAL_HOMEPAGE({userId: userId})*/}
                  {/*return*/}
                {/*}*/}
              {/*},*/}
              {/*readQRError: (errMessage) => {*/}
                {/*Actions.pop()*/}
                {/*this.setTimeout(() => {*/}
                  {/*Toast.show(errMessage)*/}
                {/*}, 1500)*/}
              {/*}*/}
            {/*})*/}
          {/*}}>*/}
            {/*<Image style={styles.toolBtnImg} resizeMode="contain" source={require('../../assets/images/scan.png')}/>*/}
          {/*</TouchableOpacity>*/}
        {/*</View>*/}
        <View>
          <TouchableOpacity onPress={() => Actions.SETTING()}>
            <Image style={styles.toolBtnImg} resizeMode="contain" source={require('../../assets/images/set.png')}/>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderAvatarView() {
    return (
      <View style={styles.avatarView}>
        <View style={{flexDirection: 'row', alignItems: 'center',}}>
          <View style={{marginLeft: normalizeW(57)}}>
            <TouchableOpacity onPress={() => Actions.PROFILE()}>
              <Image style={styles.avatarStyle}
                     source={this.props.userInfo.avatar ?
                     {uri: (this.props.userInfo.avatar)} : require('../../assets/images/default_portrait.png')} />
            </TouchableOpacity>
          </View>
          <View style={{marginLeft: normalizeW(17)}}>
            <View style={{marginBottom: normalizeH(10)}}>
              <Text style={styles.nicknameStyle}>{this.props.userInfo.nickname}</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {/*<Image style={{marginRight: normalizeW(8), width: normalizeW(9), height: normalizeH(12)}}*/}
                     {/*resizeMode="contain"*/}
                     {/*source={require('../../assets/images/score.png')} />*/}
              {/*<Text style={{fontSize: em(12), color: '#FFF'}}>积分  {this.props.point}</Text>*/}
            </View>
          </View>
        </View>
        {/*<View style={{paddingRight: normalizeW(36)}}>*/}
          {/*<TouchableOpacity onPress={() => {this.genPersonalQRCode()}}>*/}
            {/*<Image style={styles.toolBtnImg} resizeMode="contain" source={require('../../assets/images/code.png')}/>*/}
          {/*</TouchableOpacity>*/}
        {/*</View>*/}
      </View>
    )
  }

  renderFunctionView() {
    return (
      <View style={styles.functionView}>
        <View style={[styles.funcView, {borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.50)'}]}>
          <TouchableOpacity style={styles.funBtn} onPress={() => {Actions.MYTOPIC()}}>
            <Image style={{width: normalizeW(16), height: normalizeH(16)}} source={require('../../assets/images/my_topic.png')}/>
            <Text style={styles.funBtnText}>话题</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.funcView, {borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.50)'}]}>
          <TouchableOpacity style={styles.funBtn} onPress={() => {Actions.MYFANS()}}>
            <Image style={{width: normalizeW(16), height: normalizeH(16)}} source={require('../../assets/images/my_fans.png')}/>
            <Text style={styles.funBtnText}>粉丝</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.funcView}>
          <TouchableOpacity style={styles.funBtn} onPress={() => {Actions.MYATTENTION()}}>
            <Image style={{width: normalizeW(16), height: normalizeH(16)}} source={require('../../assets/images/my_follow.png')}/>
            <Text style={styles.funBtnText}>关注</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  renderHeaderView() {
    return (
      <LinearGradient colors={['#F77418', '#F5A623', '#F77418']} style={styles.header}>
        <View style={{flex: 1, backgroundColor: 'transparent'}}>
          {this.renderToolView()}
          {this.renderAvatarView()}
          {this.renderFunctionView()}
        </View>
      </LinearGradient>
    )
  }

  renderShopBtnText() {
    if (this.props.identity && this.props.identity.includes(IDENTITY_SHOPKEEPER)) {
      return (
        <Text style={styles.menuName}>店铺管理</Text>
      )
    } else {
      return (
        <Text style={styles.menuName}>店铺注册</Text>
      )
    }
  }

  renderPromoterBtnText() {
    if (this.props.identity.includes(IDENTITY_PROMOTER)) {
      return (
        <Text style={styles.menuName}>推广联盟</Text>
      )
    } else {
      return (
        <Text style={styles.menuName}>推广注册</Text>
      )
    }
  }

  renderBodyView() {
    return (
      <View style={{marginTop: normalizeH(15)}}>
        <View style={styles.memuItemView}>
          <TouchableOpacity style={styles.menuItem} onPress={() => {Actions.MESSAGE_BOX()}}>
            <View style={styles.menuIcon}>
              <Image style={styles.menuImg} resizeMode="contain" source={require('../../assets/images/message_24.png')} />
            </View>
            <View>
              <Text style={styles.menuName}>消息中心</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => {this.shopManage()}}>
            <View style={styles.menuIcon}>
              <Image style={styles.menuImg} resizeMode="contain" source={require('../../assets/images/my_shop.png')} />
            </View>
            <View>
              {this.renderShopBtnText()}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => {this.promoterManage()}}>
            <View style={styles.menuIcon}>
              <Image style={styles.menuImg} resizeMode="contain" source={require('../../assets/images/my_push.png')} />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {this.renderPromoterBtnText()}
              <Image style={{marginLeft: 5, width: normalizeW(20), height: normalizeH(20)}} resizeMode='contain'
                     source={require('../../assets/images/hot_20.png')}/>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => {Actions.WALLET()}}>
            <View style={styles.menuIcon}>
              <Image style={styles.menuImg} resizeMode="contain" source={require('../../assets/images/my_wallet.png')} />
            </View>
            <View>
              <Text style={styles.menuName}>钱包</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => {Actions.MY_DRAFTS()}}>
            <View style={styles.menuIcon}>
              <Image style={styles.menuImg} resizeMode="contain" source={require('../../assets/images/drafts_24.png')} />
            </View>
            <View>
              <Text style={styles.menuName}>草稿箱</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => {this.shareToFriend()}}>
            <View style={styles.menuIcon}>
              <Image style={styles.menuImg} resizeMode="contain" source={require('../../assets/images/recommoned.png')} />
            </View>
            <View>
              <Text style={styles.menuName}>分享下载</Text>
            </View>
          </TouchableOpacity>
          {/*<TouchableOpacity style={styles.menuItem} onPress={() => {Actions.CONTACT()}}>*/}
            {/*<View style={styles.menuIcon}>*/}
              {/*<Image style={styles.menuImg} resizeMode="contain" source={require('../../assets/images/contact.png')} />*/}
            {/*</View>*/}
            {/*<View>*/}
              {/*<Text style={styles.menuName}>联系客服</Text>*/}
            {/*</View>*/}
          {/*</TouchableOpacity>*/}
          <TouchableOpacity style={styles.menuItem} onPress={() => {this.jumpToAdvise()}}>
            <View style={styles.menuIcon}>
              <Image style={styles.menuImg} resizeMode="contain" source={require('../../assets/images/sugguestion.png')} />
            </View>
            <View>
              <Text style={styles.menuName}>意见反馈</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flex: 1, marginBottom: normalizeH(45)}}>
          <ScrollView style={{flex: 1}}>
            {this.renderHeaderView()}
            {this.renderBodyView()}
          </ScrollView>
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  let currentUserId = authSelector.activeUserId(state)
  let currentPromoterId = activePromoter(state)
  let userInfo = authSelector.activeUserInfo(state)
  const userOwnedShopInfo = selectUserOwnedShopInfo(state)
  const isUserLogined = authSelector.isUserLogined(state)
  let identity = authSelector.getUserIdentity(state,currentUserId)
  let point = authSelector.getUserPoint(state, currentUserId)
  let isPaid = isPromoterPaid(state, currentPromoterId)
  let promoterIdentity = selectPromoterIdentity(state, currentPromoterId)
  let promoter = getPromoterById(state, currentPromoterId)
  let shareDomain = getShareDomain(state)
  return {
    userInfo: userInfo,
    userOwnedShopInfo: userOwnedShopInfo,
    isUserLogined: isUserLogined,
    identity: identity,
    isPaid: isPaid,
    point: point,
    fee: getTenantFee(state),
    promoterIdentity: promoterIdentity,
    promoter: promoter,
    shareDomain: shareDomain
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchUserOwnedShopInfo,
  fetchUserFollowees,
  fetchUserPoint,
  getCurrentPromoter,
  getPromoterTenant,
  getShopTenant,
  fetchShareDomain
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Mine)

Object.assign(Mine.prototype, TimerMixin)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.base.backgroundColor,
  },
  header: {
    width: PAGE_WIDTH,
    height: normalizeH(217),
  },
  toolView: {
    marginTop: normalizeH(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: normalizeH(10),
    paddingBottom: normalizeH(10),
    paddingRight: normalizeW(35),
  },
  avatarView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  functionView: {
    flexDirection: 'row',
    alignItems: 'center',
    height: normalizeH(69),
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.50)',
  },
  avatarStyle: {
    width: normalizeW(60),
    height: normalizeH(60),
    borderRadius: normalizeW(30),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  nicknameStyle: {
    fontSize: em(17),
    fontWeight: 'bold',
    color: '#FFF',
  },
  funcView: {
    flex: 1,
  },
  funBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  funBtnText: {
    fontSize: em(17),
    color: 'white',
    marginTop: normalizeH(8),
  },
  countText: {
    fontSize: em(12),
    color: 'white'
  },
  memuItemView: {

  },
  menuItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F7F7F7',
    height: normalizeH(53),
  },
  menuIcon: {
    paddingLeft: normalizeW(27),
    paddingRight: normalizeW(41),
  },
  menuName: {
    fontSize: em(17),
    color: '#5A5A5A',
  },
  menuImg: {
    width: normalizeW(24),
    height: normalizeH(24),
  },
  toolBtnImg: {
    width: normalizeW(22),
    height: normalizeH(22),
  },
})