import React, {Component} from 'react';
import db from "./Database.js";
import { Text, View, StyleSheet } from 'react-native';
import {Button} from 'react-native-elements';
import {NavigationEvents} from 'react-navigation';

export default class Loading extends Component {

  verifyUser() {

      db.auth().onAuthStateChanged(user => {
        console.log(user);
        if (user != null) {
            const userInfo = user["providerData"][0];
            const userID = user["uid"];

            db.database().ref('users/' + userID).once('value')
              .then((snap) => {

                if(snap.exists()) {
                  console.log(snap);
                  this.props.navigation.navigate('Main', {
                    name: userInfo["displayName"],
                    uid: userID,
                    photoURL: userInfo["photoURL"]
                   });
                } else {
                  this.props.navigation.navigate('SelectLang');
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
    backgroundColor: "#fff",
     justifyContent: "center",
     alignItems: "center"
 },
});
