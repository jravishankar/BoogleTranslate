import { Button, View, Text, Picker, StyleSheet, TouchableOpacity} from 'react-native';
import React, {Component} from "react";
import db from "./Database.js";

export default class SelectLang extends Component {
    constructor(props){
      super(props);
      this.state = {
        lang: "en"
      }
    }


    storeLanguage(lang) {
      firebase.database().ref('users/' + this.state.uid).set({
        language: lang
      });
      this.props.navigation.navigate("Loading");
    }


    render() {
      return(
        <View style={styles.inout}>
          <Text style={styles.input}> Please Select Your Language </Text>
            <Picker style={styles.picker} selectedValue={this.state.lang} onValueChange={(value) => this.setState({lang: value})}>
              <Picker.Item label = "English" value = "en" />
              <Picker.Item label = "Español  (Spanish)" value = "es" />
              <Picker.Item label = "日本語    (Japanese)" value = "ja" />
              <Picker.Item label = "Русский  (Russian)" value = "ru" />
              <Picker.Item label = "Deutsch (German)" value = "de" />
            </Picker>
            <TouchableOpacity style={styles.blueStyle} onPress={() => this.storeLanguage(this.state.lang)}>
              <Text style={styles.done}> Done</Text>
            </TouchableOpacity>
        </View>

      )
    };
}


const styles = StyleSheet.create({
  inout: {
    textAlign: 'center',
    marginTop: 35,
    justifyContent: "center",
  },
  input: {
    fontWeight: 'bold',
    fontSize: 26,
  },
  done: {
    textAlign: 'center',
    justifyContent: "center",
    marginTop: 20
  },
  blueStyle: {
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#fff',
    height: 25,
    width: 200,
    borderRadius: 5,
    margin: 5,
    backgroundColor: '#4267b2',
    justifyContent: 'center',
  },

});
