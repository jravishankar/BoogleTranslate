import React from 'react';
import {TextInput} from 'react-native';

export default class NewChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: this.navigation.props.getParam('uid', "None"),
    }
  }

  render() {

    return(
      <View style={styles.view}>
        <TextInput
         placeholder="Type user id here!"
         editable = {true}
         onChangeText={(text) => this.setState({dest: text})}
         />
        <TextInput
         placeholder="Type message here!"
         editable = {true}
         onChangeText={(text) => this.setState({msg: text})}
         />
       </View>
    )
  }

}
