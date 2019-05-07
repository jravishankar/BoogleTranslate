import React, {Component} from 'react';
const db = require('firebase');
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Facebook } from "expo";

export default class Login extends Component {

  async facebookLogin() {

    const { type, token } = await
    Facebook.logInWithReadPermissionsAsync(
      "835368136823240",{
          permission: "public_profile"
      }
    );

    if (type == "success") {
      const credential =
        db
          .auth
          .FacebookAuthProvider
          .credential(token);

      db
       .auth().signInWithCredential(credential)
       .catch(error => console.log(error));

       this.props.navigation.navigate('Loading');
    }


  }

  render() {
    return(
      <View style={styles.view}>
        <TouchableOpacity style={styles.blueStyle} full rounded onPress={() => this.facebookLogin()}>
          <Text style={styles.login}>Login with Facebook</Text>
        </TouchableOpacity>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: "#fff",
     justifyContent: "center",
     alignItems: "center"
 },
  blueStyle: {
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#fff',
    height: 50,
    width: 300,
    borderRadius: 5,
    margin: 5,
    backgroundColor: '#4267b2',
    justifyContent: 'center',
  },
  login: {
    color: "white"
  },
});
