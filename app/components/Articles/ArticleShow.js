import React, {Component} from 'react'
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
  InteractionManager,
  ScrollView,
  TouchableHighlight
} from 'react-native'
import Header from '../common/Header'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import icon from 'react-native-vector-icons/Ionicons'
import {em, normalizeW, normalizeH, normalizeBorder} from '../../util/Responsive'
import THEME from '../../constants/themes/theme1'
import {getColumn} from '../../selector/configSelector'
import {Actions} from 'react-native-router-flux'
import {fetchIsUP,upArticle,unUpArticle,fetchCommentsArticle,fetchCommentsCount,fetchUpCount} from '../../action/articleAction'
import {getIsUp,getcommentList,getcommentCount,getUpCount} from '../../selector/articleSelector'
import * as Toast from '../common/Toast'


const PAGE_WIDTH = Dimensions.get('window').width
const PAGE_HEIGHT = Dimensions.get('window').height


 class ArticleShow extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
   // console.log('DidMountisHere-====--------->',this.props)
    InteractionManager.runAfterInteractions(() => {
     // this.props.fetchLikers(this.props.articleId,this.props.categoryId)//
      this.props.fetchUpCount({articleId: this.props.articleId,upType:'article'})
      //this.props.fetchCommentsArticle(this.props.articleId,this.props.categoryId)
      this.props.fetchCommentsCount(this.props.articleId,this.props.categoryId)
      this.props.fetchIsUP({articleId: this.props.articleId,upType:'article'})
    })

  }
   upSuccessCallback() {
     InteractionManager.runAfterInteractions(() => {
       this.props.fetchUpCount({articleId: this.props.articleId,upType:'article'})
       //this.props.fetchCommentsArticle(this.props.articleId,this.props.categoryId)
       this.props.fetchCommentsCount(this.props.articleId,this.props.categoryId)
       this.props.fetchIsUP({articleId: this.props.articleId,upType:'article'})
     })
   }

   likeErrorCallback(error) {
     Toast.show(error.message)
   }
   onLikeButton() {
     if (this.props.isUp) {
       this.props.unUpArticle({
         articleId: this.props.articleId,
         upType: 'article',
         success: this.upSuccessCallback.bind(this),
         error: this.likeErrorCallback
       })
     }
     else {
       this.props.upArticle({
         articleId: this.props.articleId,
         upType: 'article',
         success: this.upSuccessCallback.bind(this),
         error: this.likeErrorCallback
       })
     }
   }

  renderArticles() {
    if (this.props.articleId) {
      let imageCount = this.props.images.length
     // let likeCount = this.props.likers.length
      switch (imageCount) {
        case 1:
          return (
            <View style={styles.container}>
              <View style={styles.oneImage}>
                <TouchableOpacity onPress={()=> {
                  Actions.ARTICLES_ARTICLE({...this.props})
                }}>
                  <View>
                    <Image style={styles.image} source={{uri: this.props.images[0]}}>
                    </Image>
                  </View>
                </TouchableOpacity>
                <View style={styles.oneArticleInfo}>
                  <TouchableOpacity onPress={()=> {
                    Actions.ARTICLES_ARTICLE({...this.props})
                  }}>
                    <View style={styles.oneTitle}>
                      <Text style={{fontSize: normalizeW(17), color: '#636363'}}>{this.props.title}</Text>
                    </View>
                  </TouchableOpacity>
                  <View style={styles.oneAuthor}>
                    <Image style={{
                      height: normalizeH(20),
                      width: normalizeW(20),
                      overflow: 'hidden',
                      borderRadius: normalizeW(10)
                    }} source={{uri: this.props.avatar}}></Image>
                    <Text style={{
                      fontSize: normalizeW(15),
                      color: '#929292',
                      marginLeft: normalizeW(8)
                    }}>{this.props.nickname}</Text>
                  </View>
                  <View style={styles.comment}></View>
                </View>
              </View>
            </View>
          )
          break
        case 2:
          return (
            <View style={styles.container}>
              <View style={styles.oneImage}>
                <View>
                  <Image style={styles.image} source={{uri: 'http://img1.3lian.com/2015/a1/53/d/198.jpg'}}>

                  </Image>
                </View>
                <View style={styles.articleInfo}>
                  <View style={styles.title}>
                    <Text>一生一次的婚礼要搭裙子</Text>
                  </View>
                  <View style={styles.author}></View>
                  <View style={styles.comment}></View>
                </View>
              </View>
            </View>
          )
          break
        case 3:
          return (
            <View style={styles.container}>
              <View style={styles.threeImageView}>
                <TouchableOpacity onPress={()=> {
                  Actions.ARTICLES_ARTICLE({...this.props})
                }}>
                  <View >
                    <Text style={styles.threeTitle}>{this.props.title}</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <Image style={styles.threeImage} source={{uri: this.props.images[0]}}>
                    </Image>
                    <Image style={styles.threeImage} source={{uri: this.props.images[1]}}>
                    </Image>
                    <Image style={styles.threeImage} source={{uri: this.props.images[2]}}>
                    </Image>
                  </View>
                </TouchableOpacity>
                <View style={styles.threeArticleInfo}>
                  <Image style={styles.threeAvatar} source={{uri: this.props.avatar}}></Image>
                  <Text style={{width:normalizeW(180),fontSize: normalizeW(15), color: '#929292'}}>{this.props.nickname}</Text>
                  <TouchableOpacity  onPress={()=>this.onLikeButton()}>
                  <View style={styles.threelike}>
                  <Image  source={this.props.isUp ?
                    require("../../assets/images/like_select.png") :
                    require("../../assets/images/like_unselect.png")}/>
                </View>
                    </TouchableOpacity>
                  <Text style={styles.threelikeT}>{this.props.upCount?this.props.upCount:0}</Text>
                  {/*<View style={styles.comments}></View>*/}
                   <Image source={require('../../assets/images/artical_comments_unselect.png')}></Image>
                  <Text style={styles.threelikeT}>{this.props.commentCount?this.props.commentCount:0}</Text>
                </View>
              </View>
            </View>
          )
          break
      }
    }
  }


  render() {
    return (
      <View style={{marginBottom: normalizeH(15)}}>
        {this.renderArticles()}
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
//  let articleItem = getArticleItem(state,ownProps.articleId,ownProps.categoryId)
  //let likerList = getLikerList(state,ownProps.articleId,ownProps.categoryId)
  let commentList = getcommentList(state,ownProps.articleId,ownProps.categoryId)
  let commentCount = getcommentCount(state,ownProps.articleId,ownProps.categoryId)
  let upCount = getUpCount(state,ownProps.articleId,ownProps.categoryId)
  //console.log('articleItem=======>',articleItem)
 // console.log('likerList=======>',likerList)
 // console.log('commentList=======>',commentList)
  let isUp = getIsUp(state,ownProps.articleId)
  console.log('isUp=======>',isUp)
  return{
    // likerList: likerList,
    commentList: commentList,
    upCount: upCount,
    isUp: isUp,
   // articleItem : articleItem,
    commentCount:commentCount
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
 // fetchLikers,
  fetchCommentsArticle,
  fetchCommentsCount,
  fetchUpCount,
  fetchIsUP,
  upArticle,
  unUpArticle,
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(ArticleShow)


const styles = StyleSheet.create(
  {
    container: {
      flex: 1,
      alignItems: 'stretch',
      backgroundColor: '#F5FCFF'
    },
    oneImage: {
      backgroundColor: '#FFFFFF',
      height: normalizeH(137),
      width: PAGE_WIDTH,
      flexDirection: 'row',
    },
    threeImage: {
      marginLeft: normalizeW(6),
      //marginRight: normalizeW(10),
      height: normalizeH(117),
      width: normalizeW(117),
    },
    image: {
      marginTop: normalizeH(10),
      marginLeft: normalizeW(10),
      //marginRight: normalizeW(10),
      marginBottom: normalizeH(10),
      height: normalizeH(117),
      width: normalizeW(117),
    },
    oneArticleInfo: {
      flex: 1,
      marginTop: normalizeH(10),
      marginLeft: normalizeW(10),
    },
    oneTitle: {
      height: normalizeH(40),
      width: normalizeW(260),
    },
    oneAuthor: {
      flexDirection: 'row',
      height: normalizeH(40),
      width: normalizeW(260),
      borderBottomWidth: normalizeW(1),
      borderBottomColor: '#E6E6E6',
      alignItems: 'center',
    },
    comment: {
      height: normalizeH(40),
      width: normalizeW(150),
    },
    threeArticleInfo: {
      // marginLeft:normalizeW(6),
      flexDirection: 'row',
      width: PAGE_WIDTH,
      alignItems: 'center'
    },
    threeAvatar: {
      borderRadius: normalizeW(15),
      height: normalizeH(30),
      width: normalizeW(30),
      overflow: 'hidden',
      marginTop: normalizeH(6),
      marginLeft: normalizeW(6),
      marginRight: normalizeW(6),
      marginBottom: normalizeH(10)
    },
    threeTitle: {
      marginTop: normalizeH(10),
      marginLeft: normalizeW(10),
      marginBottom: normalizeH(12),
      fontSize: normalizeW(17),
      color: '#636363'
    },
    threelike:{
      marginLeft:normalizeW(28),
      marginTop:normalizeH(15),
      marginBottom:normalizeH(13),
      height:normalizeH(22),
      width:normalizeW(25),
    },
    threelikeT:{
      marginTop: normalizeW(5),
      color:'#B6B6B6',
      fontSize:em(11),
    }

  }
)
