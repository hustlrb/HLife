/**
 * Created by wuxingyu on 2016/12/9.
 */
import React, {Component} from 'react'
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  InteractionManager,
  TouchableHighlight
} from 'react-native'
import {Actions} from 'react-native-router-flux'
import Header from '../common/Header'
import {getTopic} from '../../selector/configSelector'
import {getTopicArticles} from '../../selector/topicSelector'
import {fetchTopicArticles} from '../../action/topicActions'

import {TabScrollView} from '../common/TabScrollView'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {TopicShow} from './TopicShow'

const PAGE_WIDTH = Dimensions.get('window').width
const PAGE_HEIGHT = Dimensions.get('window').height

export class Find extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedTab: 0,
    }
  }

  getSelectedTab(index) {
    this.setState({selectedTab: index})
    InteractionManager.runAfterInteractions(() => {
      this.props.fetchTopicArticles({categoryId: this.props.topics[index].objectId})
    })
  }

  renderTopicItem(value) {
    return (
      <TopicShow containerStyle={{marginBottom: 10}}
                 content={value.content}
                 imgGroup={value.imgGroup}/>
    )
  }

  renderTopicPage() {
    if (this.props.topicArticles) {
      return (
        this.props.topicArticles.map((value, key)=> {
          return (
            this.renderTopicItem(value)
          )
        })
      )
    }
  }

  render() {
    let topicId = this.props.topics[this.state.selectedTab]
    return (
      <View style={styles.container}>
        <Header
          leftType="none"
          title="发现"
          rightType="none"
        />
        <TabScrollView topics={this.props.topics}
                       topicId={this.props.topicId}
                       onSelected={(index) => this.getSelectedTab(index)}
                       renderTopicPage={() => this.renderTopicPage()}/>
        <TouchableHighlight underlayColor="transparent" style={styles.buttonImage} onPress={()=> {
          Actions.PUBLISH({topicId})
        }}>
          <Image source={require("../../assets/images/local_write@2x.png")}/>
        </TouchableHighlight>
      </View>
    )
  }
}

const mapStateToProps = (state, ownProps) => {

  const topics = getTopic(state, true)
  const topicArticles = getTopicArticles(state)
  console.log("=+++++>>>>",topicArticles)
  return {
    topics: topics,
    topicArticles: topicArticles
  }
}

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchTopicArticles
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Find)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  buttonImage: {
    position: 'absolute',
    alignItems: 'flex-end',
    right: 20,
    bottom: 61,
    height: 45,
    width: 45
  }
})