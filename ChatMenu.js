import React from 'react';
import db from "./Database.js";
import { View, Text, Picker, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {Button} from 'react-native-elements';

export default class ChatMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: this.props.navigation.getParam('uid', "None"),
      loading: false,
      chats: [],
      lang: this.props.navigation.getParam('lang', "en")
    }

  }

  componentDidMount() {
    //
    // db.database().ref('users/' + this.state.uid + "/chats").on('value', (snap) => {
    //   console.log("listening");
    //   console.log(snap);
    //   const chats = snap.child("chats").val()
    //   this.setState({loading: false, chats: chats});
    // });


  }

  render() {
    const { loading, uid } = this.state;
    return(
      <View style={styles.view}>
        {!loading && <TouchableOpacity style={styles.blueStyle} onPress={() => this.props.navigation.navigate('NewChat', {uid:uid})}></TouchableOpacity>}
        {loading && <Button loading={true}></Button>}
      </View>
    )
  }


}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: "#abb7cc",
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
});
