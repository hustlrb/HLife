import React, {Component} from 'react'
import {AsyncStorage} from 'react-native'
import {Actions, Scene, Switch, ActionConst, Modal} from 'react-native-router-flux'

import Launch from '../components/Launch'
import Home from '../components/Home'
import Login from '../components/Login'
import Regist from '../components/Login/Regist'
import RegVerifyCode from '../components/Login/RegVerifyCode'
import FindPwdVerifyCode from '../components/Login/FindPwdVerifyCode'
import RetrivevePassword from '../components/Login/RetrievePassword'
import SetPsw from '../components/Login/SetPsw/index'

export const scenes = Actions.create(
  <Scene key="root" hideNavBar={true}>
    <Scene key="LAUNCH" component={Launch} />
    <Scene key="HOME" component={Home} />
    <Scene key="LOGIN" component={Login} initial={true}/>
    <Scene key="REGIST" component={Regist} />
    <Scene key="REGVERIFYCODE" component={RegVerifyCode} />
    <Scene key="RETRIEVE_PASSWORD" component={RetrivevePassword} />
    <Scene key="SETPSW" component={SetPsw}/>
    <Scene key="FIND_PWD_VERIFY_CODE" component={FindPwdVerifyCode}/>
  </Scene>
)
