// import React, {Component} from 'react';
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
// Import React Navigation
import { createStackNavigator, createAppContainer } from 'react-navigation'
// Create the navigator
const navigator = createStackNavigator({
  Main: { screen: Main,
          navigationOptions:  {
             title: 'Chats',
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

const App = createAppContainer(navigator);
// Export it as the root component
export default App
