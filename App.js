import React from "react";
import { StyleSheet, Text, View} from "react-native";
import { Container, Form, Button} from "native-base";
import * as firebase from "firebase";
import { Facebook } from "expo";

const firebaseConfig = {
  apiKey: "AIzaSyC1loM_GSHPGQ9hoYyRA_htxsLnmDnwb4g",
  authDomain: "boogletranslate-fe8ae.firebaseapp.com",
  databaseURL: "https://boogletranslate-fe8ae.firebaseio.com",
  projectId: "boogletranslate-fe8ae",
  storageBucket: "boogletranslate-fe8ae.appspot.com",
  messagingSenderId: "1072846869412",
};

firebase.initializeApp(firebaseConfig);

export default class Main extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      language: "en"
    }

    this.storeLanguage = this.storeLanguage.bind(this);
  }

  async facebookLogin() {
    const { type, token } = await
    Facebook.logInWithReadPermissionsAsync(
      "835368136823240",{
          permission: "public_profile"
      }
    );

    if (type == "success") {
    const credential =
      firebase
        .auth
        .FacebookAuthProvider
        .credential(token);

    firebase
     .auth().signInAndReceiveDataWithCredential(credential).catch(error => {
         console.log(error);
      });
    }
  }


  storeLanguage(userId, lang) {
    this.setState({language: lang});
    firebase.database().ref('users/' + userId).set({
      language: lang
    });
  }


  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user != null) {
          console.log(user);
      }
    });


  }

  render() {
    return (
      <Container style={styles.container} >
        <Form>
          <Button full rounded onPress={() => {this.facebookLogin()}}>
            <Text>Login with Facebook</Text>
          </Button>
        </Form>
      </Container>
    );
  }
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
       justifyContent: "center"
   }
});
