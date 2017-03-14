/**
 * Created by wuxingyu on 2016/12/21.
 */
import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Platform,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  ScrollView,
} from 'react-native'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import Symbol from 'es6-symbol'
import Header from '../common/Header'
import {em, normalizeW, normalizeH, normalizeBorder} from '../../util/Responsive'
import {publishTopicFormData, TOPIC_FORM_SUBMIT_TYPE} from '../../action/topicActions'
import {getTopicCategories} from '../../selector/configSelector'
import CommonTextInput from '../common/Input/CommonTextInput'
import ModalBox from 'react-native-modalbox';
import {Actions} from 'react-native-router-flux'
import * as Toast from '../common/Toast'
import {isUserLogined, activeUserInfo} from '../../selector/authSelector'
import ArticleEditor from '../common/Input/ArticleEditor'
import TimerMixin from 'react-timer-mixin'
import THEME from '../../constants/themes/theme1'


const PAGE_WIDTH = Dimensions.get('window').width
const PAGE_HEIGHT = Dimensions.get('window').height

let topicForm = Symbol('topicForm')
const topicName = {
  formKey: topicForm,
  stateKey: Symbol('topicName'),
  type: "topicName",
}

const topicContent = {
  formKey: topicForm,
  stateKey: Symbol('topicContent'),
  type: 'topicContent',
}

const rteHeight = {
  ...Platform.select({
    ios: {
      height: normalizeH(64),
    },
    android: {
      height: normalizeH(44)
    }
  })
}

