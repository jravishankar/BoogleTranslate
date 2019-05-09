import React from 'react';
import { Button, View, Text, Picker, StyleSheet, TouchableOpacity, Image} from 'react-native';
import { FileSystem, Permissions, Audio } from 'expo';
import { GiftedChat } from "react-native-gifted-chat";
import { Composer } from 'react-native-gifted-chat'
import db from "./Database.js";



export default class Main extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      lang: this.props.navigation.getParam('lang', "en"),
      uid: this.props.navigation.getParam('uid', "None"),
      photoURL: this.props.navigation.getParam('photoURL', "None"),
      name: this.props.navigation.getParam('name', "None"),
      users: [],
    }


  }

  async facebookLogout() {
    try {
        await db.auth().signOut();
        this.props.navigation.navigate('Login');
    } catch (e) {
        console.log(e);
    }
  }


  render() {
    const { lang, uid, name, photoURL } = this.state;
    return (
      <View style={styles.view}>
        <Image style={styles.image} source={{uri: photoURL}} />
        <Text style={styles.displayName}>{name}</Text>
        <View style={styles.separatorLine} />
        <TouchableOpacity style={styles.greenStyle} full rounded onPress={() => this.props.navigation.navigate('ChatMenu', {uid: uid, lang: lang, name: name, photoURL: photoURL})}>
          <Text style={styles.login}>Chats</Text>
        </TouchableOpacity>
        <View style={styles.separatorLine} />
        <TouchableOpacity style={styles.greenStyle} full rounded onPress={() => this.props.navigation.navigate('SelectLang', {lang: lang, uid: uid, name: name, photoURL: photoURL})}>
          <Text style={styles.login}>Change Language</Text>
          <Text style={styles.login}>Currently: {lang}</Text>
        </TouchableOpacity>
        <View style={styles.separatorLine} />
        <TouchableOpacity style={styles.redStyle} full rounded onPress={() => this.facebookLogout()}>
          <Text style={styles.login}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    alignItems: 'center',

  },
  view: {
    flex: 1,
    backgroundColor: "#abb7cc",
     justifyContent: "center",
     alignItems: "center"
 },

  output: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 26,

  },

  inout: {
    justifyContent: 'center',
  },
  blueStyle: {
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#fff',
    height: 50,
    width: 100,
    borderRadius: 5,
    margin: 5,
    backgroundColor: '#485a96',
    justifyContent: 'center',
  },
  greenStyle: {
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#fff',
    height: 100,
    width: 150,
    borderRadius: 5,
    margin: 5,
    backgroundColor: '#52c450',
    justifyContent: 'center',
  },
  redStyle: {
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#fff',
    height: 100,
    width: 150,
    borderRadius: 10,
    margin: 5,
    backgroundColor: 'red',
    justifyContent: 'center',
  },
  textStyle: {
   marginBottom: 4,
   marginRight: 20,
   textAlign: 'center',
   fontFamily: 'Times New Roman',
  },
  buttonStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  separatorLine: {
    backgroundColor: '#abb7cc',
    width: 1,
    height: 20,
    color: "#abb7cc"
  },
  playback: {
    marginBottom: 4,
    marginRight: 20,
    textAlign: 'center',
    fontFamily: 'Times New Roman',
    fontWeight: 'bold',
    fontSize: 26,
    color: 'red',
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 20
  },
  displayName: {
    fontWeight: 'bold',
    fontSize: 22,
    marginTop: 20
  }
});
