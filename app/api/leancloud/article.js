/**
 * Created by lilu on 2016/12/29.
 */

import {ArticleItem, LikersItem,ArticleComment,Up} from '../../models/ArticleModel'
import AV from 'leancloud-storage'
import {Map, List, Record} from 'immutable'

export function getArticle(payload) {
  let query = new AV.Query('Articles')
  if (payload) {
    let categoryId = payload
    let articleCategory = AV.Object.createWithoutData('ArticleCategory', categoryId)
   // console.log('getLikers.category=====', articleCategory)
    query.equalTo('Category', articleCategory)
    query.include(['user'])
    query.descending('createdAt')
  }
  return query.find().then((results) => {
    let article = []
    results.forEach((result) => {
      article.push(ArticleItem.fromLeancloudObject(result))

    })

    return new List(article)
  }, (err) => {
    err.message = ERROR[err.code] ? ERROR[err.code] : ERROR[9999]
    throw err
  })
}

export function getUps(payload) {
  let articleId = payload.articleId
  let upType = payload.upType
  let query = AV.query('Up')
  query.equalTo('targetId', articleId)
  query.equalTo('upType', upType)
  query.equalTo('status', true)

  return query.find().then((results) => {
    let ups = []
    results.forEach((result) => {
      ups.push(Up.fromLeancloudObject(result))
    })
    return new List(ups)
  },(err) => {
    err.message = ERROR[err.code] ? ERROR[err.code] : ERROR[9999]
    throw err
  })

}

export function getCommentCount(payload) {
  let article = AV.Object.createWithoutData('Articles',payload)
  let relation = article.relation('comments')
  let query = relation.query()
  return query.count().then(function (results) {
    console.log('count==>',results)
   return results
  }, function (err) {
    err.message = ERROR[err.code] ? ERROR[err.code] : ERROR[9999]
    throw err
  })
}

export function getUpCount(payload) {
  let articleId = payload.articleId
  let upType = payload.upType
  let query = new AV.Query('Up')
  query.equalTo('upType', upType)
  query.equalTo('targetId', articleId)
  query.equalTo('status', true)
  return query.count().then((results)=> {
    return results
  }, function (err) {
    err.message = ERROR[err.code] ? ERROR[err.code] : ERROR[9999]
    throw err
  })
}

export function getIsUps(payload) {
  let articleId = payload.articleId
  let upType = payload.upType
  let currentUser = AV.User.current()
  let query = new AV.Query('Up')
  query.equalTo('targetId', articleId)
  query.equalTo('upType', upType)
  query.equalTo('user', currentUser)
  query.include('user')
  return query.first().then((result) =>{
    let userUpShopInfo = undefined
    if(result && result.attributes) {
      userUpShopInfo = Up.fromLeancloudObject(result)
    }
    return userUpShopInfo
  }, function (err) {
    err.message = ERROR[err.code] ? ERROR[err.code] : ERROR[9999]
    throw err
  })
}


export function upArticle(payload) {
  let articleId = payload.articleId
  let upType = payload.upType
  let currentUser = AV.User.current()
  return getIsUps(payload).then((userLikeTopicInfo) => {
    if (!userLikeTopicInfo) {
      let Up = AV.Object.extend('Up')
      let up = new Up()
      up.set('targetId', topicId)
      up.set('upType', upType)
      up.set('user', currentUser)
      return up.save()
    }
    else if (userLikeTopicInfo.id && !userLikeTopicInfo.status) {
      let up = AV.Object.createWithoutData('Up', userLikeTopicInfo.id)
      up.set('status', true)
      return up.save()
    }
    return {
      code: '10107',
      message: '您已经赞过该话题了'
    }
  }).then((result) => {
    if (result && '10107' == result.code) {
      return result
    }
    return {
      articleId: articleId,
      code: '10108',
      message: '成功点赞'
    }
  }).catch((err) => {
    err.message = ERROR[err.code] ? ERROR[err.code] : ERROR[9999]
    throw err
  })
}

export function unUpArticle(payload) {
  let articleId = payload.articleId
  return getIsUps(payload).then((userLikeTopicInfo) => {
    if (userLikeTopicInfo && userLikeTopicInfo.id) {
      let up = AV.Object.createWithoutData('Up', userLikeTopicInfo.id)
      up.set('status', false)
      return up.save()
    }
    return {
      code: '10009',
      message: '您还没有赞过该话题'
    }
  }).then((result) => {
    if (result && '10009' == result.code) {
      return result
    }
    return {
      articleId: articleId,
      code: '10010',
      message: '取消点赞成功'
    }
  }).catch((err) => {
    err.message = ERROR[err.code] ? ERROR[err.code] : ERROR[9999]
    throw err
  })
}

//根据ARTICLE的RELATION进行查询
export function getComment(payload) {
  let article = AV.Object.createWithoutData('Articles',payload)
  let relation = article.relation('comments')
  let query = relation.query()
  return query.find().then(function (results) {

    let comment = []
    results.forEach((result) => {
     // console.log('articleItem====>',result)

      comment.push(ArticleComment.fromLeancloudObject(result))
    })

    return new List(comment)
  }, function (err) {
    err.message = ERROR[err.code] ? ERROR[err.code] : ERROR[9999]
    throw err
  })
}

export function publishComment(payload) {
  let comments = AV.Object.extend('ArticleComment')
  let comment = new comments()

  var articleId = AV.Object.createWithoutData('Articles', payload.articleId);
  comment.set('author',payload.author)
  comment.set('articleId', articleId);
  comment.set('replyId', payload.replyId)
  comment.set('content', payload.content)

  return comment.save().then(function (comment) {
  }, function (err) {
    err.message = ERROR[err.code] ? ERROR[err.code] : ERROR[9999]
    throw err
  })
}