class PublishTopics extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isDisabled: false,
      selectedTopic: undefined,
      rteFocused: false,    // 富文本获取到焦点
      shouldUploadImgComponent: false,
      extraHeight: rteHeight.height,
      showEditorToolbar: true,
    };
    this.insertImages = []
    this.leanImgUrls = []
    this.isPublishing = false
  }

  submitSuccessCallback(context) {
    this.isPublishing = false
    Toast.show('恭喜您,发布成功!')
    Actions.pop()
  }

  submitErrorCallback(error) {
    Toast.show(error.message)
  }

  uploadImgComponentCallback(leanImgUrls) {
    this.leanImgUrls = leanImgUrls
    this.publishTopic()
  }

  onButtonPress = () => {
    if (this.props.isLogin) {
      if (this.state.selectedTopic) {
        if (this.insertImages && this.insertImages.length) {
          if (this.isPublishing) {
            return
          }
          this.isPublishing = true
          Toast.show('开始发布...', {
            duration: 1000,
            onHidden: ()=> {
              this.setState({
                shouldUploadImgComponent: true
              })
            }
          })
        } else {
          if (this.isPublishing) {
            return
          }
          this.isPublishing = true
          Toast.show('开始发布...', {
            duration: 1000,
            onHidden: ()=> {
              this.publishTopic()
            }
          })
        }
      }
      else {
        Toast.show("请选择一个话题")
      }
    }
    else {
      Actions.LOGIN()
    }
  }

  publishTopic() {
    this.props.publishTopicFormData({
      formKey: topicForm,
      images: this.leanImgUrls,
      categoryId: this.state.selectedTopic.objectId,
      userId: this.props.userInfo.id,
      submitType: TOPIC_FORM_SUBMIT_TYPE.PUBLISH_TOPICS,
      success: ()=> {
        this.submitSuccessCallback(this)
      },
      error: this.submitErrorCallback
    })
  }

  componentDidMount() {
    if (this.props.topicId && this.props.topicId.objectId) {
      this.setState({selectedTopic: this.props.topicId});
    }
  }

  openModal() {
    Keyboard.dismiss()
    this.refs.modal3.open();
  }

  closeModal(value) {
    this.setState({selectedTopic: value})
    this.refs.modal3.close();
  }

  renderTopicsSelected() {
    if (this.props.topics) {
      return (
        this.props.topics.map((value, key)=> {
          if (value && value.objectId) {
            return (
              <View key={key} style={styles.modalTopicButtonStyle}>
                <TouchableOpacity style={styles.modalTopicStyle}
                                  onPress={()=>this.closeModal(value)}>
                  <Text style={styles.ModalTopicTextStyle}>
                    {value.title}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          }
        })
      )
    }
  }

  renderSelectedTopic() {
    if (this.state.selectedTopic) {
      return (
        <View style={styles.selectedTopicStyle}>
          <Text style={styles.selectedTopicTextStyle}>
            {this.state.selectedTopic.title}
          </Text>
        </View>
      )
    }
    else {
      return (
        <View/>
      )
    }
  }

  getRichTextImages(images) {
    this.insertImages = images
    // console.log('images list', this.insertImages)
  }

  renderArticleEditorToolbar() {
    return (
      <View style={{width: normalizeW(64), backgroundColor: THEME.base.mainColor}}>
        <TouchableOpacity onPress={() => {}}
                          style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{fontSize: 15, color: 'white', lineHeight: 15}}>发布</Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderRichText() {
    return (
      <ArticleEditor
        {...topicContent}
        wrapHeight={this.state.extraHeight}
        toolbarController={this.state.showEditorToolbar}
        renderCustomToolbar={() => {return this.renderArticleEditorToolbar()}}
        getImages={(images) => this.getRichTextImages(images)}
        shouldUploadImgComponent={this.state.shouldUploadImgComponent}
        uploadImgComponentCallback={(leanImgUrls)=> {
          this.uploadImgComponentCallback(leanImgUrls)
        }}
        onFocusEditor={() => {}}
        onBlurEditor={() => {}}
        placeholder="分享吃喝玩乐、共享周边生活信息"
      />
    )
  }

  render() {
    return (
      <View style={styles.container}>

        <Header
          leftType="icon"
          leftIconName="ios-arrow-back"
          leftPress={() => Actions.pop()}
          title="发布话题"
          rightType="text"
          rightText="发布"
          rightPress={() => this.onButtonPress()}
        />

        <View style={styles.body}>

          <View>
            <View onLayout={(event) => {this.setState({extraHeight: rteHeight.height + event.nativeEvent.layout.height})}}>
              <View style={styles.toSelectContainer}>
                <Text style={{fontSize: 15, color: '#5a5a5a', paddingLeft: normalizeW(10), paddingRight: normalizeW(18), alignSelf: 'center'}}>主题板块</Text>
                <TouchableOpacity style={styles.selectBtnView} onPress={this.openModal.bind(this)}>
                  {this.renderSelectedTopic()}
                  <Image style={styles.imageStyle} source={require("../../assets/images/PinLeft_gray.png")}/>
                </TouchableOpacity>
              </View>
              <View>
                <CommonTextInput maxLength={36}
                                 autoFocus={true}
                                 containerStyle={styles.titleContainerStyle}
                                 inputStyle={styles.titleInputStyle}
                                 clearBtnStyle={styles.titleCleanBtnStyle}
                                 {...topicName}
                                 onFocus={() => {this.setState({showEditorToolbar: false})}}
                                 onBlur={() => {this.setState({showEditorToolbar: true})}}
                                 placeholder="标题"/>
              </View>
            </View>

            {this.renderRichText()}
          </View>

          <ModalBox style={styles.modalStyle} entry='top' position="top" ref={"modal3"}>
            <ScrollView style={{flex: 1, height: PAGE_HEIGHT}}>
              <Text style={styles.modalShowTopicsStyle}>选择一个主题</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start'}}>
                {this.renderTopicsSelected()}
              </View>
            </ScrollView>
          </ModalBox>

        </View>
      </View>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const topics = getTopicCategories(state)
  const isLogin = isUserLogined(state)
  const userInfo = activeUserInfo(state)
  return {
    topics: topics,
    isLogin: isLogin,
    userInfo: userInfo
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  publishTopicFormData
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(PublishTopics)

Object.assign(PublishTopics.prototype, TimerMixin)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  body: {
    ...Platform.select({
      ios: {
        marginTop: normalizeH(64),
      },
      android: {
        marginTop: normalizeH(44)
      }
    }),
    height: PAGE_HEIGHT,
    width: PAGE_WIDTH
  },

  //选择话题的对话框的样式
  toSelectContainer: {
    height: normalizeH(59),
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  selectBtnView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedTopicStyle: {
    borderWidth: 1,
    borderStyle: 'solid',
    backgroundColor: 'white',
    height: normalizeH(29),
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRadius: 5,
    borderColor: THEME.base.mainColor,
  },
  selectedTopicTextStyle: {
    fontSize: em(15),
    color: THEME.base.mainColor,
    marginLeft: normalizeW(16),
    marginRight: normalizeW(16),
    alignSelf: 'center',
  },
  imageStyle: {
    marginRight: normalizeH(20),
    width: normalizeW(13),
    height: normalizeH(22),
  },
  titleContainerStyle: {
    flex: 1,
    height: normalizeH(59),
    paddingLeft: 0,
    paddingRight: 0,
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderBottomColor: '#F5F5F5',
  },
  titleInputStyle: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    color: '#5a5a5a',
  },
  titleCleanBtnStyle: {
    position: 'absolute',
    right: normalizeW(25),
    top: normalizeH(17),
  },
  //modal 所有子组件的样式
  modalStyle: {
    width: PAGE_WIDTH,
    backgroundColor: '#f5f5f5',
    height: PAGE_HEIGHT,
    alignItems: 'flex-start',
  },
  modalTextStyle: {
    marginTop: normalizeH(17),
    marginBottom: normalizeH(18),
    alignSelf: 'center',
    color: "#5a5a5a",
    fontSize: em(12)
  },
  modalShowTopicsStyle: {
    marginTop: normalizeH(17),
    marginBottom: normalizeH(18),
    alignSelf: 'center',
    color: "#4a4a4a",
    fontSize: em(12)
  },
  modalTopicButtonStyle: {
    alignItems: 'flex-start',
    marginLeft: normalizeW(15),
    marginBottom: normalizeH(20)
  },
  modalTopicStyle: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#E9E9E9',
    height: normalizeH(41),
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRadius: 5
  },
  ModalTopicTextStyle: {
    fontSize: em(17),
    color: "#5a5a5a",
    paddingLeft: normalizeW(16),
    paddingRight: normalizeW(16),
    justifyContent: 'center',
    alignItems: 'center',
  },

})