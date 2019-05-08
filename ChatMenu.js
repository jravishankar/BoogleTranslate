import React from 'react';
import db from "./Database.js";
import { Button, View, Text, Picker, StyleSheet, TouchableOpacity, Image} from 'react-native';
import { NavigationEvents } from 'react-navigation';

export default class ChatMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: this.navigation.props.getParam('uid', "None"),
      loading: true,
      chats: [],
    }

  }

  componentDidMount() {

    db.database().ref('users/' + this.state.uid ).on('value', (snap) => {
      if (snap.child("chats").exists()){
        const chats = snap.child("chats").val()
        this.setState({loading: false, chats: chats});
      }
      else {
        db.database().ref('users/' + this.state.uid).set({
          chats: []
        });
      }
    });

  }

  render() {
    const { loading, uid } = this.state;
    return(
      <View style={styles.view}>
        {!loading && <TouchableOpacity onPress={() => this.props.navigation.navigate('NewChat', {uid:uid})}> Start New Chat! </TouchableOpacity>}
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
});
