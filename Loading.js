import React, {Component} from 'react';
import db from "./Database.js";
import { Text, View, StyleSheet } from 'react-native';
import {Button} from 'react-native-elements';
import {NavigationEvents} from 'react-navigation';

export default class Loading extends Component {

  async verifyUser() {
      db.auth().onAuthStateChanged(user => {
        console.log(user);
        if (user != null) {
            const userInfo = user["providerData"][0]
            const photoURL = userInfo["photoURL"];
            const userID = user["uid"];
            const name = userInfo["displayName"];

            db.database().ref('users/' + userID).once('value')
              .then((snap) => {
                if(snap.exists()  ) {
                  console.log(snap);
                  const language = snap.child("language").val();
                  this.props.navigation.navigate('Main', {
                    name: name,
                    uid: userID,
                    photoURL: photoURL,
                    lang: language
                   });
                } else {
                  this.props.navigation.navigate('SelectLang', {uid: userID, name: name, photoURL: photoURL, lang: "en"});
                }

              })
              .catch((e) => console.log(e));
        } else {
            this.props.navigation.navigate('Login');
          }

    });
  }

  render() {
    return (
      <View style={styles.view}>
        <Button loading={true}></Button>
        <NavigationEvents onDidFocus={() => this.verifyUser()} />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: "#abb7cc",
     justifyContent: "center",
     alignItems: "center"
 },
});
