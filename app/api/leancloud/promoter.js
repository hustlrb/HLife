/**
 * Created by yangyang on 2017/3/24.
 */
import AV from 'leancloud-storage'
import ERROR from '../../constants/errorCode'
import * as AVUtils from '../../util/AVUtils'

export function generateInviteCode() {
  return AV.Cloud.run('utilGetInvitationCode').then((result) => {
    return result
  }, (err) => {
    throw err
  })
}

export function promoterCertification(payload) {
  let params = {
    inviteCode: payload.inviteCode,
    name: payload.name,
    phone: payload.phone,
    cardId: payload.cardId,
    liveProvince: payload.liveProvince,
    liveCity: payload.liveCity,
    liveDistrict: payload.liveDistrict,
  }
  return AV.Cloud.run('promoterCertificate', params).then((promoterInfo) => {
    return promoterInfo
  }, (err) => {
    throw err
  })
}

export function fetchPromterByUser(payload) {
  let userId = payload.userId
  let params = {
    userId,
  }
  return AV.Cloud.run('promoterFetchByUser', params).then((promoter) => {
    return promoter
  }, (err) => {
    throw err
  })
}