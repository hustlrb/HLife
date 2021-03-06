/**
 * Created by zachary on 2016/12/13.
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
  InteractionManager,
  ActivityIndicator
} from 'react-native'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {Actions} from 'react-native-router-flux'

import {Geolocation} from '../common/BaiduMap'
import * as DeviceInfo from 'react-native-device-info'
import * as locSelector from '../../selector/locSelector'

import Header from '../common/Header'
import {
  Option,
  OptionList,
  Select
} from '../common/CommonSelect'
import CommonListView from '../common/CommonListView'
import {em, normalizeW, normalizeH, normalizeBorder} from '../../util/Responsive'
import THEME from '../../constants/themes/theme1'
import * as Toast from '../common/Toast'
import ScoreShow from '../common/ScoreShow'
import {selectShopCategories} from '../../selector/configSelector'
import {selectShopList, selectShopTags, selectFetchShopListIsArrivedLastPage} from '../../selector/shopSelector'
import {fetchShopCategories} from '../../action/configAction'
import {fetchShopList, fetchShopTags} from '../../action/shopAction'
import TimerMixin from 'react-timer-mixin'

const PAGE_WIDTH = Dimensions.get('window').width
const PAGE_HEIGHT = Dimensions.get('window').height

class ShopCategoryList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      searchForm: {
        shopCategoryId: '',
        sortId: '0',
        distance: '',
        geo: undefined,
        geoCity: '',
        lastCreatedAt: '',
        lastScore: '',
        lastGeo: '',
        shopTagId: '',
        skipNum: 0,
        loadingOtherCityData: false
      },
      shopCategoryName: '',
      selectGroupShow: [false, false, false],
      selectGroupHeight: 40,
      overlayHeight: 0,
      animating: false
    }

    this.isRefreshRendering = true
    this.isLastPage = false
  }

  componentWillMount() {
    // console.log('componentWillMount.this.props.shopCategoryId==', this.props.shopCategoryId)
    if(this.props.shopCategoryId) {
      this.state.searchForm.shopCategoryId = this.props.shopCategoryId
      this.state.searchForm.shopCategoryName = this.props.shopCategoryName
      this.setState({
        ...this.state,
        searchForm: {
          ...this.state.searchForm,
          shopCategoryId: this.state.searchForm.shopCategoryId
        },
        shopCategoryName: this.state.searchForm.shopCategoryName
      })
    }

    InteractionManager.runAfterInteractions(()=>{
      this.props.fetchShopCategories()
      this.props.fetchShopTags()
      this.refreshData()
    })

    this.updateCurrentPosition()
  }

  updateCurrentPosition(callback) {
    // console.log("DeviceInfo.isEmulator===", DeviceInfo.isEmulator())
    if(DeviceInfo.isEmulator()) {
      this.state.searchForm.geo = [28.213866,112.8186868]
      this.state.searchForm.geoCity = '长沙'
      this.setState({
        searchForm: {
          ...this.state.searchForm,
          geo: this.state.searchForm.geo,
          geoCity: this.state.searchForm.geoCity
        }
      })
      callback && callback()
      return
    }

    // console.log('updateCurrentPosition....>>>>>', this.props.curGeoPoint)
    this.state.searchForm.geo = [this.props.curGeoPoint.latitude, this.props.curGeoPoint.longitude]
    this.state.searchForm.geoCity = this.props.curCity
    this.setState({
      ...this.state.searchForm,
      geo: this.state.searchForm.geo,
      geoCity: this.state.searchForm.geoCity
    }, ()=>{
      callback && callback()
    })

    // Geolocation.getCurrentPosition()
    // .then(data => {
    //   this.state.searchForm.geo = [data.latitude, data.longitude]
    //   this.setState({
    //     searchForm: {
    //       ...this.state.searchForm,
    //       geo: this.state.searchForm.geo,
    //     }
    //   })
    //
    //   if (Platform.OS == 'ios') {
    //     Geolocation.reverseGeoCode(data.latitude, data.longitude)
    //       .then(response => {
    //         this.state.searchForm.geoCity = response.city,
    //           this.setState({
    //             searchForm: {
    //               ...this.state.searchForm,
    //               geoCity: this.state.searchForm.geoCity
    //             }
    //           }, ()=>{
    //             callback && callback()
    //           })
    //       })
    //   }else {
    //     this.state.searchForm.geoCity = data.city,
    //       this.setState({
    //         searchForm: {
    //           ...this.state.searchForm,
    //           geoCity: this.state.searchForm.geoCity
    //         }
    //       }, ()=>{
    //         callback && callback()
    //       })
    //   }

    // }, (reason)=>{
    //   callback && callback()
    // })
  }

  componentDidMount() {
    //console.log('========componentDidMount=========')
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.lastScore || nextProps.lastGeo || nextProps.lastCreatedAt || nextProps.total) {
      this.state.searchForm.skipNum = nextProps.nextSkipNum
      this.state.searchForm.lastScore = nextProps.lastScore
      this.state.searchForm.lastGeo = nextProps.lastGeo
      this.state.searchForm.lastCreatedAt = nextProps.lastCreatedAt
      this.setState({
        ...this.state,
        searchForm: this.state.searchForm
      })
    }

    // this.isLastPage = nextProps.isLastPage
    // console.log('========componentWillReceiveProps====this.isLastPage=====',this.isLastPage)
    // if(this.isLastPage) {
    //   this.setTimeout(()=>{
    //     if(this.listView) {
    //       this.listView.isLoadUp(false)
    //     }
    //   }, 1000)
    // }
  }

  _getOptionList(OptionListRef) {
    return this.refs[OptionListRef]
  }


  _onSelectShopCategory(shopCategoryId) {
    this.scrollToTop(()=>{
      // console.log('_onSelectShopCategory.shopCategoryId=' , shopCategoryId)
      this.state.searchForm.shopCategoryId = shopCategoryId
      this.state.selectGroupShow = [false, false, false]
      this.setState({
        ...this.state,
        searchForm: {
          ...this.state.searchForm,
          shopCategoryId: this.state.searchForm.shopCategoryId,
          shopTagId: ''
        },
        selectGroupShow: this.state.selectGroupShow
      }, ()=>{
        this.refreshData()
      })
      // console.log('_onSelectShopCategory.this.state=' , this.state)
      this.toggleSelectGroupHeight()
    })

  }

  _onSelectSort(sortId) {
    this.scrollToTop(() => {
      this.state.selectGroupShow = [false, false, false]
      this.state.searchForm.sortId = sortId
      this.setState({
        ...this.state,
        searchFrom: {
          ...this.state.searchForm,
          sortId: this.state.searchForm.sortId
        },
        selectGroupShow: this.state.selectGroupShow
      }, ()=>{
        this.refreshData()
      })
      this.toggleSelectGroupHeight()
    })
  }

  scrollToTop(callback) {
    if(this.listView) {
      // console.log('this.listView===', this.listView)
      this.listView.refs.listView.scrollTo({y:0})
    }
    if(typeof callback == 'function') {
      callback()
    }
  }

  _onSelectDistance(distance) {
    this.scrollToTop(()=>{
      if('全城' == distance) {
        distance = ''
      }
      this.state.selectGroupShow = [false, false, false]
      this.state.searchForm.distance = distance
      this.setState({
        ...this.state,
        searchFrom: {
          ...this.state.searchForm,
          distance: this.state.searchForm.distance
        },
        selectGroupShow: this.state.selectGroupShow
      }, ()=>{
        this.refreshData()
      })
      this.toggleSelectGroupHeight()
    })

  }

  toggleSelectGroupHeight() {
    let hasShow = false
    this.state.selectGroupShow.forEach((item, index) => {
      if(item) {
        hasShow = true
        return
      }
    })
    if(hasShow) {
      this.state.selectGroupHeight = PAGE_HEIGHT
      this.setState({
        selectGroupHeight: this.state.selectGroupHeight,
        overlayHeight: PAGE_HEIGHT
      })
    }else{
      this.state.selectGroupHeight = 40
      this.setState({
        selectGroupHeight: this.state.selectGroupHeight,
        overlayHeight: 0
      })
    }
  }

  _onOverlayPress() {
    this.state.selectGroupShow = [false, false, false]
    this.setState({
      selectGroupShow: this.state.selectGroupShow
    })
    this.toggleSelectGroupHeight()
  }

  _onSelectPress(index){
    if(index == 0) {
      this.state.selectGroupShow = [!this.state.selectGroupShow[0], false, false]
    }else if(index == 1) {
      this.state.selectGroupShow = [false, !this.state.selectGroupShow[1], false]
    }else if(index == 2) {
      this.state.selectGroupShow = [false, false, !this.state.selectGroupShow[2]]
    }

    this.setState({ //Notes:触发子组件更新
      selectGroupShow: this.state.selectGroupShow
    })

    this.toggleSelectGroupHeight()
  }

  renderShopCategoryOptions() {
    let optionsView = <View />
    if(this.props.allShopCategories) {
      optionsView = this.props.allShopCategories.map((item, index) => {
        return (
          <Option ref={"option_"+index} key={"shopCategoryOption_" + index} value={item.shopCategoryId}>{item.text}</Option>
        )
      })
    }
    return optionsView
  }

  gotoShopDetailScene(id) {
    Actions.SHOP_DETAIL({id: id})
  }

  shopTagQuery(shopTagId, isSlted) {
    this.setState({
      searchForm: {
        ...this.state.searchForm,
        shopTagId: isSlted ? '' : shopTagId
      }
    }, ()=>{
      this.refreshData()
    })
  }
  
  getRecommendShopTags() {
    let shopCategoryContainedTag = []
    if(this.props.allShopCategories && this.props.allShopCategories.length) {
      for(let i = 0; i < this.props.allShopCategories.length; i++) {
        let shopCategory = this.props.allShopCategories[i]
        if(shopCategory.shopCategoryId == this.state.searchForm.shopCategoryId) {
          shopCategoryContainedTag = shopCategory.containedTag
          break
        }
      }
    }

    let recommendShopTags = []
    if(shopCategoryContainedTag && shopCategoryContainedTag.length) {
      let randomShowIndex = -1
      if(shopCategoryContainedTag.length > 6) {
        randomShowIndex = Math.floor(Math.random() * (shopCategoryContainedTag.length - 6))
      }

      shopCategoryContainedTag.map((item, index)=>{
        if(index > randomShowIndex && index <= (randomShowIndex + 6)) {
          recommendShopTags.push(item)
        }
      })
    }

    return recommendShopTags
  }

  renderTags() {
    // console.log('renderTags')
    let shopTags = this.getRecommendShopTags()
    if(shopTags && shopTags.length) {
      let allShopTagsView = shopTags.map((item, index)=> {
        let sltedTagBoxStyle = {}
        let sltedShopTagStyle = {}
        let isSlted = false
        if(this.state.searchForm.shopTagId == item.id) {
          isSlted = true
          sltedTagBoxStyle = {
            backgroundColor: THEME.colors.green
          }
          sltedShopTagStyle = {
            color: '#fff'
          }
        }
        return (
          <TouchableOpacity key={"shop_tag_" + index} onPress={()=>{this.shopTagQuery(item.id, isSlted)}}>
            <View style={[styles.shopTagBox, sltedTagBoxStyle]}>
              <Text style={[styles.shopTag, sltedShopTagStyle]}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )
      })

      return (
        <View key="shopTags" style={styles.shopTagsWrap}>
          {allShopTagsView}
        </View>
      )
    }
  }

  renderShop(rowData, customStyle) {
    let shopTag = null
    if(rowData.containedTag && rowData.containedTag.length) {
      shopTag = rowData.containedTag[0].name
    }

    return (
      <TouchableOpacity onPress={()=>{this.gotoShopDetailScene(rowData.id)}}>
        <View style={[styles.shopInfoWrap, customStyle]}>
          <View style={styles.coverWrap}>
            <Image style={styles.cover} source={{uri: rowData.coverUrl}}/>
          </View>
          <View style={styles.shopIntroWrap}>
            <View style={styles.shopInnerIntroWrap}>
              <Text style={styles.shopName} numberOfLines={1}>{rowData.shopName}</Text>
              <ScoreShow
                containerStyle={{flex:1}}
                score={rowData.score}
              />
              <View style={styles.subInfoWrap}>
                {shopTag &&
                <Text style={[styles.subTxt]}>{shopTag}</Text>
                }
                <View style={{flex:1,flexDirection:'row'}}>
                  <Text style={styles.subTxt}>{rowData.geoDistrict && rowData.geoDistrict}</Text>
                </View>
                {rowData.distance &&
                <Text style={[styles.subTxt]}>{rowData.distance + rowData.distanceUnit}</Text>
                }
              </View>
            </View>
            {this.renderShopPromotion(rowData)}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  renderShopPromotion(shopInfo) {
    let containedPromotions = shopInfo.containedPromotions
    if(containedPromotions && containedPromotions.length) {
      let shopPromotionView = containedPromotions.map((promotion, index)=>{
        return (
          <View key={'promotion_' + index} style={styles.shopPromotionBox}>
            <View style={styles.shopPromotionBadge}>
              <Text style={styles.shopPromotionBadgeTxt}>{promotion.type}</Text>
            </View>
            <View style={styles.shopPromotionContent}>
              <Text numberOfLines={1} style={styles.shopPromotionContentTxt}>{promotion.typeDesc}</Text>
            </View>
          </View>
        )
      })
      return (
        <View style={styles.shopPromotionWrap}>
          {shopPromotionView}
        </View>
      )
    }
    return null
  }

  renderRow(rowData, sectionID, rowID, highlightRow) {
    let tagsView = null
    let customStyle = null
    // console.log('renderRow')
    if(4 == rowID || !this.props.shopList.length || (this.props.shopList.length < 5 && this.props.shopList.length == (+rowID+1))) {
      tagsView = this.renderTags()
      customStyle = {marginBottom: 0}
    }

    return (
      <View>
        {tagsView
          ? <View>
              {this.renderShop(rowData, customStyle)}
              {tagsView}
            </View>
          : this.renderShop(rowData)
        }
      </View>
    )
  }

  // renderRow(rowData, sectionID, rowID, highlightRow) {
  //   return this.renderShop(rowData)
  // }

  refreshData(payload) {
    this.isLastPage = false

    if(payload && payload.loadingOtherCityData) {
      this.loadMoreData(true)
    }else {
      this.setState({
        searchForm: {
          ...this.state.searchForm,
          loadingOtherCityData: false
        }
      }, () => {
        this.loadMoreData(true)
      })
    }
  }

  loadMoreData(isRefresh) {
    // console.log('========loadMoreData===this.isLastPage======', this.isLastPage)
    // console.log('========loadMoreData===isRefresh======', isRefresh)
    // console.log('========loadMoreData=======this.isRefreshRendering==', this.isRefreshRendering)
    if (!this.state.searchForm.geo
      || this.state.searchForm.geo.length != 2
      || !this.state.searchForm.geoCity) {
      this.updateCurrentPosition(()=> {
        this.fetchMoreData(isRefresh)
      })
    }else {
      this.fetchMoreData(isRefresh)
    }
  }

  fetchMoreData(isRefresh) {
    if(!isRefresh) {
      if(this.isRefreshRendering) {
        return
      }
      // this.listView.hideFooter(false)
    }else {
      this.isRefreshRendering = true
      // this.listView.hideFooter(true)
    }
    // console.log('loadMoreData.isLastPage=====', this.isLastPage)
    if(this.isLastPage) {
      this.listView.isLoadUp(false)
      return
    }

    let limit = 5
    let payload = {
      ...this.state.searchForm,
      isRefresh: !!isRefresh,
      limit: limit,
      success: (isEmpty, fetchedSize) => {
        if(!this.listView) {
          return
        }
        // console.log('loadMoreData.isEmpty=====', isEmpty)
        if(isEmpty) {
          if(!this.state.searchForm.loadingOtherCityData) {
            this.setState({
              searchForm: {
                ...this.state.searchForm,
                loadingOtherCityData: true,
                skipNum: isRefresh ? 0 : this.state.searchForm.skipNum
              }
            }, ()=>{
              // console.log('isEmpty===', isEmpty)
              if(isRefresh) {
                this.refreshData({loadingOtherCityData: true})
              }else {
                this.loadMoreData()
              }
            })
          }

          this.listView.isLoadUp(false)
        }else {
          this.listView.isLoadUp(true)
          // console.log('isRefresh====', isRefresh)
          // console.log('fetchedSize====', fetchedSize)
          if(isRefresh && fetchedSize < limit) {
            this.isRefreshRendering = false
            this.loadMoreData()
          }
        }
      },
      error: (err)=>{
        Toast.show(err.message, {duration: 1000})
      }
    }
    this.props.fetchShopList(payload)
  }

  renderSectionHeader(sectionData, sectionID) {
    return null
    // if(sectionData.length < 12) {
    //   return null
    // }
    // return (
    //   <View style={styles.sectionHeader}>
    //     <ScrollView
    //       showsVerticalScrollIndicator={true}
    //     >
    //       {this.renderTags(this.props.allShopTags)}
    //     </ScrollView>
    //   </View>
    // )
  }

  handleOnScroll(e) {
    // this.scrollOffSet = e.nativeEvent.contentOffset.y
    // console.log('e.nativeEvent.contentOffset.y===', e.nativeEvent.contentOffset.y)
    if(e.nativeEvent.contentOffset.y > 0) {
      this.isRefreshRendering = false
      //this.listView.hideFooter(false)
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          leftType="icon"
          leftIconName="ios-arrow-back"
          leftPress={() => Actions.pop()}
          title="全部店铺"
          rightType="none"
        />
        <View style={styles.body}>
          <View style={{flex:1,paddingTop: 40}}>
            {!this.props.shopList.length &&
              <View>
                {this.renderTags()}
              </View>
            }
            <CommonListView
              contentContainerStyle={{backgroundColor: 'white'}}
              dataSource={this.props.ds}
              renderRow={(rowData, sectionID, rowID, highlightRow) => this.renderRow(rowData, sectionID, rowID, highlightRow)}
              loadNewData={()=>{this.refreshData()}}
              loadMoreData={()=>{this.loadMoreData()}}
              ref={(listView) => this.listView = listView}
              renderSectionHeader={this.renderSectionHeader.bind(this)}
              onScroll={e => this.handleOnScroll(e)}
            />
          </View>

          <View style={[styles.selectGroup, {height: this.state.selectGroupHeight}]}>
            <View style={styles.selectContainer}>
              <Select
                show={this.state.selectGroupShow[0]}
                onPress={()=>this._onSelectPress(0)}
                style={{borderBottomWidth:normalizeBorder()}}
                selectRef="SELECT1"
                overlayPageX={0}
                optionListHeight={240}
                hasOverlay={false}
                optionListRef={()=> this._getOptionList('SHOP_CATEGORY_OPTION_LIST')}
                defaultText={this.state.shopCategoryName}
                defaultValue={this.state.searchForm.shopCategoryId}
                onSelect={this._onSelectShopCategory.bind(this)}>

                <Option key={"shopCategoryOption_-1"} value="">全部分类</Option>
                {this.renderShopCategoryOptions()}
              </Select>

            </View>
            <View style={styles.selectContainer}>
              <Select
                show={this.state.selectGroupShow[1]}
                onPress={()=>this._onSelectPress(1)}
                style={{borderWidth:normalizeBorder()}}
                selectRef="SELECT2"
                overlayPageX={0}
                optionListHeight={200}
                hasOverlay={false}
                optionListRef={()=> this._getOptionList('DISTANCE_OPTION_LIST')}
                defaultText="全城"
                defaultValue=""
                onSelect={this._onSelectDistance.bind(this)}>
                <Option key={"distanceOption_0"} value="1">1km</Option>
                <Option key={"distanceOption_1"} value="2">2km</Option>
                <Option key={"distanceOption_2"} value="5">5km</Option>
                <Option key={"distanceOption_3"} value="10">10km</Option>
                <Option key={"distanceOption_4"} value="全城">全城</Option>
              </Select>

            </View>
            <View style={styles.selectContainer}>
              <Select
                show={this.state.selectGroupShow[2]}
                onPress={()=>this._onSelectPress(2)}
                style={{borderBottomWidth:normalizeBorder()}}
                selectRef="SELECT3"
                overlayPageX={0}
                hasOverlay={false}
                optionListRef={()=> this._getOptionList('SORT_OPTION_LIST')}
                defaultText="智能排序"
                defaultValue="0"
                onSelect={this._onSelectSort.bind(this)}>
                <Option key={"sortOption_0"} value="0">智能排序</Option>
                <Option key={"sortOption_1"} value="1">好评优先</Option>
                <Option key={"sortOption_2"} value="2">距离优先</Option>
              </Select>

            </View>
          </View>
          <TouchableWithoutFeedback onPress={()=>{this._onOverlayPress()}}>
            <View style={[styles.selectOverlay, { height: this.state.overlayHeight }]}>
            </View>
          </TouchableWithoutFeedback>
          <OptionList ref="SHOP_CATEGORY_OPTION_LIST"/>
          <OptionList ref="DISTANCE_OPTION_LIST"/>
          <OptionList ref="SORT_OPTION_LIST"/>
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  let ds = undefined
  if(ownProps.ds) {
    ds = ownProps.ds
  } else {
    ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 != r2,
    })
  }
  let isLastPage = selectFetchShopListIsArrivedLastPage(state)
  // console.log('selectFetchShopListIsArrivedLastPage.isLastPage===', isLastPage)
  const allShopCategories = selectShopCategories(state)
  // console.log('allShopCategories=', allShopCategories)
  const shopList = selectShopList(state) || []
  // console.log('mapStateToProps.shopList=', shopList)
  let lastScore = ''
  let lastCreatedAt = ''
  let lastGeo = []
  let nextSkipNum = 0
  if(shopList && shopList.length) {
    lastCreatedAt = shopList[shopList.length-1].createdAt
    lastScore = shopList[shopList.length-1].score
    lastGeo = shopList[shopList.length-1].geo
    nextSkipNum = shopList[shopList.length-1].nextSkipNum
    // console.log('mapStateToProps.shopList.length=', shopList.length)
    if(shopList.length < 5) {
      isLastPage = true
    }
  }

  const allShopTags = selectShopTags(state)

  const curGeoPoint = locSelector.getGeopoint(state)
  const curCity = locSelector.getCity(state)

  return {
    ds: ds.cloneWithRows(shopList),
    shopList: shopList,
    allShopCategories: allShopCategories,
    lastCreatedAt: lastCreatedAt,
    lastScore: lastScore,
    lastGeo: lastGeo,
    allShopTags: allShopTags,
    isLastPage: isLastPage,
    nextSkipNum: nextSkipNum,
    curGeoPoint: curGeoPoint,
    curCity: curCity,
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchShopCategories,
  fetchShopList,
  fetchShopTags,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(ShopCategoryList)

Object.assign(ShopCategoryList.prototype, TimerMixin)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    marginTop: normalizeH(64),
    flex: 1,
  },
  selectGroup: {
    position: 'absolute',
    left: 0,
    width:PAGE_WIDTH,
    top: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  selectOverlay: {
    position: 'absolute',
    left: 0,
    width:PAGE_WIDTH,
    top: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  selectContainer: {
    flex: 1,
    height: 40
  },
  shopInfoWrap: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
    paddingBottom:15,
    backgroundColor: '#fff',
    borderBottomWidth:normalizeBorder(),
    borderBottomColor: '#f5f5f5'
  },
  shopInnerIntroWrap: {
    height: 80,
  },
  shopPromotionWrap: {
    flex: 1,
    marginTop: 10,
    borderTopWidth:normalizeBorder(),
    borderTopColor: '#f5f5f5'
  },
  shopPromotionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  shopPromotionBadge: {
    backgroundColor: '#F6A623',
    borderRadius: 2,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  shopPromotionBadgeTxt: {
    color:'white',
    fontSize: em(12)
  },
  shopPromotionContent: {
    flex: 1,
    marginLeft: 10
  },
  shopPromotionContentTxt: {
    color: '#aaaaaa',
    fontSize: em(12)
  },
  coverWrap: {
    width: 80,
    height: 80
  },
  cover: {
    flex: 1
  },
  shopIntroWrap: {
    flex: 1,
    paddingLeft: 10,
  },
  shopName: {
    lineHeight: em(20),
    fontSize: em(17),
    color: '#8f8e94'
  },
  subInfoWrap: {
    flexDirection: 'row',
  },
  subTxt: {
    marginRight: normalizeW(10),
    color: '#d8d8d8',
    fontSize: em(12)
  },
  shopTagsWrap: {
    padding: 10,
    paddingBottom: 0,
    backgroundColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  shopTagBox: {
    height: 40,
    width: normalizeW(108),
    marginLeft: normalizeW(5),
    marginRight: normalizeW(5),
    marginBottom: 10,
    padding: 5,
    paddingLeft: normalizeW(10),
    paddingRight: normalizeW(10),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  shopTag: {
    fontSize: em(17),
    color: '#8f8e94'
  },
  sectionHeader: {
    backgroundColor: '#fff',
    height: 110,
    borderTopWidth:normalizeBorder(),
    borderTopColor: '#b2b2b2'
  }
})