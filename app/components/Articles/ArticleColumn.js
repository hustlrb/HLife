/**
 * Created by zachary on 2016/12/13.
 */
import {Map, List, Record} from 'immutable'
import React, {Component} from 'react'
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  InteractionManager,
  ListView,
} from 'react-native'
import {connect} from 'react-redux'
import AV from 'leancloud-storage'
import {bindActionCreators} from 'redux'
import {em, normalizeW, normalizeH, normalizeBorder} from '../../util/Responsive'
import Categorys from '../Articles/Categorys'
import {Actions} from 'react-native-router-flux'
import THEME from '../../constants/themes/theme1'
import {fetchColumn} from '../../action/configAction'
import {getColumn} from '../../selector/configSelector'
import ScrollableTabView, {ScrollableTabBar} from 'react-native-scrollable-tab-view';
import ArticleShow from './ArticleShow'
import {getArticleCollection} from '../../selector/articleSelector'
import {fetchArticle} from '../../action/articleAction'

class ArticleColumn extends Component {
  constructor(props) {
    super(props)
    this.state = {
      columnItem: 0,
      columnId: 0,
    }
  }

  componentDidMount() {
    console.log('DidMountisHere-====--------->', this.props.columnId)

    InteractionManager.runAfterInteractions(() => {
      this.props.fetchArticle(this.props.columnId)
    })
    this.props.column.map((value, key)=> {
      if (value.columnId == this.props.columnId) {
        this.setState({columnItem: key, columnId: value.columnId})
      }
    })

  }


  changeTab(payload) {

    this.setState({columnItem: payload.i})
    if (this.props.column) {
      return (
        this.props.column.map((value, key) => {
          // console.log('=========<<<<<<<<',value)
          if (key == payload.i) {
           this.setState({columnId: value.columnId})
            this.props.fetchArticle(value.columnId)
          }
        })
      )
    }
  }

  renderColumns() {
    if (this.props.column) {
      return (
        this.props.column.map((value, key) => {
            return (
              <View key={key} tabLabel={value.title}
                    style={[styles.itemLayout, this.props.itemLayout && this.props.itemLayout]}>
                {this.renderArticleList(value.columnId)}
              </View>
            )
          }
        )
      )
    }
  }

  renderArticleItem(rowData) {
    let value = rowData
    return (
      <View
        style={[styles.itemLayout, this.props.itemLayout && this.props.itemLayout]}>
        <ArticleShow {...value}/>
      </View>
    )
  }

  renderArticleList(columnId) {

    let columnArticles = this.props.columnArticles
    let articles = columnArticles.find(value => {
      return (value.id === columnId)
    })
    if (!articles) {
      return (
        <View/>
      )
    } else {

      let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
      let articleSource

      articleSource = ds.cloneWithRows(articles.articles)
      console.log('article========>', articles.articles)

      return (
        <ListView dataSource={articleSource}
                  renderRow={(rowData) => this.renderArticleItem(rowData)} />
      )
    }
  }


  renderTabBar() {
    return (
      <ScrollableTabBar
        activeTextColor={this.props.activeTextColor}
        inactiveTextColor={this.props.inactiveTextColor}
        style={[styles.tarBarStyle, this.props.tarBarStyle && this.props.tarBarStyle]}
        underlineStyle={[styles.tarBarUnderlineStyle, this.props.tarBarUnderlineStyle && this.props.tarBarUnderlineStyle]}
        textStyle={[styles.tabBarTextStyle, this.props.tabBarTextStyle && this.props.tabBarTextStyle]}
        tabStyle={[styles.tabBarTabStyle, this.props.tabBarTabStyle && this.props.tabBarTabStyle]}
        backgroundColor={this.props.backgroundColor}
      />

    )
  }

  render() {
    if (this.props.column) {
      return (

        <ScrollableTabView style={[styles.body, this.props.body && this.props.body]}
                           page={this.state.columnItem}
                           scrollWithoutAnimation={true}
                           renderTabBar={()=> this.renderTabBar()}
                           onChangeTab={(payload) => this.changeTab(payload)}
        >
          {this.renderColumns()}
        </ScrollableTabView>
      )
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  let column = getColumn(state)
  let columnArticles = getArticleCollection(state)

  return {
    column: column,
    columnArticles: columnArticles,
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchArticle
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(ArticleColumn)

const styles = StyleSheet.create({
  channelContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff'
  },
  defaultImageStyles: {
    height: normalizeH(35),
    width: normalizeW(35),
  },
  channelWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  channelText: {
    marginTop: 4,
    color: THEME.colors.gray,
    textAlign: 'center'
  },
  body: {
    ...Platform.select({
      ios: {
        paddingTop: normalizeH(64),
      },
      android: {
        paddingTop: normalizeH(45)
      }
    }),
    flex: 1,
    alignItems: 'stretch',
    backgroundColor: '#E5E5E5',
  },
  itemLayout: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabBarTextStyle: {
    fontSize: 16,
    paddingBottom: 10,
  },

  tabBarTabStyle: {
    paddingBottom: 0,
    paddingLeft: 12,
    paddingRight: 12
  },


  tabBarUnderLineStyle: {
    height: 0,
  },

  tabBarStyle: {
    height: normalizeH(38),
    width:normalizeW(339)
  },
  moreColumns:{
    height:normalizeH(20),
    width:normalizeW(20)
  },
})