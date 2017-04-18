/**
 * Created by yangyang on 2017/3/27.
 */
import {selectShopDetail} from './shopSelector'
import {selectUserInfoById} from './authSelector'

export function inviteCode(state) {
  let code = state.PROMOTER.get('inviteCode')
  return code
}

export function activePromoter(state) {
  let activeId = state.PROMOTER.get('activePromoter')
  return activeId
}

export function getPromoterById(state, id) {
  let promoter = state.PROMOTER.getIn(['promoters', id])
  if (promoter) {
    return promoter.toJS()
  }
  return undefined
}

export function selectPromoterByUserId(state, userId) {
  let promoterId = state.PROMOTER.getIn(['userToPromoter', userId])
  if (promoterId) {
    let promoter = getPromoterById(state, promoterId)
    return promoter
  }
  return undefined
}

export function isPromoterPaid(state, id) {
  let promoter = getPromoterById(state, id)
  if (promoter) {
    return promoter.payment
  }
  return 0
}

export function getTenantFee(state) {
  let fee = state.PROMOTER.get('fee')
  return fee
}

export function getUpPromoterId(state) {
  let upPromoterId = state.PROMOTER.get('upPromoterId')
  return upPromoterId
}

export function getTeamMember(state, promoterId) {
  let team = []
  let teamArray = state.PROMOTER.getIn(['team', promoterId])
  if (!teamArray) {
    return team
  }
  teamArray.forEach((memPromoterId) => {
    let promoter = getPromoterById(state, memPromoterId)
    if (promoter) {
      team.push(promoter)
    }
  })
  return team
}

export function getInvitedShop(state, promoterId) {
  let shops = []
  let shopArray = state.PROMOTER.getIn(['invitedShops', promoterId])
  if (!shopArray) {
    return shops
  }
  shopArray.forEach((shopId) => {
    let shop = selectShopDetail(state, shopId)
    if (shop) {
      shops.push(shop)
    }
  })
  return shops
}

export function selectPromoterIdentity(state, id) {
  let promoter = getPromoterById(state, id)
  if (promoter) {
    return promoter.identity
  }
  return undefined
}

export function selectPromoterStatistics(state, area) {
  let stat = state.PROMOTER.getIn(['statistics', area])
  if (stat) {
    return stat.toJS()
  }
  return undefined
}

export function selectAreaAgents(state) {
  let agents = state.PROMOTER.get('areaAgents')
  let retAgents = []
  agents.forEach((agentRecord) => {
    let tmpAgent = {}
    let agent = agentRecord.toJS()
    tmpAgent.area = agent.area
    tmpAgent.tenant = agent.tenant
    if (agent.userId) {
      let userInfo = selectUserInfoById(state, agent.userId)
      tmpAgent.userId = userInfo.id
      tmpAgent.avatar = userInfo.avatar
      tmpAgent.nickname = userInfo.nickname
    }
    if (agent.promoterId) {
      let promoter = getPromoterById(state, agent.promoterId)
      tmpAgent.promoter= promoter
    }
    retAgents.push(tmpAgent)
  })
  return retAgents
}

export function selectCityTenant(state, city) {
  let tenant = state.PROMOTER.getIn(['shopTenant', city])
  if (tenant) {
    return tenant
  }
  return undefined
}

export function selectAreaPromoters(state) {
  let promoters = state.PROMOTER.get('areaPromoters')
  return promoters.toJS()
}