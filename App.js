import React, {Component} from 'react';
// import { StyleSheet, Text, View, TouchableOpacity} from "react-native";
// import { Container, Form, Button} from "native-base";
// import * as firebase from "firebase";
// import { Facebook } from "expo";
// import SelectLang from "./SelectLang.js"
// import Main from "./Main.js"
// //import MainMenu from "./MainMenu.js"
//
// // Import the screens
import Main from './Main.js';
import Loading from './Loading.js';
import Login from './Login.js';
import SelectLang from './SelectLang.js';
import {YellowBox } from "react-native";

YellowBox.ignoreWarnings([
    'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
]);
// Import React Navigation
import { createStackNavigator, createAppContainer } from 'react-navigation'
// Create the navigator
const navigator = createStackNavigator({
  Main: { screen: Main,
          navigationOptions:  {
             title: 'MainMenu',
             headerLeft: null
          }},

  Loading: { screen: Loading,
             navigationOptions:  {
                title: 'Loading BoogleTranslate',
                headerLeft: null
             }},
  Login: { screen: Login,
            navigationOptions:  {
               title: 'Login',
               headerLeft: null
            }},
  SelectLang: { screen: SelectLang,
                navigationOptions:  {
                   title: 'Language',
                   headerLeft: null
                }},

 }, {initialRouteName: 'Loading'}
);

const Interface = createAppContainer(navigator);
// Export it as the root component
const App = () => {
  return(
    <Interface/>
  )
};
export default App
